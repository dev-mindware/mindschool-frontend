export function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <p className="text-sm text-muted-foreground">
      {label}:{" "}
      <span className="font-medium text-foreground break-words">{value}</span>
    </p>
  );
}