import { downloadDocument } from "@/services";
import type { DocumentType, DownloadType } from "@/types";

type PrintPosDocumentOptions = {
  id: string;
  type: DocumentType;
  thermal: boolean;
};

function createDocumentUrl(data: BlobPart): string {
  const blob = data instanceof Blob ? data : new Blob([data], {
    type: "application/pdf",
  });

  return URL.createObjectURL(blob);
}

async function printThermalDocument(url: string): Promise<void> {
  const printJS = (await import("print-js")).default;

  await new Promise<void>((resolve, reject) => {
    printJS({
      printable: url,
      type: "pdf",
      onPrintDialogClose: resolve,
      onError: reject,
    });
  });
}

function printWithBrowser(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.width = "1px";
    frame.style.height = "1px";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";

    const cleanup = () => {
      frame.remove();
      resolve();
    };

    frame.onload = () => {
      try {
        const printWindow = frame.contentWindow;
        if (!printWindow) {
          reject(new Error("Não foi possível abrir o recurso de impressão."));
          return;
        }

        printWindow.addEventListener("afterprint", cleanup, { once: true });
        printWindow.focus();
        printWindow.print();
        window.setTimeout(cleanup, 60_000);
      } catch (error) {
        frame.remove();
        reject(error);
      }
    };
    frame.onerror = () => {
      frame.remove();
      reject(new Error("Não foi possível carregar o documento para impressão."));
    };
    frame.src = url;
    document.body.appendChild(frame);
  });
}

export async function printPosDocument({
  id,
  type,
  thermal,
}: PrintPosDocumentOptions): Promise<void> {
  const format: DownloadType = thermal ? "thermal" : "pdf";
  const response = await downloadDocument(id, type, format);
  const url = createDocumentUrl(response.data);

  try {
    if (thermal) {
      await printThermalDocument(url);
      return;
    }

    await printWithBrowser(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}
