import QRCode from "qrcode";
import jsPDF from "jspdf";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

function parseDateOnly(s: string): Date {
  return new Date(s.slice(0, 10) + "T00:00:00");
}

function formatIDR(n: number | null | undefined): string {
  if (n == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
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
  opts?: { verificationBaseUrl?: string }
): Promise<void> {
  const verificationBaseUrl = opts?.verificationBaseUrl || `${baseDomain()}/verifikasi?invoice=`;

  const verificationUrl = `${verificationBaseUrl}${encodeURIComponent(booking.invoice_number)}`;

  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 800,
    margin: 1,
    color: { dark: "#14301c", light: "#ffffff" },
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

  // Top green bar
  doc.setFillColor(20, 48, 28); // #14301c
  doc.rect(0, 0, W, 22, "F");

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", margin, 2.5, 17, 17);
    } catch {
      // ignore
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("BUMI PERKEMAHAN LEBAK BARAT", logoDataUrl ? margin + 20 : margin, 10);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Desa Girimulya, Banjaran, Majalengka 45468 | lebakbarat.girimulya.com",
    logoDataUrl ? margin + 20 : margin,
    15
  );

  // Invoice title block
  doc.setFillColor(251, 192, 45); // tent yellow
  doc.roundedRect(margin, 26, W - margin * 2, 11, 2, 2, "F");
  doc.setTextColor(62, 39, 35);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("INVOICE BOOKING", margin + 4, 33.5);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`No: ${booking.invoice_number}`, W - margin - 4, 33.5, { align: "right" });

  let y = 44;

  function sectionTitle(title: string) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(20, 48, 28);
    doc.text(title, margin, y);
    y += 1;
    doc.setDrawColor(5, 150, 105);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + 30, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
  }

  function kv(label: string, value: string) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(`:  ${value}`, margin + 30, y);
    y += 6;
  }

  sectionTitle("Informasi Booking");
  kv("Nama Sekolah", booking.school_name);
  kv(
    "Tanggal",
    `${format(parseDateOnly(booking.start_date), "d MMMM yyyy", { locale: localeId })} - ${format(parseDateOnly(booking.end_date), "d MMMM yyyy", { locale: localeId })}`
  );
  kv("Durasi", "3 Hari 2 Malam");
  kv("Jumlah Peserta", `${booking.participant_count} siswa`);
  kv("Status", booking.status.toUpperCase());
  if (booking.keterangan) {
    doc.setFont("helvetica", "bold");
    doc.text("Keterangan", margin, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(`:  ${booking.keterangan}`, W - margin * 2 - 30);
    doc.text(lines, margin + 30, y);
    y += lines.length * 5.5 + 1;
  }

  y += 2;
  sectionTitle("Penanggung Jawab");

  kv("Nama PIC", booking.pic_name);
  kv("Kontak PIC", booking.pic_wa || "-");

  y += 2;
  sectionTitle("Pembayaran");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Total Sewa:", margin, y);
  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105);
  doc.text(formatIDR(booking.price), margin + 30, y);
  y += 8;
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  // QR Section
  const qrBox = 48;
  const qrX = W - margin - qrBox;
  const qrY = 58;

  try {
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrBox, qrBox);
  } catch {
    // ignore
  }

  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  const invLines = doc.splitTextToSize(`Invoice: ${booking.invoice_number}`, qrBox);
  doc.text(invLines, qrX, qrY + qrBox + 4);
  doc.text("Scan untuk verifikasi keaslian", qrX, qrY + qrBox + 8);

  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`Link: ${verificationUrl}`, margin, H - 22, { maxWidth: W - margin * 2 });
  if (booking.invoice_generated_at) {
    doc.text(`Dicetak: ${format(new Date(booking.invoice_generated_at), "d MMMM yyyy HH:mm 'WIB'", { locale: localeId })}`, margin, H - 18);
  }

  // Footer
  doc.setFillColor(20, 48, 28);
  doc.rect(0, H - 12, W, 12, "F");
  doc.setFontSize(7);
  doc.setTextColor(200, 230, 200);
  doc.text(
    "Dokumen ini adalah bukti booking resmi. Verifikasi keaslian dengan scan QR atau kunjungi lebakbarat.girimulya.com/verifikasi",
    W / 2,
    H - 5,
    { align: "center" }
  );

  doc.save(`Invoice-${booking.invoice_number}.pdf`);
}
