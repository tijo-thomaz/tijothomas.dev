import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      // Animate title
      gsap.from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
        }
      });

      // Animate content with a slight delay
      gsap.from(contentRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[90rem]">
        <div className="max-w-[65rem]">
          {/* Section Title */}
          <h2 ref={titleRef} className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-12 md:mb-16 tracking-tight text-gray-900 dark:text-[#FAF6F0]">
            About
          </h2>

          {/* Content */}
          <div ref={contentRef} className="text-lg md:text-xl leading-relaxed text-gray-600 dark:text-gray-300 space-y-8 md:space-y-10">
            <p className="max-w-[65ch]">
              Hey there 👋, I'm Tijo — a frontend engineer who genuinely enjoys building immersive,
              scalable web experiences. Whether it's creating modular Angular apps, crafting interactive
              React components, or writing clean Go APIs, I love turning ideas into clean, maintainable code.
            </p>

            <p className="max-w-[65ch]">
              I've had the opportunity to work across diverse domains — from fintech systems at
              <span className="font-medium text-gray-900 dark:text-white"> Bet365</span> to
              enterprise dashboards for <span className="font-medium text-gray-900 dark:text-white">Home Depot</span>,
              e-commerce interfaces at <span className="font-medium text-gray-900 dark:text-white">eBay</span>,
              and IoT-backed map visualizations.
            </p>

            <p className="max-w-[65ch]">
              I believe in clean code, great design systems, fast performance, and thoughtful UX.
              My goal? To keep shipping meaningful products that make life just a little better.
            </p>

            <div className="pt-16 md:pt-20">
              <p className="text-right">
                <span className="font-signature text-4xl md:text-5xl text-[#4B7BF5] dark:text-[#4B7BF5]">
                  Tijo Thomas
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
