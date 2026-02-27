import { Link, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 relative">
        {!isHome && (
          <div className="absolute top-24 left-0 z-10 mx-auto w-full px-6 md:px-12 lg:px-16">
            <div className="mx-auto max-w-[1600px]">
              <Link
                to="/"
                className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/50 transition-all duration-300 hover:text-white/80 hover:gap-2"
              >
                <ChevronLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
                HOME
              </Link>
            </div>
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
