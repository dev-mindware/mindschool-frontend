type Props = {
  rows?: number;
  cols?: number;
};

export function ListSkeleton({ cols = 4, rows = 4 }: Props) {
  return (
    <div className="space-y-4 mt-4">

      <div className="rounded-lg border-border bg-card p-4">
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {Array.from({ length: cols }).map((_, index) => (
                  <th key={index} className="py-2 px-4">
                    <div className="h-6 w-40 rounded animate-pulse bg-muted" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border">
                  {Array.from({ length: cols }).map((_, colIndex) => (
                    <td key={colIndex} className="py-4 px-4">
                      <div className="h-6 w-full rounded animate-pulse bg-muted" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
