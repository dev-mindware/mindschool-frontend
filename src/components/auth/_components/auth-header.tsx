export function AuthHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-2xl font-semibold text-foreground">
        {title}
      </h1>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
