import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export interface ExportPdfOptions {
  filename?: string;
  orientation?: "portrait" | "landscape";
  format?: "a4" | "letter";
  marginMm?: number;
}

/**
 * Converte qualquer elemento DOM num PDF de alta resolução e descarrega diretamente para o utilizador.
 */
export async function downloadElementAsPdf(
  elementOrId: HTMLElement | string,
  options: ExportPdfOptions = {},
): Promise<void> {
  const el = typeof elementOrId === "string" ? document.getElementById(elementOrId) : elementOrId;
  if (!el) {
    throw new Error("Elemento para exportação em PDF não foi encontrado no documento.");
  }

  const orientation = options.orientation || "portrait";
  let filename = options.filename || "documento.pdf";
  if (!filename.toLowerCase().endsWith(".pdf")) {
    filename = `${filename}.pdf`;
  }

  const fullWidth = Math.max(el.scrollWidth, el.clientWidth, 1100);

  // Renderizar o elemento com alta resolução (scale: 2) preservando estilos CSS
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: fullWidth + 100,
    onclone: (_clonedDoc, clonedEl) => {
      clonedEl.style.overflow = "visible";
      clonedEl.style.width = "max-content";
      clonedEl.style.maxWidth = "none";
      const tables = clonedEl.querySelectorAll("table");
      tables.forEach((t) => {
        (t as HTMLElement).style.width = "100%";
        (t as HTMLElement).style.maxWidth = "none";
      });
      // Desativar posições sticky no clone para evitar sobreposição no PDF
      const stickies = clonedEl.querySelectorAll<HTMLElement>(".sticky");
      stickies.forEach((s) => {
        s.style.position = "static";
      });
    },
  });

  const pdf = new jsPDF(orientation === "landscape" ? "l" : "p", "mm", options.format || "a4");

  const pageWidth = orientation === "landscape" ? 297 : 210;
  const pageHeight = orientation === "landscape" ? 210 : 297;
  const margin = options.marginMm ?? 8;

  const targetWidth = pageWidth - margin * 2;
  const targetHeight = (canvas.height * targetWidth) / canvas.width;
  const availableHeight = pageHeight - margin * 2;

  // JPEG (e não PNG) e uma fatia da imagem por página: antes cada página repetia a imagem inteira e o ficheiro chegava a 12 MB
  const JPEG_QUALITY = 0.9;
  if (targetHeight <= availableHeight) {
    pdf.addImage(canvas.toDataURL("image/jpeg", JPEG_QUALITY), "JPEG", margin, margin, targetWidth, targetHeight, undefined, "FAST");
  } else {
    const pxPerMm = canvas.width / targetWidth;
    const slicePx = Math.floor(availableHeight * pxPerMm);
    for (let offsetPx = 0, page = 0; offsetPx < canvas.height; offsetPx += slicePx, page += 1) {
      const heightPx = Math.min(slicePx, canvas.height - offsetPx);
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = heightPx;
      const ctx = slice.getContext("2d");
      if (!ctx) throw new Error("Não foi possível preparar a página do PDF.");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, offsetPx, canvas.width, heightPx, 0, 0, canvas.width, heightPx);
      if (page > 0) pdf.addPage(options.format || "a4", orientation === "landscape" ? "l" : "p");
      pdf.addImage(slice.toDataURL("image/jpeg", JPEG_QUALITY), "JPEG", margin, margin, targetWidth, heightPx / pxPerMm, undefined, "FAST");
    }
  }

  pdf.save(filename);
}
