"use client";

import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    console.log('Newsletter signup:', email);
    setIsSubscribed(true);
    setEmail('');
  };

  if (isSubscribed) {
    return (
      <section className="bg-yellow-500 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-black mb-4">
              Thank you for subscribing!
            </h2>
            <p className="text-black text-lg">
              You'll receive updates about Maryland's craft beer scene.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-yellow-500 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-4">
              Stay Updated on Maryland's Craft Beer Scene
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-black text-black placeholder-black/70 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
