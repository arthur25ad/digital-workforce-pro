import React, { useState, useEffect, useRef } from 'react';

const slidesData = [
  {
    title: "Generate Code with AI",
    description: "Describe your logic in plain English and watch as the AI generates clean, efficient code in seconds. From Python scripts to complex algorithms.",
    image: "https://images.unsplash.com/photo-1564865878688-9a244444042a?q=80&w=2070&auto=format&fit=crop",
    bgColor: "#fff100",
    textColor: "#000000",
  },
  {
    title: "Debug and Refactor Smarter",
    description: "Paste your buggy code and let the AI identify errors, suggest improvements, and refactor for better readability and performance.",
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop",
    bgColor: "#fff100",
    textColor: "#000000",
  },
  {
    title: "Learn New Languages, Instantly",
    description: "Translate code snippets between languages. Understand syntax and paradigms of a new language by seeing familiar code transformed.",
    image: "https://images.unsplash.com/photo-1608306448197-e83633f1261c?q=80&w=1974&auto=format&fit=crop",
    bgColor: "#fff100",
    textColor: "#000000",
  },
  {
    title: "Automate Your Workflow",
    description: "From writing documentation to generating unit tests, let AI handle the repetitive tasks so you can focus on building great things.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
    bgColor: "#fff100",
    textColor: "#000000",
  },
];

export function ScrollingFeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stickyPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollableHeight = container.scrollHeight - window.innerHeight;
      const stepHeight = scrollableHeight / slidesData.length;
      const newActiveIndex = Math.min(
        slidesData.length - 1,
        Math.floor(container.scrollTop / stepHeight)
      );
      setActiveIndex(newActiveIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const dynamicStyles: React.CSSProperties = {
    backgroundColor: slidesData[activeIndex].bgColor,
    color: slidesData[activeIndex].textColor,
    transition: 'background-color 0.7s ease, color 0.7s ease',
  };

  const gridPatternStyle: React.CSSProperties = {
    backgroundImage: `
      linear-gradient(to right, rgba(0, 0, 0, 0.12) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.12) 1px, transparent 1px)
    `,
    backgroundSize: '3.5rem 3.5rem',
  };

  return (
    <div
      ref={scrollContainerRef}
      className="h-screen w-full overflow-y-auto"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
    >
      <div style={{ height: `${slidesData.length * 100}vh` }}>
        <div
          ref={stickyPanelRef}
          className="sticky top-0 h-screen w-full flex flex-col items-center justify-center"
          style={dynamicStyles}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full max-w-7xl mx-auto">
            {/* Left Column */}
            <div className="relative flex flex-col justify-center px-6 py-12 sm:p-8 md:p-16 md:border-r border-black/10">
              {/* Pagination */}
              <div className="absolute top-8 left-6 sm:top-16 sm:left-16 flex space-x-2">
                {slidesData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const container = scrollContainerRef.current;
                      if (container) {
                        const scrollableHeight = container.scrollHeight - window.innerHeight;
                        const stepHeight = scrollableHeight / slidesData.length;
                        container.scrollTo({ top: stepHeight * index, behavior: 'smooth' });
                      }
                    }}
                    className={`h-1 rounded-full transition-all duration-500 ease-in-out ${
                      index === activeIndex ? 'w-12 bg-black/80' : 'w-6 bg-black/20'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Text content */}
              <div className="relative h-48 sm:h-64 w-full mt-8 md:mt-0">
                {slidesData.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      index === activeIndex
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-10'
                    }`}
                  >
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                      {slide.title}
                    </h2>
                    <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl max-w-md">
                      {slide.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Mobile image */}
              <div className="md:hidden relative w-full h-48 sm:h-64 rounded-xl overflow-hidden shadow-xl border-2 border-black/5 my-4">
                <div
                  className="absolute top-0 left-0 w-full h-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateY(-${activeIndex * 100}%)` }}
                >
                  {slidesData.map((slide, index) => (
                    <div key={index} className="w-full h-full">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="md:absolute md:bottom-16 md:left-16 mt-4 md:mt-0">
                <a
                  href="#get-started"
                  className="inline-block px-8 sm:px-10 py-3 sm:py-4 bg-black text-white font-semibold rounded-full uppercase tracking-wider hover:bg-gray-800 transition-colors text-sm sm:text-base"
                >
                  Get Started
                </a>
              </div>
            </div>

            {/* Right Column - Desktop */}
            <div
              className="hidden md:flex items-center justify-center p-8"
              style={gridPatternStyle}
            >
              <div className="relative w-[50%] h-[80vh] rounded-2xl overflow-hidden shadow-2xl border-4 border-black/5">
                <div
                  className="absolute top-0 left-0 w-full h-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateY(-${activeIndex * 100}%)` }}
                >
                  {slidesData.map((slide, index) => (
                    <div key={index} className="w-full h-full">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScrollingFeatureShowcase;
