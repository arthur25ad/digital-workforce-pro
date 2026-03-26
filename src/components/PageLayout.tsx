import Navbar from "./Navbar";
import Footer from "./Footer";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="relative pt-24 md:pt-28">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageLayout;
