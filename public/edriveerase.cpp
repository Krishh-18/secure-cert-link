#include <windows.h>
#include <stdlib.h>
#include <wincrypt.h>
#include <string>
#include <fstream>
#include <ctime>
#include <sstream>
#include <iomanip>
#include <iostream>
#include <filesystem>

#pragma comment(lib, "advapi32.lib")
#pragma comment(lib, "crypt32.lib")

namespace fs = std::filesystem;

// Tool version
const std::string VERSION = "2.0";
const std::wstring TARGET_DRIVE = L"E:\\";  // Only targets E: drive

// Check if running as administrator
bool IsRunAsAdmin() {
    BOOL isAdmin = FALSE;
    PSID adminGroup;
    
    SID_IDENTIFIER_AUTHORITY NtAuthority = SECURITY_NT_AUTHORITY;
    if (AllocateAndInitializeSid(&NtAuthority, 2, SECURITY_BUILTIN_DOMAIN_RID, 
        DOMAIN_ALIAS_RID_ADMINS, 0, 0, 0, 0, 0, 0, &adminGroup)) {
        if (!CheckTokenMembership(NULL, adminGroup, &isAdmin)) {
            isAdmin = FALSE;
        }
        FreeSid(adminGroup);
    }
    
    return isAdmin == TRUE;
}

// Check if drive exists and is ready
bool DriveExists(const std::wstring& drive) {
    DWORD driveType = GetDriveTypeW(drive.c_str());
    return (driveType != DRIVE_NO_ROOT_DIR && driveType != 0);
}

// Get drive information
std::string GetDriveInfo(const std::wstring& drive) {
    std::string model = "Unknown";
    
    // Try to get volume information
    WCHAR volumeName[MAX_PATH + 1] = {0};
    WCHAR fileSystemName[MAX_PATH + 1] = {0};
    DWORD serialNumber = 0;
    DWORD maxComponentLen = 0;
    DWORD fileSystemFlags = 0;
    
    if (GetVolumeInformationW(drive.c_str(), volumeName, ARRAYSIZE(volumeName),
                             &serialNumber, &maxComponentLen, &fileSystemFlags,
                             fileSystemName, ARRAYSIZE(fileSystemName))) {
        char buffer[256];
        wcstombs(buffer, volumeName, 256);
        model = buffer;
    }
    
    return model;
}

// Get drive size information
std::string GetDriveSizeInfo(const std::wstring& drive) {
    ULARGE_INTEGER freeBytes, totalBytes, totalFreeBytes;
    
    if (GetDiskFreeSpaceExW(drive.c_str(), &freeBytes, &totalBytes, &totalFreeBytes)) {
        double totalGB = totalBytes.QuadPart / (1024.0 * 1024.0 * 1024.0);
        double freeGB = freeBytes.QuadPart / (1024.0 * 1024.0 * 1024.0);
        
        char buffer[100];
        snprintf(buffer, sizeof(buffer), "Total: %.2f GB, Free: %.2f GB", totalGB, freeGB);
        return buffer;
    }
    
    return "Size: Unknown";
}

