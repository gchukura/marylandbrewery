"use client";

import { useState } from "react";
import PageHero from '@/components/directory/PageHero';
import Link from 'next/link';

export default function ContactPage() {
  const breadcrumbs = [
    { name: 'Home', url: '/', isActive: false },
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
    <div className="bg-gray-50 min-h-screen">
      <PageHero
        h1="Contact Us"
        introText="Have a question or suggestion? Send us a note and we'll get back to you. Help us keep Maryland's craft brewery directory accurate and comprehensive."
        breadcrumbs={breadcrumbs}
      />
      
      <div className="max-w-2xl mx-auto px-4 py-12">

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800">Name</label>
          <input name="name" type="text" required className="w-full border rounded px-3 py-2 text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800">Email</label>
          <input name="email" type="email" required className="w-full border rounded px-3 py-2 text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800">Subject</label>
          <input name="subject" type="text" className="w-full border rounded px-3 py-2 text-gray-900" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-800">Message</label>
          <textarea name="message" rows={6} required className="w-full border rounded px-3 py-2 text-gray-900" />
        </div>
        <button
          type="submit"
          className="bg-red-600 text-white font-semibold px-5 py-2 rounded hover:bg-red-700 transition"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Sending..." : "Send"}
        </button>

        {status === "success" && <p className="text-green-700 font-medium mt-2">{message}</p>}
        {status === "error" && <p className="text-red-700 font-medium mt-2">{message}</p>}
      </form>

      {/* Related Links Section */}
      <section className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Explore More</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/map" className="bg-white rounded-lg p-4 border border-gray-200 hover:border-red-500 hover:shadow-md transition-all">
            <div className="font-semibold text-gray-900">Interactive Map</div>
            <div className="text-sm text-gray-600 mt-1">Find breweries near you</div>
          </Link>
          <Link href="/city" className="bg-white rounded-lg p-4 border border-gray-200 hover:border-red-500 hover:shadow-md transition-all">
            <div className="font-semibold text-gray-900">Browse by City</div>
            <div className="text-sm text-gray-600 mt-1">Explore all cities</div>
          </Link>
          <Link href="/amenities" className="bg-white rounded-lg p-4 border border-gray-200 hover:border-red-500 hover:shadow-md transition-all">
            <div className="font-semibold text-gray-900">Browse by Amenity</div>
            <div className="text-sm text-gray-600 mt-1">Find features you want</div>
          </Link>
        </div>
      </section>
      </div>
    </div>
  );
}


