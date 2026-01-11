"use client";

import React, { useState } from 'react';
import { Mail } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
      } else if (response.status === 409) {
        setError(data.message || 'You are already subscribed!');
      } else {
        setError(data.error || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <section className="bg-white border-t-2 border-[#E8E6E1] py-12 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#9B2335] border-2 border-[#D4A017] rounded-lg p-8 md:p-10 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
                Thank you for subscribing!
              </h2>
              <p className="text-body-large text-white/90 font-body">
                You'll receive updates about Maryland's craft beer scene.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border-t-2 border-[#E8E6E1] py-12 md:py-14">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#9B2335] border-2 border-[#D4A017] rounded-lg p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
                Stay Updated on Maryland's Craft Beer Scene
              </h2>
              <p className="text-body-large text-white/90 font-body">
                Get the latest brewery news, events, and stories delivered to your inbox.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              {error && (
                <div className="mb-4 p-4 bg-white/20 border border-white/30 text-white rounded-lg text-body font-body">
                  {error}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1C1C1C]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-white/30 bg-white/90 text-[#1C1C1C] placeholder-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-[#D4A017] focus:bg-white text-body font-body disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#D4A017] hover:bg-[#B8870F] text-[#1C1C1C] font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-body font-body whitespace-nowrap"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
