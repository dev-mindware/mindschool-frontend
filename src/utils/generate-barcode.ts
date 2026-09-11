export function generateBarcode(): string {
  const digits = Array.from({ length: 12 }, (_, index) => {
    if (index === 0) return Math.floor(Math.random() * 9) + 1;
    return Math.floor(Math.random() * 10);
  });

  const checksumTotal = digits.reduce(
    (total, digit, index) => total + digit * (index % 2 === 0 ? 1 : 3),
    0,
  );
  const checkDigit = (10 - (checksumTotal % 10)) % 10;

  return `${digits.join("")}${checkDigit}`;
}
