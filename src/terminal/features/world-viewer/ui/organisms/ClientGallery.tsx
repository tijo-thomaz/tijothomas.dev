"use client";

import SectionTitle from "../atoms/SectionTitle";
import ClientCard from "../molecules/ClientCard";
import { clientsData } from "../../model/worldData";

export default function ClientGallery() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-4 md:px-8 py-8 bg-gradient-to-br from-yellow-900/20 to-orange-900/20">
      <div className="mb-6 md:mb-8">
        <SectionTitle
          title="Client Gallery"
          subtitle="Success stories from major companies"
          color="yellow"
        />
      </div>
      
      <div className="max-w-6xl mx-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          {clientsData.map((client, index) => (
            <ClientCard
              key={index}
              {...client}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
