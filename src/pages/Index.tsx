import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, Bell, RefreshCw, MessageSquare, Sparkles, Scissors, Home, Briefcase, Heart, Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { MeshGradient } from "@paper-design/shaders-react";
import BookDemoModal from "@/components/BookDemoModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  { icon: MessageSquare, title: "Requests", desc: "Catches new requests before they get lost." },
  { icon: CalendarCheck, title: "Bookings", desc: "Keeps bookings organized." },
  { icon: Bell, title: "Reminders", desc: "Sends reminders on time." },
  { icon: RefreshCw, title: "Follow-up", desc: "Keeps follow-up moving." },
];

const steps = [
  { num: "01", title: "Connect your tools", desc: "Link your calendar, forms, and messaging in minutes." },
  { num: "02", title: "Set your rules", desc: "Tell VANTORY how you want things handled." },
  { num: "03", title: "Let VANTORY keep things moving", desc: "Requests get caught, bookings stay organized, nothing falls through." },
];

const industries = [
  { icon: Sparkles, label: "Med Spas" },
  { icon: Scissors, label: "Salons" },
  { icon: Stethoscope, label: "Clinics" },
  { icon: Home, label: "Home Services" },
  { icon: Briefcase, label: "Consultants" },
  { icon: Heart, label: "Agencies" },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);
  const heroRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Background music - autoplay on first interaction
  useEffect(() => {
    const audio = new Audio("/audio/background-music.mp3");
    audio.loop = false;
    audio.volume = 0.12;
    audioRef.current = audio;
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    let fadeInterval: ReturnType<typeof setInterval> | null = null;

    const startFadeOut = () => {
      const steps = 80; // 8 seconds / 100ms
      const decrement = 0.12 / steps;
      fadeInterval = setInterval(() => {
        if (audio.volume > 0.005) {
          audio.volume = Math.max(0, audio.volume - decrement);
        } else {
          audio.pause();
          if (fadeInterval) clearInterval(fadeInterval);
        }
      }, 100);
    };

    const onPlay = () => {
      fadeTimer = setTimeout(startFadeOut, 30000);
    };

    const playAudio = () => {
      audio.play().then(onPlay).catch(() => {});
      document.removeEventListener("click", playAudio);
      document.removeEventListener("scroll", playAudio);
      document.removeEventListener("touchstart", playAudio);
    };

    audio.play().then(onPlay).catch(() => {
      document.addEventListener("click", playAudio, { once: true });
      document.addEventListener("scroll", playAudio, { once: true });
      document.addEventListener("touchstart", playAudio, { once: true });
    });

    return () => {
      if (fadeTimer) clearTimeout(fadeTimer);
      if (fadeInterval) clearInterval(fadeInterval);
      audio.pause();
      audio.src = "";
      document.removeEventListener("click", playAudio);
      document.removeEventListener("scroll", playAudio);
      document.removeEventListener("touchstart", playAudio);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowNav(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Navbar appears after scrolling past hero */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <Navbar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ FIXED CONTINUOUS PAPER SHADER BACKGROUND ═══ */}
      <div className="fixed inset-0 z-0">
        <MeshGradient
          style={{ width: "100%", height: "100%" }}
          speed={1.2}
          colors={["#0a0a0f", "#1a1a2e", "#16213e", "#0f0f14"]}
        />
      </div>

      <div
        className="relative z-10 h-screen overflow-y-auto snap-y snap-mandatory"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* ═══ SECTION 1: HERO — Wordmark ═══ */}
        <section
          ref={heroRef}
          className="relative h-screen w-full snap-start snap-always flex items-center justify-center overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 text-center"
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight"
              style={{
                fontFamily: "'SF Pro Display', 'SF Pro', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif",
                backgroundImage:
                  "linear-gradient(135deg, hsl(0 0% 100%), hsl(225 60% 82%), hsl(0 0% 100%), hsl(225 50% 78%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              VANTORY
            </h1>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] text-foreground/50">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-6 bg-foreground/30"
            />
          </motion.div>
        </section>

        {/* ═══ SECTION 2: WHAT THIS IS ═══ */}
        <section className="relative h-screen w-full snap-start snap-always flex items-center justify-center px-6">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            className="max-w-2xl text-center"
          >
            <h2
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground"
              style={{ textWrap: "balance" } as any}
            >
              The AI scheduling assistant for service businesses.
            </h2>
            <p className="mt-5 md:mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
              VANTORY keeps requests, bookings, reminders, and follow-up organized — so nothing falls through.
            </p>
          </motion.div>
        </section>

        {/* ═══ SECTION 3: WHAT IT HANDLES ═══ */}
        <section className="relative min-h-screen w-full snap-start snap-always flex items-center justify-center px-6 py-16">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-4xl w-full text-center"
          >
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              What it handles.
            </h2>
            <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="group rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 md:p-8 text-left transition-colors hover:border-primary/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <f.icon size={20} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══ SECTION 4: HOW IT WORKS ═══ */}
        <section className="relative min-h-screen w-full snap-start snap-always flex items-center justify-center px-6 py-16">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-3xl w-full text-center"
          >
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              How it works.
            </h2>
            <div className="mt-10 md:mt-14 space-y-6 md:space-y-8">
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-5 md:gap-6 text-left"
                >
                  <span className="shrink-0 font-display text-3xl md:text-4xl font-bold text-primary/30">{s.num}</span>
                  <div>
                    <h3 className="font-display text-lg md:text-xl font-semibold text-foreground">{s.title}</h3>
                    <p className="mt-1 text-sm md:text-base text-muted-foreground">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══ SECTION 5: WHO IT'S FOR ═══ */}
        <section className="relative min-h-screen w-full snap-start snap-always flex items-center justify-center px-6 py-16">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="max-w-3xl w-full text-center"
          >
            <h2
              className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground"
              style={{ textWrap: "balance" } as any}
            >
              Built for businesses that live on appointments.
            </h2>
            <div className="mt-10 md:mt-14 flex flex-wrap justify-center gap-3 md:gap-4">
              {industries.map((ind, i) => (
                <motion.span
                  key={ind.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-foreground"
                >
                  <ind.icon size={16} className="text-primary" />
                  {ind.label}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ═══ SECTION 6: CTA ═══ */}
        <section className="relative min-h-screen w-full snap-start snap-always flex items-center justify-center px-6 py-16">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            className="max-w-2xl text-center"
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              See VANTORY in action.
            </h2>
            <p className="mt-4 md:mt-5 text-base md:text-lg text-muted-foreground max-w-md mx-auto">
              Book a demo and see how the workflow would look for your business.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 md:gap-4">
              <button onClick={() => setDemoOpen(true)} className="btn-glow">Book Demo</button>
              <Link to="/pricing" className="btn-outline-glow">Pricing</Link>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <div className="snap-start">
          <Footer />
        </div>
      </div>

      <BookDemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </>
  );
};

export default Index;
