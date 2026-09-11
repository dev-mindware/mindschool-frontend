export function AuthHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
