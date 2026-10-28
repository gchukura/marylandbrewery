'use client';

import { useEffect, useRef, useState } from 'react';
import { deslugify } from '@/lib/slug';
import { Button } from '@/components/ui/button';

const FIELD =
  'w-full rounded-control border-[1.5px] border-line-strong bg-white px-3.5 py-2.5 text-[15px] text-ink placeholder:text-muted focus:border-ink focus:outline-none';
const LABEL = 'mb-1.5 block text-sm font-semibold text-ink';

/** The contact form; posts to /api/contact. */
export default function ContactForm() {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // "Report a change" on a brewery page links here with ?brewery=<slug>: prefill the form
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('brewery');
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) return;
    if (subjectRef.current && !subjectRef.current.value)
      subjectRef.current.value = `Report a change: ${deslugify(slug)}`;
    if (messageRef.current && !messageRef.current.value) {
      messageRef.current.value = `About https://www.marylandbrewery.com/breweries/${slug}\n\nWhat should change (hours, address, website, closed, ...):\n`;
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: (formData.get('name') || '').toString(),
      email: (formData.get('email') || '').toString(),
      subject: (formData.get('subject') || '').toString(),
      message: (formData.get('message') || '').toString(),
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data?.success) {
        setStatus('success');
        setMessage('Thanks! Your message has been sent.');
        form.reset();
      } else {
        setStatus('error');
        setMessage(data?.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Unexpected error. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={LABEL}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="email" className={LABEL}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            className={FIELD}
          />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className={LABEL}>
          Subject
        </label>
        <input
          ref={subjectRef}
          id="subject"
          name="subject"
          type="text"
          autoComplete="off"
          className={FIELD}
        />
      </div>
      <div>
        <label htmlFor="message" className={LABEL}>
          Message
        </label>
        <textarea
          ref={messageRef}
          id="message"
          name="message"
          rows={6}
          required
          className={`${FIELD} resize-y`}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={status === 'loading'}>
          {status === 'loading' ? 'Sending…' : 'Send message'}
        </Button>
        <p role="status" className="m-0 text-[15px] font-medium text-ink">
          {status === 'success' && message}
        </p>
        <p role="alert" className="m-0 text-[15px] font-medium text-brand-red">
          {status === 'error' && message}
        </p>
      </div>
    </form>
  );
}
