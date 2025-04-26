import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function Connect() {
  const [email, setEmail] = useState('');
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
  };

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

      // Animate form with a slight delay
      gsap.from(formRef.current, {
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

      // Animate signature with a longer delay
      gsap.from(signatureRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
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
    <section ref={sectionRef} className="py-24 md:py-32 bg-gray-50 dark:bg-[#0A0B0F]">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[90rem]">
        <div className="max-w-[65rem]">
          <h2 ref={titleRef} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal mb-16 md:mb-24 tracking-tight text-gray-900 dark:text-[#FAF6F0]">
            Let's Connect
          </h2>

          <div className="space-y-8 md:space-y-12">
            {/* Terminal-style text */}
            <div className="flex items-center gap-4 text-gray-900 dark:text-[#FAF6F0] font-mono text-lg md:text-xl lg:text-2xl">
              <span className="text-[#4B7BF5]">❯</span>
              <span>I want to collaborate with Tijo</span>
              <span className="animate-blink">_</span>
            </div>

            {/* Email input */}
            <form ref={formRef} onSubmit={handleSubmit} className="relative">
              <div className="flex items-center gap-4 text-gray-900 dark:text-[#FAF6F0] font-mono text-lg md:text-xl lg:text-2xl">
                <span>[</span>
                <label htmlFor="email" className="whitespace-nowrap">Enter your email:</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none font-mono text-lg md:text-xl lg:text-2xl text-gray-900 dark:text-[#FAF6F0] focus:ring-0"
                  required
                />
                <span>]</span>
              </div>
              <div className="absolute bottom-0 left-[7.5rem] right-[2rem] h-px bg-gray-900 dark:bg-[#FAF6F0]"></div>
            </form>

            <div ref={signatureRef} className="flex justify-end mt-16 md:mt-24">
              <div className="text-right">
                <div className="font-signature text-3xl md:text-4xl text-gray-900 dark:text-[#FAF6F0]">Thank you!</div>
                <div className="font-signature text-4xl md:text-5xl text-gray-900 dark:text-[#FAF6F0] -mt-2">Tijo</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Connect;
