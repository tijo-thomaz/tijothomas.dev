import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import bet365Logo from '../assets/bet365.png';
import infosysLogo from '../assets/infosys.svg';
import netobjexLogo from '../assets/netobjex.svg';
import qburstLogo from '../assets/qburst.svg';
import speridianLogo from '../assets/speridian.svg';

// Map company names to their brand colors
const companyColors: { [key: string]: string } = {
  "Bet365": "#006847",
  "Infosys (Home Depot & eBay)": "#0A2240",
  "NetObjex": "#40B7B7",
  "QBurst": "#E84C3D",
  "Speridian (Gogo Aviation)": "#1A1A1A",
};

// Map company names to their logos
const companyLogos: { [key: string]: string } = {
  "Bet365": bet365Logo,
  "Infosys (Home Depot & eBay)": infosysLogo,
  "NetObjex": netobjexLogo,
  "QBurst": qburstLogo,
  "Speridian (Gogo Aviation)": speridianLogo,
};

const experiences = [
  {
    company: "Bet365",
    role: "Software Engineer",
    location: "Manchester, UK",
    period: "Feb 2023 – Present",
    description:
      "Rewrote legacy .NET flows using an in-house TypeScript framework and built Go APIs for platform logic.",
  },
  {
    company: "Infosys (Home Depot & eBay)",
    role: "Frontend Consultant",
    location: "Remote",
    period: "May 2021 – Jan 2023",
    description:
      "Led Angular dashboard dev for Home Depot; built UI payments in Marko.js at eBay with Klarna + Escrow integration.",
  },
  {
    company: "NetObjex",
    role: "Frontend Developer",
    location: "Remote",
    period: "May 2020 – May 2021",
    description:
      "Built a COVID pre-auth portal with Highcharts, React Hooks, and styled components for employee onboarding.",
  },
  {
    company: "QBurst",
    role: "Full Stack Engineer",
    location: "India",
    period: "Nov 2018 – Mar 2020",
    description:
      "Created parking dashboards and IoT map views using AWS Amplify, React, and Google Maps API.",
  },
  {
    company: "Speridian (Gogo Aviation)",
    role: "Trainee Developer",
    location: "India",
    period: "Nov 2016 – Jul 2018",
    description:
      "Built a Chrome extension to test network latency using video stream analytics and browser APIs.",
  },
];

function Timeline() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

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

      // Animate timeline items with stagger
      gsap.from(timelineRef.current?.children || [], {
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
          {/* Section Title */}
          <h2 ref={titleRef} className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-16 md:mb-20 tracking-tight text-gray-900 dark:text-[#FAF6F0]">
            Where I've Worked
          </h2>

          {/* Timeline Items */}
          <div ref={timelineRef} className="space-y-16 md:space-y-20">
            {experiences.map((exp, index) => {
              return (
                <div key={index} className="flex flex-col md:flex-row gap-8 md:gap-12">
                  <div 
                    className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center p-4"
                    style={{ backgroundColor: companyColors[exp.company] }}
                  >
                    <img src={companyLogos[exp.company]} alt={exp.company} className="w-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">{exp.role}</h3>
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-4">{exp.period}</p>
                    <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-[65ch]">{exp.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Signature */}
          <div className="mt-20 md:mt-24 text-right">
            <span className="font-signature text-4xl md:text-5xl text-[#4B7BF5]">
              Tijo Thomas
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Timeline;

