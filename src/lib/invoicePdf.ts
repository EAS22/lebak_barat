import QRCode from "qrcode";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

function parseDateOnly(s: string): Date {
  return new Date(s.slice(0, 10) + "T00:00:00");
}

function formatIDRPlain(n: number | null | undefined): string {
  if (n == null) return "Rp 0";
  const num = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(num as number)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num as number);
}

function baseDomain(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "https://lebakbarat.girimulya.com";
}

export interface InvoiceBookingData {
  invoice_number: string;
  school_name: string;
  participant_count: number;
  pic_name: string;
  pic_wa: string | null;
  start_date: string;
  end_date: string;
  status: string;
  price: number | null;
  keterangan?: string | null;
  invoice_generated_at?: string | null;
}

function loadImageAsBase64(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas ctx null"));
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export async function generateInvoicePdf(
  booking: InvoiceBookingData,
  opts?: { verificationBaseUrl?: string; taxPercent?: number; discount?: number }
): Promise<void> {
  const verificationBaseUrl =
    opts?.verificationBaseUrl || `${baseDomain()}/verifikasi?invoice=`;
  const verificationUrl = `${verificationBaseUrl}${encodeURIComponent(
    booking.invoice_number
  )}`;

  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 300,
    margin: 1,
    color: { dark: "#111827", light: "#ffffff" },
  });

  let logoDataUrl: string | null = null;
  try {
    logoDataUrl = await loadImageAsBase64("/images/logo.png");
  } catch {
    logoDataUrl = null;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "A4",
  });

  const W = 210;
  const H = 297;
  const margin = 14;
  const contentW = W - margin * 2;

  let y = 10;

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", margin, y, 18, 18);
    } catch {
      // ignore
    }
  }

  const textX = logoDataUrl ? margin + 22 : margin;
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("BUMI PERKEMAHAN LEBAK BARAT", textX, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Desa Girimulya, Kec. Banjaran, Kab. Majalengka - Jawa Barat 45468",
    textX,
    y + 10
  );
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text("lebakbarat.girimulya.com | booking.lebakbarat@girimulya.com", textX, y + 13.5);

  y += 21;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, W - margin, y);
  y += 5;

  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("INVOICE", margin, y);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const dateStr = booking.invoice_generated_at
    ? format(new Date(booking.invoice_generated_at), "d MMMM yyyy", {
        locale: localeId,
      })
    : format(new Date(), "d MMMM yyyy", { locale: localeId });

  doc.text(`Tanggal: ${dateStr}`, W - margin, y, { align: "right" });
  y += 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(20, 48, 28);
  doc.text(`No: ${booking.invoice_number}`, W - margin, y, { align: "right" });

  y += 6;
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.7);
  doc.line(margin, y, W - margin, y);
  y += 7;

  const colGap = 6;
  const colW = (contentW - colGap) / 2;
  const leftX = margin;
  const rightX = margin + colW + colGap;

  let leftY = y;
  let rightY = y;

  function colTitle(x: number, yy: number, title: string): number {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(20, 48, 28);
    doc.text(title, x, yy);
    yy += 0.8;
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(0.5);
    doc.line(x, yy, x + 26, yy);
    return yy + 5;
  }

  function colKv(x: number, yy: number, label: string, value: string): number {
    const labelW = 22;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text(label, x, yy);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    const maxW = colW - labelW - 1;
    const lines = doc.splitTextToSize(value, maxW) as string[];
    doc.text(lines[0] ?? "", x + labelW, yy);
    yy += 4.2;
    for (let i = 1; i < lines.length; i++) {
      doc.text(lines[i] as string, x + labelW, yy);
      yy += 4.2;
    }
    return yy + 0.8;
  }

  leftY = colTitle(leftX, leftY, "Informasi Booking");
  leftY = colKv(leftX, leftY, "Sekolah", booking.school_name);
  leftY = colKv(leftX, leftY, "Peserta", `${booking.participant_count} siswa`);
  leftY = colKv(leftX, leftY, "Status", booking.status.toUpperCase());
  if (booking.keterangan) {
    leftY = colKv(leftX, leftY, "Catatan", booking.keterangan);
  }

  rightY = colTitle(rightX, rightY, "Penanggung Jawab");
  rightY = colKv(rightX, rightY, "Nama", booking.pic_name);
  rightY = colKv(rightX, rightY, "Kontak", booking.pic_wa || "-");
  rightY = colKv(
    rightX,
    rightY,
    "Tanggal",
    `${format(parseDateOnly(booking.start_date), "d MMM yyyy", { locale: localeId })} - ${format(parseDateOnly(booking.end_date), "d MMM yyyy", { locale: localeId })}`
  );
  rightY = colKv(rightX, rightY, "Durasi", "3 Hari 2 Malam");

  y = Math.max(leftY, rightY) + 6;

  const colNoW = 9;
  const colDurW = 20;
  const colQtyW = 14;
  const colTglW = 30;
  const colJumlahW = 30;
  const colDescW = contentW - colNoW - colDurW - colTglW - colQtyW - colJumlahW;

  type Col = { x: number; w: number; label: string; align: "left" | "center" | "right" };
  const cols: Col[] = [
    { x: margin, w: colNoW, label: "No", align: "center" },
    { x: margin + colNoW, w: colDescW, label: "Deskripsi Sewa", align: "left" },
    { x: margin + colNoW + colDescW, w: colDurW, label: "Durasi", align: "left" },
    { x: margin + colNoW + colDescW + colDurW, w: colTglW, label: "Tanggal", align: "left" },
    { x: margin + colNoW + colDescW + colDurW + colTglW, w: colQtyW, label: "Qty", align: "center" },
    { x: margin + colNoW + colDescW + colDurW + colTglW + colQtyW, w: colJumlahW, label: "Jumlah", align: "right" },
  ];

  doc.setFillColor(20, 48, 28);
  doc.rect(margin, y, contentW, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  for (const c of cols) {
    const tx = c.align === "center" ? c.x + c.w / 2 : c.align === "right" ? c.x + c.w - 1.5 : c.x + 1.5;
    doc.text(c.label, tx, y + 4.6, { align: c.align });
  }
  y += 7;

  const rowH = 16;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, contentW, rowH, "FD");

  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("1", cols[0]!.x + cols[0]!.w / 2, y + 5, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Sewa Buper Lebak Barat", cols[1]!.x + 1.5, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(90, 90, 90);
  doc.text(`${booking.school_name} - ${booking.participant_count} Peserta`, cols[1]!.x + 1.5, y + 9);

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(7.5);
  doc.text("3 Hari", cols[2]!.x + 1.5, y + 5);
  doc.setFontSize(6.8);
  doc.setTextColor(90, 90, 90);
  doc.text("2 Malam", cols[2]!.x + 1.5, y + 9);

  const tgl1 = format(parseDateOnly(booking.start_date), "d MMM yyyy", { locale: localeId });
  const tgl2 = format(parseDateOnly(booking.end_date), "d MMM yyyy", { locale: localeId });
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(7.2);
  doc.text(tgl1, cols[3]!.x + 1.5, y + 5);
  doc.text(tgl2, cols[3]!.x + 1.5, y + 9);

  doc.text("1 Paket", cols[4]!.x + cols[4]!.w / 2, y + 7, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.text(formatIDRPlain(booking.price), cols[5]!.x + cols[5]!.w - 1.5, y + 7, { align: "right" });

  y += rowH;

  const taxPercent = opts?.taxPercent ?? 0;
  const discount = opts?.discount ?? 0;
  const total = booking.price ?? 0;
  const taxAmount = Math.round((total * taxPercent) / 100);
  const grandTotal = total + taxAmount - discount;

  function summaryRow(label: string, value: string, bold = false, dark = false) {
    if (dark) {
      doc.setFillColor(20, 48, 28);
      doc.rect(margin, y, contentW, 7, "F");
      doc.setTextColor(255, 255, 255);
    } else {
      if (label === "Grand Total") {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, y, contentW, 7, "F");
      } else {
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y, W - margin, y);
      }
      doc.setTextColor(30, 30, 30);
    }
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 9 : 8);
    const lx = margin + colNoW + colDescW + colDurW;
    doc.text(label, lx + 1.5, y + 4.8);
    doc.text(value, margin + contentW - 1.5, y + 4.8, { align: "right" });
    y += 7;
  }

  summaryRow("Total", formatIDRPlain(total));
  summaryRow(`Pajak (${taxPercent}%)`, formatIDRPlain(taxAmount));
  summaryRow("Diskon", formatIDRPlain(discount));
  summaryRow("Grand Total", formatIDRPlain(grandTotal), true, true);

  y += 8;

  const qrSize = 26;
  const qrX = margin;
  const qrY = y;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.15);
  doc.rect(qrX, qrY, qrSize, qrSize);

  try {
    doc.addImage(qrDataUrl, "PNG", qrX + 0.8, qrY + 0.8, qrSize - 1.6, qrSize - 1.6);
  } catch {}

  const qrTextX = qrX + qrSize + 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 30, 30);
  doc.text(`Invoice: ${booking.invoice_number}`, qrTextX, qrY + 3.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(90, 90, 90);
  doc.text("Scan QR untuk verifikasi keaslian invoice.", qrTextX, qrY + 7);

  doc.setFontSize(5.8);
  doc.setTextColor(5, 150, 105);
  const urlLines = doc.splitTextToSize(verificationUrl, contentW - qrSize - 4) as string[];
  doc.text(urlLines, qrTextX, qrY + 10);

  if (booking.invoice_generated_at) {
    doc.setFontSize(5.8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Dicetak: ${format(new Date(booking.invoice_generated_at), "d MMM yyyy HH:mm 'WIB'", { locale: localeId })}`,
      qrTextX,
      qrY + 10 + urlLines.length * 2.8 + 1.5
    );
  }

  y = qrY + qrSize + 10;

  if (y > 215) {
    doc.addPage();
    y = 18;
  }

  const sigLeftX = margin;
  const sigRightX = margin + contentW / 2 + 8;
  const sigTop = y + 2;
  const lineLen = 52;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text("Hormat kami,", sigLeftX, sigTop);
  doc.text("Mengetahui,", sigRightX, sigTop);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.text("Penanggung Jawab", sigLeftX, sigTop + 4.5);
  doc.text("Buper Lebak Barat", sigRightX, sigTop + 4.5);

  const sigSpace = 28;

  doc.setFontSize(9.5);
  const picUpper = (booking.pic_name || "-").toUpperCase();
  doc.text(picUpper, sigLeftX, sigTop + 4.5 + sigSpace);
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.25);
  doc.line(sigLeftX, sigTop + 4.5 + sigSpace + 1, sigLeftX + lineLen, sigTop + 4.5 + sigSpace + 1);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(100, 100, 100);
  const nameLines = doc.splitTextToSize(picUpper, contentW / 2 - 8) as string[];
  doc.text(nameLines[0] ?? picUpper, sigLeftX, sigTop + 4.5 + sigSpace + 6);
  doc.text(booking.pic_wa || "-", sigLeftX, sigTop + 4.5 + sigSpace + 9.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text("BUMI PERKEMAHAN LEBAK BARAT", sigRightX, sigTop + 4.5 + sigSpace);
  doc.setDrawColor(30, 30, 30);
  doc.line(sigRightX, sigTop + 4.5 + sigSpace + 1, sigRightX + lineLen, sigTop + 4.5 + sigSpace + 1);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(100, 100, 100);
  doc.text("Management", sigRightX, sigTop + 4.5 + sigSpace + 6);
  doc.text("Desa Girimulya, Banjaran", sigRightX, sigTop + 4.5 + sigSpace + 9.5);

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.line(margin, H - 12, W - margin, H - 12);

  doc.setFontSize(6);
  doc.setTextColor(130, 130, 130);
  doc.text(
    "Dokumen ini adalah bukti booking resmi. Verifikasi keaslian scan QR atau kunjungi lebakbarat.girimulya.com/verifikasi",
    W / 2,
    H - 7,
    { align: "center" }
  );

  doc.save(`Invoice-${booking.invoice_number}.pdf`);
}
