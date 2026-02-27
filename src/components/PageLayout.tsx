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
      <main className="pt-20">
        {!isHome && (
          <div className="mx-auto max-w-7xl px-4 pt-4 md:px-8">
            <Link
              to="/"
              className="group inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/40 transition-all duration-300 hover:text-foreground/70 hover:gap-1.5"
            >
              <ChevronLeft size={12} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
              HOME
            </Link>
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
