import JsBarcode from "jsbarcode";

export function downloadBarcodePng(
  value: string,
  filename = "codigo-de-barras.png",
): void {
  if (!value.trim()) return;

  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value.trim(), {
    format: "CODE128",
    width: 2,
    height: 80,
    displayValue: true,
    fontSize: 16,
    margin: 16,
    background: "#ffffff",
    lineColor: "#000000",
  });

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = filename;
  link.click();
}