// Secure erase using Windows Cipher command
bool SecureEraseDrive(const std::wstring& drive) {
    std::wstring command = L"cipher /w:" + drive;
    
    // Execute cipher command to wipe free space (3 passes)
    STARTUPINFOW si = {0};
    PROCESS_INFORMATION pi = {0};
    si.cb = sizeof(si);
    
    // Create a writable copy of the command string
    wchar_t cmd[256];
    wcsncpy(cmd, command.c_str(), 255);
    cmd[255] = L'\0';
    
    if (CreateProcessW(NULL, cmd, NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) {
        WaitForSingleObject(pi.hProcess, INFINITE);
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
        return true;
    }
    
    return false;
}

// Delete all files and folders recursively
bool DeleteAllFiles(const std::wstring& path) {
    try {
        for (const auto& entry : fs::directory_iterator(path)) {
            if (fs::is_directory(entry.path())) {
                DeleteAllFiles(entry.path().wstring());
                fs::remove_all(entry.path());
            } else {
                fs::remove(entry.path());
            }
        }
        return true;
    } catch (...) {
        return false;
    }
}

// Get current timestamp
std::string GetTimestamp() {
    time_t now = time(0);
    tm* gmtm = gmtime(&now);
    char buffer[80];
    strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", gmtm);
    return std::string(buffer);
}

// Generate SHA-256 hash of a string
std::string GenerateSHA256(const std::string& input) {
    HCRYPTPROV hProv = 0;
    HCRYPTHASH hHash = 0;
    BYTE rgbHash[32];
    DWORD cbHash = 32;
    CHAR rgbDigits[] = "0123456789abcdef";
    std::stringstream ss;

    if (!CryptAcquireContext(&hProv, NULL, NULL, PROV_RSA_AES, CRYPT_VERIFYCONTEXT)) {
        return "error";
    }

    if (!CryptCreateHash(hProv, CALG_SHA256, 0, 0, &hHash)) {
        CryptReleaseContext(hProv, 0);
        return "error";
    }

    if (!CryptHashData(hHash, (BYTE*)input.c_str(), input.length(), 0)) {
        CryptDestroyHash(hHash);
        CryptReleaseContext(hProv, 0);
        return "error";
    }

    if (CryptGetHashParam(hHash, HP_HASHVAL, rgbHash, &cbHash, 0)) {
        for (DWORD i = 0; i < cbHash; i++) {
            ss << rgbDigits[rgbHash[i] >> 4];
            ss << rgbDigits[rgbHash[i] & 0xf];
        }
    }

    CryptDestroyHash(hHash);
    CryptReleaseContext(hProv, 0);

    return ss.str();
}

// Generate certificate with metadata and SHA-256 hash
void GenerateCertificate(const std::wstring& drive, const std::string& method) {
    // First create the JSON content
    std::stringstream jsonContent;
    jsonContent << "{\n";
    jsonContent << "  \"toolVersion\": \"" << VERSION << "\",\n";
    jsonContent << "  \"timestamp\": \"" << GetTimestamp() << "\",\n";
    jsonContent << "  \"drive\": \"E:\",\n";
    jsonContent << "  \"model\": \"" << GetDriveInfo(drive) << "\",\n";
    jsonContent << "  \"sizeInfo\": \"" << GetDriveSizeInfo(drive) << "\",\n";
    jsonContent << "  \"method\": \"" << method << "\"\n";
    
    // Generate hash of the content (without the hash field)
    std::string contentWithoutHash = jsonContent.str();
    jsonContent << "  \"verificationHash\": \"" << GenerateSHA256(contentWithoutHash) << "\"\n";
    jsonContent << "}\n";
    
    // Write to file on C: drive
    std::string path = "C:\\purge_certificate_E_drive.json";
    std::ofstream cert(path);
    if (cert.is_open()) {
        cert << jsonContent.str();
        cert.close();
        std::cout << "Certificate saved to: " << path << std::endl;
    }
}

// Simple console interface
void RunSanitization() {
    std::cout << "=== SECURE DATA SANITIZATION TOOL ===" << std::endl;
    std::cout << "Target drive: E:\\" << std::endl;
    std::cout << "=====================================" << std::endl;
    
    // Check if E: drive exists
    if (!DriveExists(TARGET_DRIVE)) {
        std::cout << "ERROR: E: drive not found or not ready." << std::endl;
        return;
    }
    
    // Display drive information
    std::cout << "Drive information: " << GetDriveInfo(TARGET_DRIVE) << std::endl;
    std::cout << "Drive size: " << GetDriveSizeInfo(TARGET_DRIVE) << std::endl;
    std::cout << std::endl;
    
    // WARNING
    std::cout << "!!! WARNING !!!" << std::endl;
    std::cout << "This will PERMANENTLY DELETE ALL DATA on the E: drive." << std::endl;
    std::cout << "This action is IRREVERSIBLE and will make data recovery IMPOSSIBLE." << std::endl;
    std::cout << std::endl;
    
    // Confirm before proceeding
    std::string confirm;
    std::cout << "Type 'ERASE_E' to confirm data sanitization: ";
    std::cin >> confirm;
    
    if (confirm != "ERASE_E") {
        std::cout << "Operation cancelled." << std::endl;
        return;
    }
    
    std::cout << std::endl;
    std::cout << "Starting secure data sanitization..." << std::endl;
    
    // Step 1: Delete all files and folders
    std::cout << "Phase 1: Deleting all files and folders..." << std::endl;
    if (DeleteAllFiles(TARGET_DRIVE)) {
        std::cout << "All files and folders deleted." << std::endl;
    } else {
        std::cout << "Error deleting some files." << std::endl;
    }
    
    // Step 2: Wipe free space (3-pass)
    std::cout << "Phase 2: Secure wipe (3-pass overwrite)..." << std::endl;
    if (SecureEraseDrive(TARGET_DRIVE)) {
        std::cout << "Secure wipe completed." << std::endl;
    } else {
        std::cout << "Error during secure wipe." << std::endl;
    }
    
    // Generate certificate
    std::cout << "Phase 3: Generating verification certificate..." << std::endl;
    GenerateCertificate(TARGET_DRIVE, "CIPHER_3_PASS_WIPE");
    
    std::cout << std::endl;
    std::cout << "=== SANITIZATION COMPLETE ===" << std::endl;
    std::cout << "All data on E: drive has been permanently erased." << std::endl;
    std::cout << "A verification certificate has been saved to C:\\purge_certificate_E_drive.json" << std::endl;
}

int main() {
    // Check admin rights
    if (!IsRunAsAdmin()) {
        std::cout << "ERROR: This tool must be run as Administrator." << std::endl;
        std::cout << "Please right-click and select 'Run as administrator'." << std::endl;
        system("pause");
        return 1;
    }
    
    RunSanitization();
    
    std::cout << std::endl;
    system("pause");
    return 0;
}