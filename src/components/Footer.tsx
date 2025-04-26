import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const [visitorCount] = useState(2356); // This should ideally come from your backend
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      gsap.from(footerRef.current, {
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top bottom',
        }
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="py-12 md:py-16 bg-gray-50 dark:bg-[#0A0B0F]">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[90rem]">
        <div className="max-w-[65rem] flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-6 md:gap-8">
            {/* Visitor Counter */}
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 opacity-75"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-sm md:text-base font-light">
                {visitorCount.toLocaleString()} visitors
              </span>
            </div>

            {/* LinkedIn Link */}
            <div className="flex items-center gap-2">
              <a 
                href="https://www.linkedin.com/in/tijo-j-thomaz93" 
                target="_blank" 
                rel="noopener noreferrer"
                className="opacity-75 hover:opacity-100 transition-opacity"
              >
                <svg 
                  className="w-5 h-5 md:w-6 md:h-6" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="text-sm md:text-base">
            © {currentYear} Tijo Thomas
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 



