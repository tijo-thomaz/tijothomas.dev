"use client";

import { useState, useEffect, useRef } from "react";

export function useWorldNavigation(initialSection = 0) {
  const [currentSection, setCurrentSection] = useState(initialSection);
  const [navExpanded, setNavExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Navigate to the correct section when world changes
  useEffect(() => {
    if (initialSection !== 0) {
      scrollToSection(initialSection);
    }
  }, [initialSection]);

  // Scroll to specific section
  const scrollToSection = (sectionIndex: number) => {
    const container = scrollContainerRef.current;
    if (container) {
      // Calculate section positions based on viewport height
      const sections = container.querySelectorAll("section");
      if (sections[sectionIndex]) {
        const targetSection = sections[sectionIndex] as HTMLElement;
        container.scrollTo({
          top: targetSection.offsetTop - 100, // Offset for header
          behavior: "smooth",
        });
      }
      setCurrentSection(sectionIndex);
    }
  };

  // Handle scroll to update current section indicator
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const sections = container.querySelectorAll("section");

      let currentSectionIndex = 0;
      sections.forEach((section, index) => {
        const sectionTop = (section as HTMLElement).offsetTop - 200;
        const sectionBottom =
          sectionTop + (section as HTMLElement).offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSectionIndex = index;
        }
      });

      setCurrentSection(currentSectionIndex);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return {
    currentSection,
    navExpanded,
    setNavExpanded,
    scrollContainerRef,
    scrollToSection,
  };
}
