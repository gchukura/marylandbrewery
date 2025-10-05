import React from 'react';

export default function HeroSection() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
          Discover Maryland's <span className="text-black">Brewery Scene</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          From Baltimore's historic breweries to Annapolis' waterfront taprooms
        </p>
      </div>
    </section>
  );
}
