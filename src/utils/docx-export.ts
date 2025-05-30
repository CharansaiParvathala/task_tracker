import { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, IParagraphOptions } from 'docx';
import { saveAs } from 'file-saver';
import { Packer } from 'docx';
import { Project, PaymentRequest, ProgressUpdate } from '@/lib/types';

interface DocxExportOptions {
  title: string;
  description?: string;
  data: Record<string, any>[];
  columns: {
    key: string;
    header: string;
    width?: number;
  }[];
  fileName?: string;
}

export const exportToDocx = async ({
  title,
  description,
  data,
  columns,
  fileName = 'export.docx',
}: DocxExportOptions): Promise<void> => {
  // Create a new document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            spacing: {
              after: 200,
            },
          }),
          
          // Date
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated on: ${new Date().toLocaleDateString()}`,
                size: 20,
              }),
            ],
            spacing: {
              after: 200,
            },
          }),
          
          // Description if provided
          ...(description ? [
            new Paragraph({
              text: description,
              spacing: {
                after: 200,
              },
            })
          ] : []),
          
          // Create table
          createTable(columns, data),
          
          // Page number
          new Paragraph({
            text: "Page ",
            children: [
              new TextRun({
                children: ["PAGE", " of ", "NUMPAGES"],
              }),
            ],
            alignment: "center",
          }),
        ],
      },
    ],
  });

  // Generate the document - Using Packer.toBlob for proper document generation
  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, fileName);
};

// Helper function to create a table
function createTable(columns: {key: string; header: string; width?: number}[], data: Record<string, any>[]) {
  // Create header row
  const headerRow = new TableRow({
    children: columns.map(column => 
      new TableCell({
        children: [new Paragraph({
          text: column.header,
          heading: HeadingLevel.HEADING_4
        })],
        shading: {
          fill: "F2F2F2"
        }
      })
    )
  });
  
  // Create data rows
  const dataRows = data.map(row => 
    new TableRow({
      children: columns.map(column => {
        const cellValue = row[column.key];
        let cellContent = String(cellValue !== undefined && cellValue !== null ? cellValue : '');
        
        return new TableCell({
          children: [new Paragraph({ text: cellContent })]
        });
      })
    })
  );
  
  // Create the table
  return new Table({
    rows: [headerRow, ...dataRows],
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 }
    }
  });
}

export const generateProjectReport = async (
  projectData: Project, 
  progressUpdates: ProgressUpdate[] = [], 
  paymentRequests: PaymentRequest[] = []
): Promise<Blob> => {
  // Create the document as before
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            text: `Project Report: ${projectData.name}`,
            heading: HeadingLevel.HEADING_1
          }),
          
          new Paragraph({
            text: `Generated on: ${new Date().toLocaleDateString()}`,
            spacing: { after: 400 }
          }),
          
          // Project details
          new Paragraph({
            text: "Project Details",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          
          // Project details table
          createDetailTable([
            ["Project ID", projectData.id || "N/A"],
            ["Project Name", projectData.name || "N/A"],
            ["Start Date", projectData.startDate || "N/A"],
            ["End Date", projectData.endDate || "N/A"],
            ["Status", projectData.status || "N/A"],
            ["Completion", `${projectData.completionPercentage || Math.round(((projectData.completedWork || 0) / (projectData.totalWork || 1)) * 100)}%`],
          ]),
          
          // Progress updates
          new Paragraph({
            text: "Progress Updates",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          
          // Add progress updates if available
          ...(progressUpdates.length > 0 ? 
            progressUpdates.map(update => 
              new Paragraph({
                text: `Update ${new Date(update.date).toLocaleDateString()}: ${update.completedWork} meters completed`,
                spacing: { after: 100 }
              })
            ) : [
              new Paragraph({ text: "No progress updates available" })
            ]),
            
          // Payment information
          new Paragraph({
            text: "Payment Information",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          
          // Add payment details if available
          ...(paymentRequests.length > 0 ?
            paymentRequests.map(payment => 
              new Paragraph({
                text: `Payment ${new Date(payment.date).toLocaleDateString()}: ₹${payment.totalAmount} - Status: ${payment.status}`,
                spacing: { after: 100 }
              })
            ) : [
              new Paragraph({ text: "No payment information available" })
            ])
        ]
      }
    ]
  });
  
  // Convert Document to Blob directly and return the Blob
  return await Packer.toBlob(doc);
};

// Helper function to create a simple detail table
function createDetailTable(data: string[][]) {
  const rows = data.map(row => 
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ 
            text: row[0], 
            style: "strong"  // Use style instead of bold
          })],
          width: { size: 30, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [new Paragraph({ text: row[1] })],
          width: { size: 70, type: WidthType.PERCENTAGE }
        })
      ]
    })
  );
  
  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 }
    }
  });
}

// Function to generate Word document and then convert to PDF
export const generateWordAndConvertToPdf = async (options: DocxExportOptions): Promise<Blob> => {
  // Create a new document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: options.title,
            heading: HeadingLevel.HEADING_1,
            spacing: {
              after: 200,
            },
          }),
          
          // Date
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated on: ${new Date().toLocaleDateString()}`,
                size: 20,
              }),
            ],
            spacing: {
              after: 200,
            },
          }),
          
          // Description if provided
          ...(options.description ? [
            new Paragraph({
              text: options.description,
              spacing: {
                after: 200,
              },
            })
          ] : []),
          
          // Create table
          createTable(options.columns, options.data),
        ],
      },
    ],
  });

  // Generate blob from the document
  const buffer = await Packer.toBlob(doc);
  
  // Return the blob for further processing (e.g., conversion to PDF)
  return buffer;
};
