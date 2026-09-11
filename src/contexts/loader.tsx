export function Loader() {
  return (
    <div className="flex flex-col w-screen items-center justify-center min-h-screen bg-background relative selection:bg-transparent">
      <div className="relative flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center w-32 h-32">
          <div className="absolute inset-0 rounded-full border border-purple-500/10 dark:border-purple-400/10"></div>

          <svg
            className="absolute inset-0 w-full h-full animate-spin text-purple-600 dark:text-purple-500"
            viewBox="0 0 100 100"
            style={{ animationDuration: '1.2s' }}
          >
            <defs>
              <linearGradient id="loader-grad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="60%" stopColor="currentColor" stopOpacity="0.2" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle
              cx="50" cy="50" r="49"
              fill="none"
              stroke="url(#loader-grad)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeDasharray="180 200"
              strokeDashoffset="0"
            />
          </svg>

          <img
            src="/mindgest.png"
            alt="Logo"
            className="w-12 h-12 z-10 object-contain drop-shadow-sm opacity-90 transition-opacity"
          />
        </div>

        <div className="absolute -bottom-10 text-[11px] tracking-[0.25em] text-muted-foreground/40 font-medium uppercase font-sans">
          Mindgest
        </div>
      </div>
    </div>
  );
}