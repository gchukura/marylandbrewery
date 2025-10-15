"use client";

import { useState } from "react";

export default function ContactPage() {
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
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Contact Us</h1>
      <p className="text-gray-700 mb-8">
        Have a question or suggestion? Send us a note and we’ll get back to you.
      </p>

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
    </div>
  );
}


