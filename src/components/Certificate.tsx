import React, { useRef } from 'react';
import { Shield, Calendar, CheckCircle, Award, Hash } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateProps {
  serialNumber: string;
  deviceModel: string;
  completionDate: string;
}

export const Certificate: React.FC<CertificateProps> = ({
  serialNumber,
  deviceModel,
  completionDate
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Data-Destruction-Certificate-${serialNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div ref={certificateRef} className="certificate-container bg-white p-8 rounded-lg shadow-2xl max-w-4xl mx-auto border-2 border-tech-primary/20">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-tech-primary/10 pb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="h-12 w-12 text-tech-primary" />
          <Award className="h-10 w-10 text-tech-secondary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CERTIFICATE OF DATA DESTRUCTION
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          Professional Data Wiping Compliance Certificate
        </p>
      </div>

      {/* Certificate Content */}
      <div className="space-y-6 mb-8">
        <div className="text-center">
          <p className="text-lg text-gray-700 leading-relaxed">
            This certifies that the data storage device listed below has been 
            <span className="font-bold text-tech-primary"> securely wiped and sanitized</span> in accordance with 
            <span className="font-bold"> NIST 800-88</span> and <span className="font-bold">DoD 5220.22-M</span> standards.
          </p>
        </div>

        {/* Device Information */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hash className="h-5 w-5 text-tech-primary" />
            Device Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Device Model</label>
              <p className="text-lg font-semibold text-gray-900">{deviceModel}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Serial Number</label>
              <p className="text-lg font-mono font-semibold text-gray-900">{serialNumber}</p>
            </div>
          </div>
        </div>

        {/* Completion Details */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-tech-primary" />
            Completion Details
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Completion Date</label>
              <p className="text-lg font-semibold text-gray-900">{completionDate}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Wiping Method</label>
              <p className="text-lg font-semibold text-gray-900">DoD 5220.22-M (3-Pass)</p>
            </div>
          </div>
        </div>

        {/* Compliance Standards */}
        <div className="bg-tech-primary/5 p-6 rounded-lg border border-tech-primary/20">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-tech-primary" />
            Compliance Standards Met
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-gray-700">NIST 800-88 Guidelines</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-gray-700">DoD 5220.22-M Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-gray-700">HIPAA Compliance</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-gray-700">GDPR Requirements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Signature Section */}
      <div className="border-t-2 border-gray-200 pt-6 mt-8">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-600 mb-2">Digitally Verified By:</p>
            <p className="font-bold text-lg text-gray-900">Secure Data Wiping Solutions</p>
            <p className="text-sm text-gray-600">Certified Data Destruction Specialist</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">Certificate ID:</p>
            <p className="font-mono text-sm text-gray-900">CERT-{serialNumber.slice(-8)}-{Date.now().toString().slice(-6)}</p>
            <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full inline-block">
              VERIFIED ✓
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="text-center mt-8">
        <button 
          onClick={handleDownloadPDF}
          className="bg-tech-primary hover:bg-tech-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
        >
          Download Certificate (PDF)
        </button>
      </div>
    </div>
  );
};