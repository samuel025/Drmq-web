import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Menu, GitBranch } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light-mode');
    } else {
      document.documentElement.classList.add('light-mode');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-800 bg-slate-900/95">
      <div className="max-w-8xl mx-auto">
        <div className="py-4 border-b border-slate-800 lg:px-8 lg:border-0 mx-4 lg:mx-0">
          <div className="relative flex items-center">
            <button 
              onClick={onMenuClick}
              className="mr-4 lg:hidden text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>

            <a className="mr-3 flex-none w-[2.0625rem] overflow-hidden md:w-auto text-xl font-bold text-white tracking-tight cursor-pointer no-invert" href="/">
              DRMQ<span className="text-cyan-500">.docs</span>
            </a>

            <div className="relative hidden lg:flex items-center ml-auto">
              <nav className="text-sm leading-6 font-semibold text-slate-400">
                <ul className="flex space-x-8">
                  <li>
                    <a href="/" className="hover:text-cyan-400 transition-colors cursor-pointer text-cyan-500">Documentation</a>
                  </li>
                  <li>
                    <a href="https://github.com/samuel025/DRMQ" target="_blank" rel="noreferrer" className="flex items-center hover:text-cyan-400 transition-colors cursor-pointer">
                      <GitBranch className="w-4 h-4 mr-1.5" />
                      GitHub
                    </a>
                  </li>
                </ul>
              </nav>
              <div className="flex items-center border-l border-slate-800 ml-6 pl-6">
                <button 
                  onClick={toggleTheme}
                  className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer block p-1.5 rounded-md hover:bg-slate-800"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            {/* Mobile Search/Right Actions */}
            <div className="flex items-center ml-auto lg:hidden space-x-4">
              <a href="https://github.com/samuel025/DRMQ" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-cyan-400 cursor-pointer">
                <GitBranch className="w-5 h-5" />
              </a>
              <button 
                onClick={toggleTheme}
                className="text-slate-400 hover:text-cyan-400 cursor-pointer p-1.5 rounded-md hover:bg-slate-800"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
