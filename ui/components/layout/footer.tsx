interface FooterProps {
  siteName?: string;
}

export function Footer({ siteName = "ApologyHub" }: FooterProps) {
  return (
    <footer className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-t border-white/20 dark:border-gray-700/30 py-8">
      <div className="container px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            An anonymous platform for heartfelt apologies
          </p>
        </div>
      </div>
    </footer>
  );
}
