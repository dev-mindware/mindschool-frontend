
export function AlertError({ id , errorMessage}: { id?: string , errorMessage?: string}) {
  return (
    <div
      className="flex items-center gap-1 mt-2 wrap"
      id={`${id}-error`}
      role="alert"
    >
      <span className="text-xs text-red-500">{errorMessage}</span>
    </div>
  );
}
