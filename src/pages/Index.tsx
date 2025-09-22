import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, Award, Shield, Cpu, Download, Smartphone } from "lucide-react";
import { Certificate } from "@/components/Certificate";
import { useState } from "react";
import { toast } from "sonner";

const Index = () => {
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState({
    serialNumber: "",
    deviceModel: "",
    completionDate: ""
  });

  const handleDownloadFile = () => {
    const link = document.createElement('a');
    link.href = '/edriveerase.cpp';
    link.download = 'edriveerase.cpp';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("File download started!");
  };

  const handleGenerateCertificate = () => {
    // Generate sample certificate data
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    setCertificateData({
      serialNumber: `SN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      deviceModel: "Samsung SSD 980 PRO 1TB",
      completionDate: currentDate
    });
    
    setShowCertificate(true);
    toast.success("Certificate generated successfully!");
  };

  const handleDownloadCertificate = () => {
    // In a real implementation, this would generate and download a PDF
    toast.success("Certificate download would start here (requires backend integration for PDF generation)");
  };

  const handleDownloadMobileApp = () => {
    toast.info("Mobile app download coming soon!");
  };

  return <div className="min-h-screen tech-bg-pattern">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-tech-border bg-tech-surface/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-surface opacity-50" />
        <div className="relative container mx-auto px-6 py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-tech-primary animate-glow-pulse" />
            <Cpu className="h-6 w-6 text-tech-secondary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent leading-tight">
            Secure Data Wiping for Trustworthy IT Asset Recycling
          </h1>
          <p className="text-xl text-muted-foreground text-center mt-4 max-w-3xl mx-auto">
            Professional data destruction services ensuring complete security and compliance for enterprise IT asset recycling
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
          
          {/* First Column - File Download */}
          <Card className="p-8 surface-gradient border-tech-border card-shadow hover:shadow-glow transition-all duration-500 animate-fade-in">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <Download className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-semibold text-foreground">Application Link</h2>
              
              <p className="text-muted-foreground leading-relaxed">
                Download our professional data wiping application. Enterprise-grade secure deletion tool with DoD 5220.22-M compliance and comprehensive audit logging.
              </p>
              
              <div className="pt-4">
                <Button variant="tech-outline" size="lg" onClick={handleDownloadFile} className="group">
                  <Download className="h-5 w-5 group-hover:translate-y-1 transition-transform" />
                  Link
                </Button>
              </div>
            </div>
          </Card>

          {/* Second Column - Certificate Generation */}
          <Card className="p-8 surface-gradient border-tech-border card-shadow hover:shadow-glow transition-all duration-500 animate-fade-in [animation-delay:200ms]">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-semibold text-foreground">
                Generate Professional Certificate
              </h2>
              
              <p className="text-muted-foreground leading-relaxed">
                Generate official compliance certificates for completed data wiping operations. Provides legally recognized documentation meeting NIST 800-88 and DoD 5220.22-M standards.
              </p>
              
              <div className="pt-4">
                <Button variant="tech" size="lg" onClick={handleGenerateCertificate} className="group">
                  <Award className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  Generate Certificate
                </Button>
              </div>
            </div>
          </Card>

          {/* Third Column - Mobile App Download */}
          <Card className="p-8 surface-gradient border-tech-border card-shadow hover:shadow-glow transition-all duration-500 animate-fade-in [animation-delay:400ms]">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="text-2xl font-semibold text-foreground">
                Mobile Application
              </h2>
              
              <p className="text-muted-foreground leading-relaxed">
                Download our mobile companion app for on-the-go data wiping verification and certificate management. Available for iOS and Android devices.
              </p>
              
              <div className="pt-4">
                <Button variant="professional" size="lg" onClick={handleDownloadMobileApp} className="group">
                  <Smartphone className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Download App
                </Button>
              </div>
            </div>
          </Card>
          
        </div>

        {/* Certificate Display */}
        {showCertificate && (
          <div className="mt-16">
            <Certificate 
              serialNumber={certificateData.serialNumber}
              deviceModel={certificateData.deviceModel}
              completionDate={certificateData.completionDate}
              onDownload={handleDownloadCertificate}
            />
          </div>
        )}

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-tech-primary" />
              <span className="font-medium">NIST 800-88 Compliant</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Award className="h-5 w-5 text-tech-secondary" />
              <span className="font-medium">DoD 5220.22-M Certified</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Cpu className="h-5 w-5 text-tech-primary" />
              <span className="font-medium">Enterprise Grade Security</span>
            </div>
          </div>
        </div>
      </main>
    </div>;
};
export default Index;