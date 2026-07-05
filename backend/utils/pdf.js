const PDFDocument = require('pdfkit');

const generateComplaintReceipt = (complaint, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Stream output directly to response
  doc.pipe(res);

  // Styling palette
  const primaryColor = '#4F46E5'; // Indigo-600
  const textColor = '#1F2937'; // Gray-800
  const secondaryTextColor = '#4B5563'; // Gray-600

  // Title / Header
  doc
    .fillColor(primaryColor)
    .fontSize(22)
    .text('Online Complaint Management System', { align: 'center' });
  doc
    .fillColor(secondaryTextColor)
    .fontSize(10)
    .text('Official Citizen Grievance Receipt', { align: 'center' })
    .moveDown(2);

  // Divider Line
  doc
    .strokeColor('#E5E7EB')
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke()
    .moveDown(1.5);

  // Metadata Details
  doc.fillColor(textColor).fontSize(12);
  
  doc.text(`Complaint ID:`, 50, doc.y, { continued: true })
     .fillColor(primaryColor).font('Helvetica-Bold').text(` ${complaint.complaintId}`).font('Helvetica').fillColor(textColor);
  
  doc.moveDown(0.5);
  doc.text(`Submitted On: ${new Date(complaint.createdAt).toLocaleString()}`);
  doc.moveDown(0.5);
  doc.text(`Current Status: `, { continued: true })
     .fillColor(getStatusColor(complaint.status)).font('Helvetica-Bold').text(` ${complaint.status}`).font('Helvetica').fillColor(textColor);

  doc.moveDown(1.5);

  // Complaint Core Info Card
  const cardY = doc.y;
  doc
    .fillColor('#F9FAFB')
    .rect(50, cardY, 500, 160)
    .fill()
    .strokeColor('#E5E7EB')
    .rect(50, cardY, 500, 160)
    .stroke();

  let textY = cardY + 10;
  doc.fillColor(textColor).font('Helvetica-Bold').text('Complaint Details:', 60, textY);
  
  doc.font('Helvetica').fontSize(10);
  doc.text(`Title: ${complaint.title}`, 65, textY + 25);
  doc.text(`Category: ${complaint.category ? complaint.category.name : 'Uncategorized'}`, 65, textY + 45);
  doc.text(`Priority: ${complaint.priority}`, 65, textY + 65);
  doc.text(`Location: ${complaint.location}`, 65, textY + 85);
  doc.text(`Description:`, 65, textY + 105);
  doc.text(complaint.description, 65, textY + 120, { width: 470, maxPages: 1 });

  doc.y = cardY + 160;
  doc.moveDown(1);

  // Timeline Stepper Visualizer
  doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('Complaint Progress Timeline:', 50, doc.y);
  doc.moveDown(1);

  complaint.timeline.forEach((log) => {
    const formattedDate = new Date(log.createdAt).toLocaleString();
    doc
      .fillColor(textColor)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text(`[${log.status}] `, { continued: true })
      .font('Helvetica')
      .text(`- ${log.message} (${formattedDate})`);
    doc.moveDown(0.5);
  });

  doc.moveDown(2);

  // Footer notes
  doc
    .fillColor(secondaryTextColor)
    .fontSize(8)
    .text('This is a computer-generated grievance receipt and does not require a physical signature.', { align: 'center' });

  // Finalize PDF file
  doc.end();
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Submitted':
      return '#3B82F6'; // Blue
    case 'Under Review':
      return '#F59E0B'; // Amber
    case 'In Progress':
      return '#8B5CF6'; // Purple
    case 'Resolved':
      return '#10B981'; // Emerald
    case 'Closed':
      return '#6B7280'; // Gray
    case 'Rejected':
      return '#EF4444'; // Red
    default:
      return '#1F2937';
  }
};

module.exports = { generateComplaintReceipt };
