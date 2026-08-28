import jsPDF from "jspdf";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export type PageSize = "a4" | "f4";

export interface SuratItem {
  no: number;
  institution: string;
  eventName: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  keterangan?: string | null;
}

export interface SuratData {
  nomor: string;
  lampiran: string;
  perihal: string;
  kepada: string[];
  redaksiBody: string;
  tanggalSurat: string;
  pageSize: PageSize;
  items: SuratItem[];
  signKetua: string;
  signSekretaris: string;
  signKades: string;
  signDirBumdes: string;
  headerBase64: string | null;
  footerBase64: string | null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function imageToBase64(src: string): Promise<{ data: string; w: number; h: number; format: string } | null> {
  try {
    const img = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const isPng = src.toLowerCase().endsWith(".png");
    const fmt = isPng ? "PNG" : "JPEG";
    const mime = isPng ? "image/png" : "image/jpeg";
    const data = canvas.toDataURL(mime);
    return { data, w: img.naturalWidth, h: img.naturalHeight, format: fmt };
  } catch { return null; }
}

function fmtTgl(dateStr: string): string {
  try {
    const d = new Date(dateStr.slice(0, 10) + "T00:00:00");
    return format(d, "d MMMM yyyy", { locale: localeId });
  } catch { return dateStr; }
}

function fmtRange(start: string, end: string): string {
  try {
    const s = new Date(start.slice(0, 10) + "T00:00:00");
    const e = new Date(end.slice(0, 10) + "T00:00:00");
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
      return `${format(s, "d", { locale: localeId })} - ${format(e, "d MMMM yyyy", { locale: localeId })}`;
    }
    return `${format(s, "d MMM", { locale: localeId })} - ${format(e, "d MMM yyyy", { locale: localeId })}`;
  } catch { return `${start} - ${end}`; }
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth) as string[];
}

