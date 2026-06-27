import jsPDF from "jspdf";

export type CertificateData = {
  recipientName: string;
  eventName: string;
  code: string;
  issuedAt: string | Date;
  description?: string | null;
};

function fmtDate(d: string | Date) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function generateCertificatePdf(data: CertificateData): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, w, h, "F");

  // Yellow accent bar
  doc.setFillColor(255, 230, 74); // light yellow
  doc.rect(0, 0, w, 14, "F");
  doc.rect(0, h - 14, w, 14, "F");

  // Outer border
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(1.5);
  doc.rect(28, 28, w - 56, h - 56);
  doc.setLineWidth(0.5);
  doc.rect(36, 36, w - 72, h - 72);

  // Brand
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.setFontSize(14);
  doc.text("INTERACTUP", w / 2, 80, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text("MBA Community Platform", w / 2, 96, { align: "center" });

  // Title
  doc.setFont("times", "bold");
  doc.setFontSize(40);
  doc.setTextColor(20, 20, 20);
  doc.text("Certificate of Achievement", w / 2, 170, { align: "center" });

  // Body
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text("This certificate is proudly presented to", w / 2, 210, { align: "center" });

  // Recipient
  doc.setFont("times", "bold");
  doc.setFontSize(34);
  doc.setTextColor(20, 20, 20);
  doc.text(data.recipientName || "Recipient", w / 2, 260, { align: "center" });

  // Underline
  doc.setDrawColor(255, 200, 0);
  doc.setLineWidth(2);
  doc.line(w / 2 - 180, 275, w / 2 + 180, 275);

  // Reason
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  const reason = `for outstanding participation and achievement in`;
  doc.text(reason, w / 2, 305, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text(data.eventName, w / 2, 332, { align: "center", maxWidth: w - 200 });

  if (data.description) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text(data.description, w / 2, 360, { align: "center", maxWidth: w - 200 });
  }

  // Footer: date + code
  const footerY = h - 80;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("Issued on", 80, footerY);
  doc.text("Verification code", w - 80, footerY, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text(fmtDate(data.issuedAt), 80, footerY + 18);
  doc.text(data.code, w - 80, footerY + 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(
    "Verify this certificate at interactup.com/verify",
    w / 2,
    h - 30,
    { align: "center" },
  );

  return doc;
}

export function downloadCertificate(data: CertificateData) {
  const doc = generateCertificatePdf(data);
  const safe = data.recipientName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`certificate-${safe}-${data.code}.pdf`);
}
