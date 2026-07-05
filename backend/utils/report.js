const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Generates and pipes Excel sheet containing lists of complaints
const generateExcelReport = async (complaints, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Complaints Report');

  // Define Columns
  worksheet.columns = [
    { header: 'Complaint ID', key: 'complaintId', width: 20 },
    { header: 'Title', key: 'title', width: 30 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Priority', key: 'priority', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Location', key: 'location', width: 25 },
    { header: 'Citizen Name', key: 'citizenName', width: 20 },
    { header: 'Citizen Email', key: 'citizenEmail', width: 25 },
    { header: 'Assigned To', key: 'assignedTo', width: 20 },
    { header: 'Created At', key: 'createdAt', width: 22 },
    { header: 'Resolution Notes', key: 'resolutionNotes', width: 35 },
  ];

  // Formatting Header Row (Indigo fill, bold white text)
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  worksheet.getRow(1).height = 25;

  // Add Data Rows
  complaints.forEach((comp) => {
    worksheet.addRow({
      complaintId: comp.complaintId,
      title: comp.title,
      category: comp.category ? comp.category.name : 'N/A',
      priority: comp.priority,
      status: comp.status,
      location: comp.location,
      citizenName: comp.citizen ? comp.citizen.name : 'N/A',
      citizenEmail: comp.citizen ? comp.citizen.email : 'N/A',
      assignedTo: comp.assignedTo ? comp.assignedTo.name : 'Unassigned',
      createdAt: new Date(comp.createdAt).toLocaleString(),
      resolutionNotes: comp.resolutionNotes || '',
    });
  });

  // Set borders and alignment for all data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } },
        };
      });
    }
  });

  // Stream output to Response
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=complaints_report.xlsx'
  );

  await workbook.xlsx.write(res);
  res.end();
};

// Generates a PDF listing all complaints in a neat summary grid
const generatePDFReport = (complaints, res) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

  // Stream output directly to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=complaints_report.pdf');
  doc.pipe(res);

  // Title / Header
  doc
    .fillColor('#4F46E5')
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('Grievance Management Report Summary', { align: 'center' });
  doc
    .fillColor('#4B5563')
    .fontSize(9)
    .font('Helvetica')
    .text(`Generated on: ${new Date().toLocaleString()} | Total Records: ${complaints.length}`, { align: 'center' })
    .moveDown(2);

  // Table Headers
  const tableHeaders = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Citizen', 'Created Date'];
  const startX = 30;
  const colWidths = [120, 155, 100, 65, 80, 110, 110];
  let currentY = doc.y;

  // Header Draw
  doc.fillColor('#F3F4F6').rect(startX, currentY, 740, 22).fill().stroke();
  doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9);

  let tempX = startX;
  tableHeaders.forEach((header, index) => {
    doc.text(header, tempX + 5, currentY + 6, { width: colWidths[index] - 10, align: 'left' });
    tempX += colWidths[index];
  });

  currentY += 22;
  doc.font('Helvetica').fontSize(8);

  // Table Rows
  complaints.forEach((comp, idx) => {
    // Check page boundaries
    if (currentY > 520) {
      doc.addPage({ margin: 30, size: 'A4', layout: 'landscape' });
      currentY = 40;
      // Redraw headers on new page
      doc.fillColor('#F3F4F6').rect(startX, currentY, 740, 22).fill().stroke();
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(9);
      tempX = startX;
      tableHeaders.forEach((header, index) => {
        doc.text(header, tempX + 5, currentY + 6, { width: colWidths[index] - 10, align: 'left' });
        tempX += colWidths[index];
      });
      currentY += 22;
      doc.font('Helvetica').fontSize(8);
    }

    // Row coloring (zebra striping)
    if (idx % 2 === 0) {
      doc.fillColor('#F9FAFB').rect(startX, currentY, 740, 20).fill();
    }
    doc.strokeColor('#E5E7EB').rect(startX, currentY, 740, 20).stroke();

    doc.fillColor('#111827');
    
    // Draw cells
    tempX = startX;
    doc.text(comp.complaintId, tempX + 5, currentY + 6, { width: colWidths[0] - 10, lineBreak: false });
    tempX += colWidths[0];
    doc.text(comp.title, tempX + 5, currentY + 6, { width: colWidths[1] - 10, lineBreak: false });
    tempX += colWidths[1];
    doc.text(comp.category ? comp.category.name : 'N/A', tempX + 5, currentY + 6, { width: colWidths[2] - 10, lineBreak: false });
    tempX += colWidths[2];
    doc.text(comp.priority, tempX + 5, currentY + 6, { width: colWidths[3] - 10, lineBreak: false });
    tempX += colWidths[3];
    doc.text(comp.status, tempX + 5, currentY + 6, { width: colWidths[4] - 10, lineBreak: false });
    tempX += colWidths[4];
    doc.text(comp.citizen ? comp.citizen.name : 'N/A', tempX + 5, currentY + 6, { width: colWidths[5] - 10, lineBreak: false });
    tempX += colWidths[5];
    doc.text(new Date(comp.createdAt).toLocaleDateString(), tempX + 5, currentY + 6, { width: colWidths[6] - 10, lineBreak: false });

    currentY += 20;
  });

  doc.end();
};

module.exports = {
  generateExcelReport,
  generatePDFReport,
};