export async function generateSuratPdf(data: SuratData): Promise<{ doc: jsPDF; dataUri: string }> {
  const isF4 = data.pageSize === "f4";
  const pageW = 210;
  const pageH = isF4 ? 330 : 297;
  const marginTop = 5;
  const marginBottom = 5;
  const marginLeft = 25.4;
  const marginRight = 25.4;
  const contentW = pageW - marginLeft - marginRight;
  const contentX = marginLeft;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [pageW, pageH] });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setLineHeightFactor(1.15);

  const headerImg = data.headerBase64 ? await imageToBase64(data.headerBase64) : await imageToBase64("/images/header.png");
  const footerImg = data.footerBase64 ? await imageToBase64(data.footerBase64) : await imageToBase64("/images/footer.png");

  const headerFinalH = 32;
  const footerFinalH = 18;

  function drawHeaderFooter() {
    if (headerImg) {
      try { doc.addImage(headerImg.data, headerImg.format, 0, 0, pageW, headerFinalH); } catch (e) { console.warn("header addImage fail", e); }
    }
    if (footerImg) {
      const y = pageH - footerFinalH;
      doc.setFillColor(255, 255, 255);
      doc.rect(0, y, pageW, footerFinalH, "F");
      try { doc.addImage(footerImg.data, footerImg.format, 0, y, pageW, footerFinalH); } catch (e) { console.warn("footer addImage fail", e); }
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.2);
      doc.line(0, y, pageW, y);
    }
  }

  const topY = marginTop + headerFinalH + 2;
  const bottomY = pageH - marginBottom - footerFinalH - 2;

  let y = topY;
  drawHeaderFooter();

  function ensureSpace(needed: number) {
    if (y + needed > bottomY) {
      doc.addPage([pageW, pageH]);
      drawHeaderFooter();
      y = topY;
    }
  }

  const nomor = data.nomor || "___/BPLB/__/____";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const infoRows: [string, string][] = [
    ["Nomor", nomor],
    ["Lampiran", data.lampiran || "1 (Satu) Berkas"],
    ["Perihal", data.perihal || "Pemberitahuan Kegiatan Perkemahan"],
  ];
  const labelW = 22;
  const colonW = 4;
  for (const [label, value] of infoRows) {
    ensureSpace(6);
    doc.setFont("helvetica", "normal");
    doc.text(label, contentX, y);
    doc.text(":", contentX + labelW, y);
    const valLines = wrapText(doc, value, contentW - labelW - colonW);
    for (let i = 0; i < valLines.length; i++) {
      if (i > 0) ensureSpace(5);
      doc.text(valLines[i]!, contentX + labelW + colonW, y);
      if (i < valLines.length - 1) y += 5;
    }
    y += 6;
  }
  y += 2;

  doc.setFont("helvetica", "normal");
  doc.text("Kepada Yth.,", contentX, y);
  y += 6;
  for (let i = 0; i < data.kepada.length; i++) {
    const p = data.kepada[i]!.trim();
    if (!p) continue;
    ensureSpace(5);
    const num = `${i + 1}. `;
    const maxW = contentW - 8;
    const lines = wrapText(doc, p, maxW);
    doc.text(num, contentX + 2, y);
    for (let li = 0; li < lines.length; li++) {
      if (li > 0) ensureSpace(5);
      doc.text(lines[li]!, contentX + 8, y);
      if (li < lines.length - 1) y += 5;
    }
    y += 6;
  }
  doc.text("di", contentX, y);
  y += 5;
  doc.text("Tempat", contentX, y);
  y += 8;

  doc.text("Dengan hormat,", contentX, y);
  y += 6;

  const bodyRaw = data.redaksiBody.split("\n").map((l) => l.trim()).filter(Boolean);
  const skipSet = new Set([
    `Nomor: ${nomor}`, `Lampiran: ${data.lampiran}`, `Perihal: ${data.perihal}`,
    "Kepada Yth.,", "di", "Tempat", "Dengan hormat,", "Hormat Kami,",
  ]);
  const paragraphs: string[] = [];
  for (const line of bodyRaw) {
    if (skipSet.has(line)) continue;
    if (line.startsWith("Girimulya,")) continue;
    if (line.startsWith("Nomor:") || line.startsWith("Lampiran:") || line.startsWith("Perihal:")) continue;
    if (data.kepada.some((k) => k.trim() === line)) continue;
    if (line === "Kepada Yth.," || line === "di" || line === "Tempat" || line === "Dengan hormat," || line === "Hormat Kami,") continue;
    paragraphs.push(line);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const para of paragraphs) {
    const lines = wrapText(doc, para, contentW);
    const paraH = lines.length * 5;
    ensureSpace(paraH + 4);
    for (const line of lines) {
      ensureSpace(5);
      doc.text(line, contentX, y, { align: "justify", maxWidth: contentW } as never);
      y += 5;
    }
    y += 8;
  }
  const tglStr = data.tanggalSurat ? fmtTgl(data.tanggalSurat) : format(new Date(), "d MMMM yyyy", { locale: localeId });
  doc.setFont("helvetica", "normal");
  doc.text(`Girimulya, ${tglStr}`, pageW / 2, y, { align: "center" });
  y += 6;
  doc.text("Hormat Kami,", pageW / 2, y, { align: "center" });
  y += 20;

  const sigsTop = [
    { label: "Ketua Pengelola\nBuper Lebak Barat", name: data.signKetua || "(___________________)" },
    { label: "Sekretaris", name: data.signSekretaris || "(___________________)" },
  ];
  const sigsBottom = [
    { label: "Mengetahui,\nKepala Desa Girimulya", name: data.signKades || "(___________________)" },
    { label: "Direktur\nBUMDes Gunung Sembung", name: data.signDirBumdes || "(___________________)" },
  ];

  const colW = contentW / 2;
  const leftX = contentX + colW / 2;
  const rightX = contentX + colW + colW / 2;

  ensureSpace(36);

  const yTop = y;
  for (let i = 0; i < 2; i++) {
    const s = sigsTop[i]!;
    const x = i === 0 ? leftX : rightX;
    const parts = s.label.split("\n");
    let ty = yTop;
    for (const p of parts) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text(p, x, ty, { align: "center" });
      ty += 4;
    }
  }
  const yNameTop = yTop + 20;
  for (let i = 0; i < 2; i++) {
    const s = sigsTop[i]!;
    const x = i === 0 ? leftX : rightX;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text(s.name, x, yNameTop, { align: "center" });
  }

  const yBottom = yNameTop + 14;
  ensureSpace(36);
  for (let i = 0; i < 2; i++) {
    const s = sigsBottom[i]!;
    const x = i === 0 ? leftX : rightX;
    const parts = s.label.split("\n");
    let ty = yBottom;
    for (const p of parts) {
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text(p, x, ty, { align: "center" });
      ty += 4;
    }
  }
  const yNameBottom = yBottom + 20;
  for (let i = 0; i < 2; i++) {
    const s = sigsBottom[i]!;
    const x = i === 0 ? leftX : rightX;
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text(s.name, x, yNameBottom, { align: "center" });
  }

  doc.addPage([pageW, pageH]);
  drawHeaderFooter();
  y = topY;

  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("LAMPIRAN", pageW / 2, y, { align: "center" }); y += 6;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text(`Lampiran Surat Nomor: ${nomor}`, pageW / 2, y, { align: "center" }); y += 5;
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text("DAFTAR JADWAL KEGIATAN KEMAH DI BUPER LEBAK BARAT", pageW / 2, y, { align: "center" }); y += 10;

  if (data.items.length === 0) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text("Belum ada jadwal terpilih.", pageW / 2, y, { align: "center" });
  } else {
    const headers = ["No", "Nama Sekolah / Instansi", "Tanggal Pelaksanaan", "Estimasi Jumlah Peserta", "Ket."];
    const colWArr = [12, 62, 52, 40, 28];
    const sumW = colWArr.reduce((a, b) => a + b, 0);
    const scale = contentW / sumW;
    const cols = colWArr.map((w) => w * scale);
    const tableX = contentX;
    const headerH2 = 12;

    function drawHeader(atY: number) {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.setFillColor(255, 255, 255);
      doc.rect(tableX, atY, contentW, headerH2, "FD");
      let cx = tableX;
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(0, 0, 0);
      for (let i = 0; i < headers.length; i++) {
        const w = cols[i]!;
        doc.rect(cx, atY, w, headerH2, "D");
        const t = headers[i]!;
        const lines = wrapText(doc, t, w - 4);
        const lh = 3.5;
        const startY2 = atY + (headerH2 - lines.length * lh) / 2 + 3;
        for (let li = 0; li < lines.length; li++) {
          doc.text(lines[li]!, cx + w / 2, startY2 + li * lh, { align: "center" });
        }
        cx += w;
      }
      return headerH2;
    }

    let tableY = y;
    tableY += drawHeader(tableY);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.2);

    for (let idx = 0; idx < data.items.length; idx++) {
      const it = data.items[idx]!;
      const rowData = [
        String(it.no),
        it.institution,
        fmtRange(it.startDate, it.endDate),
        String(it.participantCount) + " orang",
        it.keterangan?.trim() || "-",
      ];
      const cellLines: string[][] = rowData.map((txt, ci) => wrapText(doc, txt, cols[ci]! - 4));
      const maxLines = Math.max(...cellLines.map((l) => l.length));
      const neededH = Math.max(8, maxLines * 4 + 4);
      if (tableY + neededH > bottomY) {
        doc.addPage([pageW, pageH]);
        drawHeaderFooter();
        tableY = topY;
        tableY += drawHeader(tableY);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8);
        doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.2);
      }
      let cx = tableX;
      for (let ci = 0; ci < rowData.length; ci++) {
        const w = cols[ci]!;
        doc.rect(cx, tableY, w, neededH, "D");
        const lines = cellLines[ci]!;
        const align = ci === 0 || ci === 3 ? "center" : ci === 4 ? "center" : "left";
        const startY2 = tableY + 4.5;
        for (let li = 0; li < lines.length; li++) {
          const ly = startY2 + li * 4;
          const txt = lines[li]!;
          if (align === "center") doc.text(txt, cx + w / 2, ly, { align: "center" });
          else doc.text(txt, cx + 2, ly);
        }
        cx += w;
      }
      tableY += neededH;
    }
    y = tableY + 12;
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.text(`Total: ${data.items.length} kegiatan`, contentX, y);
    y += 12;
    ensureSpace(30);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(`Girimulya, ${tglStr}`, contentX + contentW, y, { align: "right" }); y += 6;
    doc.text("Ketua Pengelola", contentX + contentW, y, { align: "right" }); y += 4;
    doc.text("Buper Lebak Barat,", contentX + contentW, y, { align: "right" }); y += 16;
    doc.setFont("helvetica", "bold");
    doc.text(data.signKetua || "(___________________)", contentX + contentW, y, { align: "right" });
  }

  let dataUri: string;
  try {
    const out = doc.output("datauristring");
    dataUri = out as unknown as string;
  } catch (e) {
    console.error("datauristring fail, fallback bloburi", e);
    const out2 = doc.output("datauri");
    dataUri = out2 as unknown as string;
  }
  return { doc, dataUri };
}
