import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToPDF(data: any[]) {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  doc.setFontSize(16);
  doc.text('Email Logs Report', 14, 20);
  doc.setFontSize(10);
  doc.text(`Exported at: ${timestamp}`, 14, 26);

  const headers = [['Title', 'Message', 'Group', 'To Email', 'Sent At']];
  const rows = data.map((log) => [
    log.title || '-',
    log.message || '-',
    log.group || '-',
    formatEmail(log.toEmail),
    new Date(log.sentAt).toLocaleString(),
  ]);

  autoTable(doc, {
    startY: 30,
    head: headers,
    body: rows,
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [100, 100, 255] },
    margin: { top: 10, left: 14, right: 14 },
  });

  doc.save(`email_logs_${Date.now()}.pdf`);
}

function formatEmail(email: string | null) {
  if (!email) return '-';
  return email.includes('@') ? email : `${email}@purdue.edu`;
}
