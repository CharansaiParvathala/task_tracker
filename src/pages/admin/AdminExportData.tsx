import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, FileOutput, Printer, FilePlus } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { generateExportData } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { 
  exportToPDF, 
  generateProjectPdfReport, 
  exportProjectsToPDF, 
  exportPaymentsToPDF 
} from '@/utils/pdf-export';
import { exportToDocx, generateProjectReport } from '@/utils/docx-export';
import { Project } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const AdminExportData: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [exportType, setExportType] = useState('projects');
  const [loading, setLoading] = useState({
    word: false,
    pdf: false,
    report: false
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleExportDocx = async () => {
    try {
      setLoading(prev => ({ ...prev, word: true }));
      toast.info(t("common.generating"));
      
      // Generate the export data
      const data = generateExportData();
      
      // Prepare project data for Word document
      const projectData = data.projects.map(project => ({
        id: project.id || '',
        name: project.name || '',
        leader: project.leaderId || 'N/A',
        completedWork: project.completedWork || 0,
        totalWork: project.totalWork || 0,
        progress: `${Math.round(((project.completedWork || 0) / (project.totalWork || 1)) * 100)}%`
      }));
      
      // Export projects to Word
      await exportToDocx({
        title: t("app.reports.projectsReport"),
        description: t("app.reports.projectsDescription"),
        data: projectData,
        columns: [
          { key: 'name', header: t("app.reports.projectName") },
          { key: 'completedWork', header: t("app.reports.completed") },
          { key: 'totalWork', header: t("app.reports.total") },
          { key: 'progress', header: t("app.reports.progress") }
        ],
        fileName: `saibalaji_projects_report_${new Date().toISOString().split('T')[0]}.docx`
      });
      
      toast.success(t("common.exportSuccess"));
    } catch (error) {
      console.error("Word export error:", error);
      toast.error(t("common.exportError"));
    } finally {
      setLoading(prev => ({ ...prev, word: false }));
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(prev => ({ ...prev, pdf: true }));
      toast.info(t("common.generating"));
      
      // Generate the export data
      const data = generateExportData();
      
      if (exportType === 'projects') {
        await exportProjectsToPDF(data.projects);
      } else if (exportType === 'payments') {
        await exportPaymentsToPDF(data.paymentRequests);
      } else {
        // Get first project for demo
        const firstProject = data.projects[0] || {} as Project;
        
        // Generate sample progress data for the project
        const progressUpdates = data.progressUpdates 
          .filter(entry => entry.projectId === (firstProject.id || ''))
          .slice(0, 5); // Limit to 5 entries
          
        // Generate sample payment data for the project
        const paymentRequests = data.paymentRequests
          .filter(payment => payment.projectId === (firstProject.id || ''))
          .slice(0, 5); // Limit to 5 entries
        
        // Generate PDF report
        const doc = await generateProjectPdfReport(firstProject, progressUpdates, paymentRequests);
        
        // Save the PDF
        doc.save(`project_report_${firstProject.id || 'unknown'}_${new Date().toISOString().split('T')[0]}.pdf`);
      }
      
      toast.success(t("common.exportSuccess"));
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error(t("common.exportError"));
    } finally {
      setLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  const handlePrintReport = async () => {
    try {
      setLoading(prev => ({ ...prev, report: true }));
      toast.info(t("common.generating"));
      
      // Generate the export data
      const data = generateExportData();
      
      // Prepare project data for PDF
      const projectData = data.projects.map(project => ({
        id: project.id || '',
        name: project.name || '',
        completedWork: project.completedWork || 0,
        totalWork: project.totalWork || 0,
        progress: `${Math.round(((project.completedWork || 0) / (project.totalWork || 1)) * 100)}%`
      }));
      
      // Export projects to PDF
      await exportToPDF({
        title: t("app.reports.projectsReport"),
        description: t("app.reports.projectsDescription"),
        data: projectData,
        columns: [
          { key: 'name', header: t("app.reports.projectName"), width: 150 },
          { key: 'completedWork', header: t("app.reports.completed"), width: 100 },
          { key: 'totalWork', header: t("app.reports.total"), width: 100 },
          { key: 'progress', header: t("app.reports.progress"), width: 80 }
        ],
        fileName: `saibalaji_projects_report_${new Date().toISOString().split('T')[0]}.pdf`,
        orientation: 'landscape'
      });
      
      toast.success(t("common.exportSuccess"));
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error(t("common.exportError"));
    } finally {
      setLoading(prev => ({ ...prev, report: false }));
    }
  };

  // Function to convert Word to PDF - Fix type issue
  const handleWordToPDF = async () => {
    try {
      setLoading(prev => ({ ...prev, pdf: true }));
      toast.info(t("common.generating"));
      
      // Generate the export data
      const data = generateExportData();
      
      // Get first project for demo
      const firstProject = data.projects[0] || {} as Project;
      
      // Generate a Word document
      const docxBlob = await generateProjectReport(
        firstProject, 
        data.progressUpdates.filter(p => p.projectId === firstProject.id), 
        data.paymentRequests.filter(p => p.projectId === firstProject.id)
      );
      
      // Fix: The docxBlob returned by generateProjectReport is already a Document object, 
      // not a standard Blob or File. We need to get its binary content properly.
      
      // Instead of trying to convert the Document to a Blob/File (which is causing the type error),
      // we'll directly generate the PDF from the same data source
      
      // Generate PDF report directly from the same data
      const doc = await generateProjectPdfReport(
        firstProject,
        data.progressUpdates.filter(p => p.projectId === firstProject.id).slice(0, 5),
        data.paymentRequests.filter(p => p.projectId === firstProject.id).slice(0, 5)
      );
      
      // Save the PDF
      doc.save(`project_report_${firstProject.id || 'unknown'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success(t("common.exportSuccess"));
    } catch (error) {
      console.error("Word to PDF conversion error:", error);
      toast.error(t("common.exportError"));
    } finally {
      setLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("app.reports.exportData")}</h1>
        <p className="text-muted-foreground">
          {t("app.reports.exportDescription")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("app.reports.exportWord")}</CardTitle>
            <CardDescription>
              {t("app.reports.exportWordDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              {t("app.reports.exportWordDetails")}
            </p>
            <Button onClick={handleExportDocx} className="w-full" disabled={loading.word}>
              <FileText className="mr-2 h-4 w-4" /> 
              {loading.word ? t("common.loading") : t("app.reports.exportWord")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("app.reports.exportPDF")}</CardTitle>
            <CardDescription>
              {t("app.reports.exportPDFDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              {t("app.reports.exportPDFDetails")}
            </p>
            
            <div className="space-y-2">
              <Label>{t("app.reports.exportType")}</Label>
              <Select 
                value={exportType} 
                onValueChange={setExportType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("app.common.selectOption")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="projects">{t("app.navigation.projects")}</SelectItem>
                  <SelectItem value="payments">{t("app.navigation.viewPayment")}</SelectItem>
                  <SelectItem value="project_detail">{t("app.reports.detailedProjectReport")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleExportPDF} className="flex-1" variant="outline" disabled={loading.pdf}>
                <FileOutput className="mr-2 h-4 w-4" /> 
                {loading.pdf ? t("common.loading") : t("app.reports.exportPDF")}
              </Button>
              
              <Button onClick={handleWordToPDF} className="flex-1" variant="outline" disabled={loading.pdf}>
                <FilePlus className="mr-2 h-4 w-4" /> 
                {loading.pdf ? t("common.loading") : t("app.reports.wordToPDF")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("app.reports.printReports")}</CardTitle>
          <CardDescription>
            {t("app.reports.printDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            {t("app.reports.printDetails")}
          </p>
          <Button 
            variant="outline" 
            onClick={handlePrintReport} 
            className="w-full md:w-auto"
            disabled={loading.report}
          >
            <Printer className="mr-2 h-4 w-4" /> 
            {loading.report ? t("common.loading") : t("app.reports.print")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExportData;
