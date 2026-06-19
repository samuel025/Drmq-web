import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar, NAVIGATION } from './Sidebar';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Flatten the navigation links to calculate prev/next
  const allLinks = NAVIGATION.flatMap(section => section.links);
  const currentIndex = allLinks.findIndex(link => link.href === location.pathname);
  
  const prevLink = currentIndex > 0 ? allLinks[currentIndex - 1] : null;
  const nextLink = currentIndex >= 0 && currentIndex < allLinks.length - 1 ? allLinks[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="flex flex-1 max-w-8xl mx-auto w-full">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 min-w-0 px-4 py-10 lg:px-12 xl:px-16 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <Outlet />
            
            {/* Page Navigation Footer */}
            {(prevLink || nextLink) && (
              <div className="mt-20 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                {prevLink ? (
                  <Link 
                    to={prevLink.href}
                    className="w-full sm:w-1/2 flex flex-col items-start p-4 hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-700/50 group"
                  >
                    <span className="text-xs text-slate-500 mb-1 flex items-center gap-1 group-hover:text-cyan-500 transition-colors">
                      <ArrowLeft className="w-3 h-3" /> Previous
                    </span>
                    <span className="font-medium text-slate-300 group-hover:text-white transition-colors">{prevLink.name}</span>
                  </Link>
                ) : <div className="hidden sm:block sm:w-1/2" />}

                {nextLink ? (
                  <Link 
                    to={nextLink.href}
                    className="w-full sm:w-1/2 flex flex-col items-end p-4 hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-700/50 group text-right"
                  >
                    <span className="text-xs text-slate-500 mb-1 flex items-center gap-1 group-hover:text-cyan-500 transition-colors">
                      Next <ArrowRight className="w-3 h-3" />
                    </span>
                    <span className="font-medium text-slate-300 group-hover:text-white transition-colors">{nextLink.name}</span>
                  </Link>
                ) : <div className="hidden sm:block sm:w-1/2" />}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
