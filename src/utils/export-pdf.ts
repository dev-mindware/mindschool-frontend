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

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF(orientation === "landscape" ? "l" : "p", "mm", options.format || "a4");

  const pageWidth = orientation === "landscape" ? 297 : 210;
  const pageHeight = orientation === "landscape" ? 210 : 297;
  const margin = options.marginMm ?? 8;

  const targetWidth = pageWidth - margin * 2;
  const targetHeight = (canvas.height * targetWidth) / canvas.width;
  const availableHeight = pageHeight - margin * 2;

  if (targetHeight <= availableHeight) {
    pdf.addImage(imgData, "PNG", margin, margin, targetWidth, targetHeight);
  } else {
    let position = 0;
    let remainingHeight = targetHeight;
    while (remainingHeight > 0) {
      if (position > 0) {
        pdf.addPage(options.format || "a4", orientation === "landscape" ? "l" : "p");
      }
      pdf.addImage(imgData, "PNG", margin, margin - position, targetWidth, targetHeight);
      position += availableHeight;
      remainingHeight -= availableHeight;
    }
  }

  pdf.save(filename);
}
