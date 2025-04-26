import { memo } from 'react';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  scrolled: boolean;
}

const Header = memo(({ scrolled }: HeaderProps) => {
  return (
    <header className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-white/80 dark:bg-[#14161C]/80 backdrop-blur-sm' : 'bg-transparent'}
    `}>
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[90rem]">
        <div className="py-4 md:py-6 flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-medium text-gray-900 dark:text-[#FAF6F0]">Tijo Thomas</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header; 