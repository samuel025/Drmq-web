import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { NAVIGATION } from './navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-[4rem] bottom-0 left-0 z-40 w-[19.5rem] overflow-y-auto px-8 pb-10 pt-8
        transition-transform duration-300 ease-in-out bg-slate-900 lg:static lg:block lg:translate-x-0 border-r border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <span className="font-semibold text-slate-200">Navigation</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="relative">
          <ul role="list" className="space-y-9">
            {NAVIGATION.map((section) => (
              <li key={section.title}>
                <h2 className="font-display font-medium text-slate-100 dark:text-white">
                  {section.title}
                </h2>
                <ul role="list" className="mt-4 space-y-2 border-l-2 border-slate-800 lg:mt-4 lg:space-y-2 lg:border-slate-800">
                  {section.links.map((link) => (
                    <li key={link.href} className="relative">
                      <NavLink
                        to={link.href}
                        onClick={onClose}
                        end={link.href === '/docs'}
                        className={({ isActive }) => `
                          block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full
                          text-sm transition-colors cursor-pointer
                          ${isActive 
                            ? 'font-semibold text-cyan-400 before:bg-cyan-400' 
                            : 'text-slate-400 hover:text-slate-200 hover:before:bg-slate-500 before:hidden hover:before:block'
                          }
                        `}
                      >
                        {link.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
