import { useState, useEffect, Suspense, lazy } from "react";
import Header from "./components/Header";

import Footer from "./components/Footer";

// Lazy load components
const Hero = lazy(() => import("./components/Hero"));
const About = lazy(() => import("./components/About"));
const Timeline = lazy(() => import("./components/Timeline"));
const Projects = lazy(() => import("./components/Projects"));
const Clients = lazy(() => import("./components/Clients"));
const Connect = lazy(() => import("./components/Connect"));

// Debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Scroll animation utility
const useScrollAnimation = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px',
      }
    );

    const sections = document.querySelectorAll('section');
    sections.forEach((section) => {
      section.classList.add('opacity-0', 'translate-y-8', 'transition-all', 'duration-700', 'ease-out');
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);
};

function App() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useScrollAnimation();

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = debounce(() => {
      setScrolled(window.scrollY > 10);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#14161C] text-gray-900 dark:text-white transition-all duration-300 ease-in-out">
      <Header scrolled={scrolled} />

      {/* Main Content */}
      <main>
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
          <Hero />
          <About />
          <Timeline />
          <Projects />
          <Clients />
          <Connect />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
