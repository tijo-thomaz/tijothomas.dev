import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import bet365Logo from '../assets/bet365.svg';
import homedepotLogo from '../assets/homedepot.svg';
import ebayLogo from '../assets/ebay.svg';
import gogoLogo from '../assets/gogo.svg';

const clients = [
  {
    name: "Home Depot",
    logo: homedepotLogo,
    alt: "The Home Depot logo",
  },
  {
    name: "eBay",
    logo: ebayLogo,
    alt: "eBay logo",
  },
  {
    name: "Gogo",
    logo: gogoLogo,
    alt: "Gogo Business Aviation logo",
    subtitle: "BUSINESS AVIATION"
  },
  {
    name: "Bet365",
    logo: bet365Logo,
    alt: "Bet365 logo",
  },
  {
    name: "Home Depot",
    logo: homedepotLogo,
    alt: "The Home Depot logo",
  },
  {
    name: "eBay",
    logo: ebayLogo,
    alt: "eBay logo",
  },
  {
    name: "Gogo",
    logo: gogoLogo,
    alt: "Gogo Business Aviation logo",
    subtitle: "BUSINESS AVIATION"
  },
  {
    name: "Bet365",
    logo: bet365Logo,
    alt: "Bet365 logo",
  },
];

function Clients() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % clients.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      // Animate carousel with a fade-in effect
      gsap.from(carouselRef.current, {
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Create a seamless loop by adding copies before and after
  const displayClients = [...clients, ...clients, ...clients];

  return (
    <section ref={sectionRef} className="py-24 md:py-32 overflow-hidden bg-gray-50 dark:bg-[#0A0B0F]">
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[90rem]">
        <div className="relative">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-r from-gray-50 to-transparent dark:from-[#0A0B0F] dark:to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-32 bg-gradient-to-l from-gray-50 to-transparent dark:from-[#0A0B0F] dark:to-transparent z-10"></div>

          {/* Carousel container */}
          <div 
            ref={carouselRef}
            className="flex items-center gap-12 md:gap-24 transition-transform duration-1000 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex + clients.length) * (100 / clients.length)}%)`,
            }}
          >
            {displayClients.map((client, index) => (
              <div 
                key={`${client.name}-${index}`}
                className="flex-shrink-0 w-32 md:w-48 h-16 md:h-24 flex flex-col items-center justify-center"
              >
                <img
                  src={client.logo}
                  alt={client.alt}
                  className="max-w-full max-h-12 md:max-h-16 object-contain opacity-50 hover:opacity-100 transition-opacity dark:opacity-70 dark:hover:opacity-100"
                />
                {client.subtitle && (
                  <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-2">{client.subtitle}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Clients;
