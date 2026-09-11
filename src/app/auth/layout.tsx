export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen min-h-dvh w-full overflow-hidden bg-background">
      <>{children}</>
    </main>
  );
}
