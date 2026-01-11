"use client";

import { useState } from "react";
import PageHero from '@/components/directory/PageHero';
import Link from 'next/link';
import { Map, Building2, CheckSquare } from 'lucide-react';
import '@/components/home-v2/styles.css';

export default function ContactPage() {
  const breadcrumbs = [
    { name: 'Maryland Breweries', url: '/', isActive: false },
    { name: 'Contact', url: '/contact', isActive: true },
  ];
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: (formData.get("name") || "").toString(),
      email: (formData.get("email") || "").toString(),
      subject: (formData.get("subject") || "").toString(),
      message: (formData.get("message") || "").toString(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data?.success) {
        setStatus("success");
        setMessage("Thanks! Your message has been sent.");
        form.reset();
      } else {
        setStatus("error");
        setMessage(data?.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Unexpected error. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <PageHero
        h1="Contact Us"
        introText="Have a question or suggestion? Send us a note and we'll get back to you. Help us keep Maryland's craft brewery directory accurate and comprehensive."
        breadcrumbs={breadcrumbs}
        heroImage="/cities-hero.jpg"
      />
      
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Form Section */}
            <div className="bg-white rounded-lg shadow-sm border border-[#E8E6E1] p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6 font-body">
                <div>
                  <label htmlFor="name" className="block text-body-large font-medium mb-2 text-[#1C1C1C] font-body">Name</label>
                  <input 
                    id="name"
                    name="name" 
                    type="text" 
                    required 
                    autoComplete="name"
                    className="w-full border border-[#E8E6E1] rounded-md px-4 py-3 text-body-large text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#9B2335] focus:border-transparent min-h-[48px] font-body" 
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-body-large font-medium mb-2 text-[#1C1C1C] font-body">Email</label>
                  <input 
                    id="email"
                    name="email" 
                    type="email" 
                    required 
                    autoComplete="email"
                    inputMode="email"
                    className="w-full border border-[#E8E6E1] rounded-md px-4 py-3 text-body-large text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#9B2335] focus:border-transparent min-h-[48px] font-body" 
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-body-large font-medium mb-2 text-[#1C1C1C] font-body">Subject</label>
                  <input 
                    id="subject"
                    name="subject" 
                    type="text" 
                    autoComplete="off"
                    className="w-full border border-[#E8E6E1] rounded-md px-4 py-3 text-body-large text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#9B2335] focus:border-transparent min-h-[48px] font-body" 
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-body-large font-medium mb-2 text-[#1C1C1C] font-body">Message</label>
                  <textarea 
                    id="message"
                    name="message" 
                    rows={6} 
                    required 
                    className="w-full border border-[#E8E6E1] rounded-md px-4 py-3 text-body-large text-[#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#9B2335] focus:border-transparent resize-y font-body" 
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#9B2335] text-white font-semibold px-6 py-3 rounded-md hover:bg-[#7A1C2A] active:bg-[#7A1C2A] transition-colors min-h-[48px] touch-manipulation w-full sm:w-auto text-body-large font-body"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? "Sending..." : "Send Message"}
                </button>

                {status === "success" && <p className="text-green-700 font-medium mt-2 text-body-large font-body">{message}</p>}
                {status === "error" && <p className="text-red-700 font-medium mt-2 text-body-large font-body">{message}</p>}
              </form>
            </div>
          </div>

          {/* Related Links Section - Wider Container */}
          <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-[#E8E6E1]">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C1C1C] mb-6 font-display">Explore More</h2>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                <Link href="/map" className="bg-white rounded-lg p-8 lg:p-10 border border-[#E8E6E1] hover:border-[#9B2335] hover:shadow-md transition-all group min-h-[160px] flex flex-col min-w-0">
                  <div className="flex items-center gap-4 mb-5 flex-shrink-0">
                    <div className="w-14 h-14 rounded-lg bg-[#9B2335]/10 flex items-center justify-center group-hover:bg-[#9B2335]/20 transition-colors flex-shrink-0">
                      <Map className="h-7 w-7 text-[#9B2335]" />
                    </div>
                    <h3 className="font-semibold text-[#1C1C1C] text-body font-body whitespace-nowrap">Interactive Map</h3>
                  </div>
                  <p className="text-body text-[#6B6B6B] font-body mt-auto whitespace-nowrap">Find breweries near you</p>
                </Link>
                <Link href="/cities" className="bg-white rounded-lg p-8 lg:p-10 border border-[#E8E6E1] hover:border-[#9B2335] hover:shadow-md transition-all group min-h-[160px] flex flex-col min-w-0">
                  <div className="flex items-center gap-4 mb-5 flex-shrink-0">
                    <div className="w-14 h-14 rounded-lg bg-[#9B2335]/10 flex items-center justify-center group-hover:bg-[#9B2335]/20 transition-colors flex-shrink-0">
                      <Building2 className="h-7 w-7 text-[#9B2335]" />
                    </div>
                    <h3 className="font-semibold text-[#1C1C1C] text-body font-body whitespace-nowrap">Browse by City</h3>
                  </div>
                  <p className="text-body text-[#6B6B6B] font-body mt-auto whitespace-nowrap">Explore all cities</p>
                </Link>
                <Link href="/amenities" className="bg-white rounded-lg p-8 lg:p-10 border border-[#E8E6E1] hover:border-[#9B2335] hover:shadow-md transition-all group min-h-[160px] flex flex-col min-w-0">
                  <div className="flex items-center gap-4 mb-5 flex-shrink-0">
                    <div className="w-14 h-14 rounded-lg bg-[#9B2335]/10 flex items-center justify-center group-hover:bg-[#9B2335]/20 transition-colors flex-shrink-0">
                      <CheckSquare className="h-7 w-7 text-[#9B2335]" />
                    </div>
                    <h3 className="font-semibold text-[#1C1C1C] text-body font-body whitespace-nowrap">Browse by Amenity</h3>
                  </div>
                  <p className="text-body text-[#6B6B6B] font-body mt-auto whitespace-nowrap">Find features you want</p>
                </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


