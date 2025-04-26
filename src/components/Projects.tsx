import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const projects = [
  {
    title: "StreamProbe",
    description: "Chrome extension for monitor network speed",
    metric: "Mbps",
    type: "speed",
    hasGraph: true,
  },
  {
    title: "SecureCart",
    description: "Parental control & productivity application",
    hasKlarna: true,
  },
  {
    title: "FocusGuardian",
    description: "Finish essay",
    hasStartButton: true,
  },
  {
    title: "GeoPulse",
    description: "Geolocation dashboard",
  },
];

function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

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

      // Animate project cards with stagger
      gsap.from(projectsRef.current?.children || [], {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
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
          <h2 ref={titleRef} className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-16 md:mb-20 tracking-tight text-gray-900 dark:text-[#FAF6F0]">
            Projects
          </h2>

          <div ref={projectsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {projects.map((project, index) => (
              <div
                key={index}
                className="bg-gray-100 dark:bg-[#13151C] rounded-3xl p-8 md:p-10 hover:bg-gray-200 dark:hover:bg-[#1A1C23] transition-colors"
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4">
                    {project.title}
                  </h3>

                  {project.metric && (
                    <div className="flex items-baseline gap-4 mb-6">
                      <span className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">0/30</span>
                      <span className="text-gray-600 dark:text-gray-400">{project.metric}</span>
                      {project.hasGraph && (
                        <div className="ml-auto">
                          <svg
                            className="w-24 h-8"
                            viewBox="0 0 96 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M2 25L10 20L18 28L26 15L34 22L42 12L50 18L58 5L66 15L74 8L82 20L94 10"
                              stroke="#4B7BF5"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  {project.hasKlarna && (
                    <div className="mb-6 bg-gray-200 dark:bg-[#1A1C23] rounded-xl p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Checkout</div>
                      <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <span>Pay with</span>
                        <span className="font-semibold">Klarna</span>
                      </div>
                    </div>
                  )}

                  {project.hasStartButton && (
                    <button className="w-full bg-[#4B7BF5] text-white rounded-xl py-4 mb-6 font-medium hover:bg-[#3D63C9] transition-colors">
                      Start
                    </button>
                  )}

                  <p className="text-gray-600 dark:text-gray-400 mb-8 line-clamp-2">{project.description}</p>

                  <div className="mt-auto flex gap-4">
                    <button className="px-6 py-3 bg-gray-200 dark:bg-[#1A1C23] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#22242C] transition-colors">
                      Demo
                    </button>
                    <button className="px-6 py-3 bg-gray-200 dark:bg-[#1A1C23] text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-[#22242C] transition-colors">
                      Code
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Projects;
