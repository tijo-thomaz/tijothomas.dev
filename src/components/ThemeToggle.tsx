import { useState, useEffect } from 'react';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <div className="flex items-center gap-2 md:gap-3 text-sm">
      <span className="hidden sm:inline font-medium text-gray-500">A</span>
      <span className="hidden sm:inline font-medium text-gray-500">R</span>
      <span className="hidden sm:inline font-medium text-gray-500">G</span>
      <span className="hidden sm:inline font-medium text-gray-500">TS</span>
      <label className="inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={isDark}
          onChange={toggleTheme}
          className="sr-only peer" 
        />
        <div className={`
          relative w-8 h-4 md:w-9 md:h-5 rounded-full 
          bg-gray-200
          dark:bg-gray-700
          peer-checked:bg-gray-700
          dark:peer-checked:bg-gray-600
          after:content-[''] after:absolute after:top-[2px] after:start-[2px]
          after:bg-white
          after:rounded-full after:h-3 after:w-3 md:after:h-4 md:after:w-4
          after:transition-all after:duration-300 after:ease-in-out
          peer-checked:after:translate-x-full
          rtl:peer-checked:after:-translate-x-full
          transition-all duration-300 ease-in-out
        `}></div>
      </label>
    </div>
  );
}

export default ThemeToggle;
