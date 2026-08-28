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

function fmtDate(dateStr: string): string {
  try {
    const d = new Date(dateStr.slice(0, 10) + "T00:00:00");
    return format(d, "d MMMM yyyy", { locale: localeId });
  } catch { return dateStr; }
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

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [pageW, pageH] });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const headerImg = data.headerBase64 ? await imageToBase64(data.headerBase64) : await imageToBase64("/images/header.png");
  const footerImg = data.footerBase64 ? await imageToBase64(data.footerBase64) : await imageToBase64("/images/footer.png");

  let headerH = 0;
  let footerH = 0;
  void headerH; void footerH;

  function drawHeaderFooter(pageNum: number) {
    const total = doc.getNumberOfPages();
    if (headerImg) {
      const ratio = headerImg.w / headerImg.h;
      const h = 28;
      const w = h * ratio;
      const x = (pageW - w) / 2;
      try { doc.addImage(headerImg.data, headerImg.format, x, 2, w, h); } catch {}
      headerH = h + 4;
    } else {
      headerH = 0;
    }
    if (footerImg) {
      const ratio = footerImg.w / footerImg.h;
      const h = 16;
      const w = h * ratio;
      const x = (pageW - w) / 2;
      const y = pageH - h - 2;
      try { doc.addImage(footerImg.data, footerImg.format, x, y, w, h); } catch {}
      footerH = h + 4;
    } else {
      footerH = 0;
    }
    void pageNum; void total;
  }

  const topY = marginTop + (headerImg ? 32 : 0);
  const bottomY = pageH - marginBottom - (footerImg ? 20 : 0);

  let y = topY;

  drawHeaderFooter(1);

  function ensureSpace(needed: number) {
    if (y + needed > bottomY) {
      doc.addPage([pageW, pageH]);
      drawHeaderFooter(doc.getNumberOfPages());
      y = topY;
    }
  }

  function addWrapped(text: string, opts?: { bold?: boolean; align?: "left" | "center" | "right" | "justify"; indent?: number }) {
    const style = opts?.bold ? "bold" : "normal";
    doc.setFont("helvetica", style);
    const maxW = contentW - (opts?.indent ?? 0);
    const lines = wrapText(doc, text, maxW);
    for (const line of lines) {
      ensureSpace(5);
      const x = marginLeft + (opts?.indent ?? 0);
      if (opts?.align === "center") doc.text(line, pageW / 2, y, { align: "center" });
      else if (opts?.align === "right") doc.text(line, pageW - marginRight, y, { align: "right" });
      else if (opts?.align === "justify") doc.text(line, x, y, { align: "justify", maxWidth: maxW } as never);
      else doc.text(line, x, y);
      y += 5;
    }
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const nomor = data.nomor || "___/BPLB/__/____";
  addWrapped(`Nomor    : ${nomor}`, { indent: 0 });
  addWrapped(`Lampiran : ${data.lampiran || "1 (Satu) Berkas"}`);
  addWrapped(`Perihal  : ${data.perihal || "Pemberitahuan Kegiatan Perkemahan"}`);
  y += 3;

  addWrapped("Kepada Yth.,");
  for (const p of data.kepada) {
    if (!p.trim()) continue;
    addWrapped(p);
  }
  addWrapped("di");
  addWrapped("Tempat");
  y += 2;

  addWrapped("Dengan hormat,", { indent: 0 });
  y += 1;

  const bodyLines = data.redaksiBody.split("\n").map((l) => l.trim()).filter(Boolean);
  const skipHeaderLines = new Set([
    `Nomor: ${nomor}`,
    `Lampiran: ${data.lampiran}`,
    `Perihal: ${data.perihal}`,
    "Kepada Yth.,",
    "di",
    "Tempat",
    "Dengan hormat,",
    "Hormat Kami,",
  ]);
  for (const line of bodyLines) {
    if (skipHeaderLines.has(line)) continue;
    if (line.startsWith("Girimulya,")) continue;
    if (line.startsWith("Nomor:") || line.startsWith("Lampiran:") || line.startsWith("Perihal:")) continue;
    if (line === "Kepada Yth.," || line === "di" || line === "Tempat" || line === "Dengan hormat," || line === "Hormat Kami,") continue;
    const isRecipient = data.kepada.some((k) => k.trim() === line);
    if (isRecipient) continue;
    doc.setFont("helvetica", "normal");
    const wrapped = wrapText(doc, line, contentW);
    for (const w of wrapped) {
      ensureSpace(5);
      doc.text(w, marginLeft, y, { align: "justify", maxWidth: contentW } as never);
      y += 5;
    }
    y += 1;
  }

  y += 2;
  const tglStr = data.tanggalSurat ? fmtDate(data.tanggalSurat) : format(new Date(), "d MMMM yyyy", { locale: localeId });
  doc.setFont("helvetica", "normal");
  doc.text(`Girimulya, ${tglStr}`, pageW - marginRight, y, { align: "right" });
  y += 5;
  doc.text("Hormat Kami,", pageW - marginRight, y, { align: "right" });
  y += 18;

  const sigs = [
    { label: "Ketua Pengelola\nBuper Lebak Barat", name: data.signKetua || "(___________________)" },
    { label: "Sekretaris", name: data.signSekretaris || "(___________________)" },
  ];
  const sigs2 = [
    { label: "Mengetahui,\nKepala Desa Girimulya", name: data.signKades || "(___________________)" },
    { label: "Direktur\nBUMDes Gunung Sembung", name: data.signDirBumdes || "(___________________)" },
  ];

  const sigY = y;
  const colW = contentW / 2;
  const leftX = marginLeft + colW / 2;
  const rightX = marginLeft + colW + colW / 2;

  for (let i = 0; i < 2; i++) {
    const s = sigs[i]!;
    const x = i === 0 ? leftX : rightX;
    const labelLines = s.label.split("\n");
    for (const ll of labelLines) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(ll, x, y, { align: "center" });
      y += 4;
    }
    doc.setFontSize(10);
  }
  y += 12;
  for (let i = 0; i < 2; i++) {
    const s = sigs[i]!;
    const x = i === 0 ? leftX : rightX;
    doc.setFont("helvetica", "bold");
    doc.text(s.name, x, y, { align: "center" });
  }
  y += 10;

  const sigY2 = y + 4;
  let yy = sigY2;
  for (let i = 0; i < 2; i++) {
    const s = sigs2[i]!;
    const x = i === 0 ? leftX : rightX;
    let ty = sigY2;
    const labelLines = s.label.split("\n");
    for (const ll of labelLines) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(ll, x, ty, { align: "center" });
      ty += 4;
    }
    doc.setFontSize(10);
  }
  yy = sigY2 + 12 + 12;
  for (let i = 0; i < 2; i++) {
    const s = sigs2[i]!;
    const x = i === 0 ? leftX : rightX;
    doc.setFont("helvetica", "bold");
    doc.text(s.name, x, yy, { align: "center" });
  }

  void sigY;

  doc.addPage([pageW, pageH]);
  drawHeaderFooter(2);
  y = topY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("LAMPIRAN", pageW / 2, y, { align: "center" });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Lampiran Surat Nomor: ${nomor}`, pageW / 2, y, { align: "center" });
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("DAFTAR JADWAL KEGIATAN KEMAH DI BUPER LEBAK BARAT", pageW / 2, y, { align: "center" });
  y += 8;

  if (data.items.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Belum ada jadwal terpilih.", pageW / 2, y, { align: "center" });
  } else {
    const headers = ["No", "Institusi / Sekolah", "Kegiatan", "Tanggal", "Peserta"];
    const colWidths = [12, 55, 55, 42, 18];
    const tableX = marginLeft;
    const rowH = 8;
    const headerH2 = 10;

    function drawTableHeader(atY: number) {
      doc.setFillColor(20, 48, 28);
      doc.setDrawColor(180, 180, 180);
      doc.rect(tableX, atY, contentW, headerH2, "FD");
      let cx = tableX;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      for (let i = 0; i < headers.length; i++) {
        const w = colWidths[i]!;
        doc.rect(cx, atY, w, headerH2, "D");
        const txt = headers[i]!;
        doc.text(txt, cx + w / 2, atY + 6, { align: "center" });
        cx += w;
      }
      doc.setTextColor(0, 0, 0);
      return headerH2;
    }

    doc.setDrawColor(180, 180, 180);
    let tableY = y;
    tableY += drawTableHeader(tableY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    for (let idx = 0; idx < data.items.length; idx++) {
      const item = data.items[idx]!;
      const rowData = [
        String(item.no),
        item.institution,
        item.eventName,
        `${fmtDate(item.startDate)} — ${fmtDate(item.endDate)}`,
        String(item.participantCount),
      ];

      const cellLines: string[][] = rowData.map((txt, ci) => {
        const w = colWidths[ci]! - 4;
        return wrapText(doc, txt, w);
      });
      const maxLines = Math.max(...cellLines.map((l) => l.length));
      const neededH = Math.max(rowH, maxLines * 4 + 4);

      if (tableY + neededH > bottomY) {
        doc.addPage([pageW, pageH]);
        drawHeaderFooter(doc.getNumberOfPages());
        tableY = topY;
        tableY += drawTableHeader(tableY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
      }

      const isEven = idx % 2 === 0;
      if (isEven) {
        doc.setFillColor(245, 245, 240);
        doc.rect(tableX, tableY, contentW, neededH, "F");
      }

      let cx = tableX;
      for (let ci = 0; ci < rowData.length; ci++) {
        const w = colWidths[ci]!;
        doc.setDrawColor(180, 180, 180);
        doc.rect(cx, tableY, w, neededH, "D");
        const lines = cellLines[ci]!;
        const align = ci === 0 || ci === 4 ? "center" : "left";
        const startY = tableY + 4.5;
        for (let li = 0; li < lines.length; li++) {
          const ly = startY + li * 4;
          const txt = lines[li]!;
          if (align === "center") doc.text(txt, cx + w / 2, ly, { align: "center" });
          else doc.text(txt, cx + 2, ly);
        }
        cx += w;
      }
      tableY += neededH;
    }

    y = tableY + 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Total: ${data.items.length} kegiatan`, marginLeft, y);
  }

  const dataUri = doc.output("datauristring") as string;
  return { doc, dataUri };
}
