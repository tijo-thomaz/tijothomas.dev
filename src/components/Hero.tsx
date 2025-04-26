import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      // Animate heading
      gsap.from(headingRef.current, {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
        }
      });

      // Animate description with a slight delay
      gsap.from(descriptionRef.current, {
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
    <section ref={sectionRef} className="min-h-screen flex flex-col justify-center py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[90rem]">
        <div className="max-w-[65rem] space-y-8 md:space-y-12 py-32">
          {/* Main Heading */}
          <h1 ref={headingRef} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight text-gray-900 dark:text-[#FAF6F0]">
            Hi, I'm{" "}
            <span className="text-[#4B7BF5] dark:text-[#4B7BF5]">
              Tijo
              <br className="hidden lg:block" />
              Thomas
            </span>
          </h1>
          
          {/* Description */}
          <p ref={descriptionRef} className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light leading-relaxed text-gray-600 dark:text-gray-300 max-w-[45rem]">
            Frontend Engineer specializing in building
            {" "}(and occasionally designing){" "}
            exceptional digital experiences.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;
