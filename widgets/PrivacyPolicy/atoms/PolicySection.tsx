"use client";

import { type ReactNode } from 'react';

interface PolicySectionProps {
  title: string;
  children: ReactNode;
}

export const PolicySection = ({ title, children }: PolicySectionProps) => {
  return (
    <section>
      <h2 className="text-lg text-green-400 font-bold mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
};
