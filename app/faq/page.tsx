import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { getCmsPage } from '@/lib/cms-pages';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage('faq');
  return {
    title: page?.seo_title || page?.title || 'Frequently Asked Questions',
    description: page?.seo_description || 'Frequently asked questions about REVNTRIX drops and ordering.',
  };
}

const DEFAULT_FAQ = `
# Frequently Asked Questions

*Placeholder content. Review and customize in Admin -> Website -> Pages.*

### How do I place an order?
Select your t-shirt design, size, and colorway, then tap "Order on WhatsApp". Your order details will be prefilled in a WhatsApp chat where we confirm payment via UPI.

### What payment methods do you accept?
We accept direct UPI transfers (Google Pay, PhonePe, Paytm, BHIM) securely in WhatsApp.

### How long does production and shipping take?
Each shirt is custom printed to order upon confirmation and dispatched across India via tracked courier.

### Can I request a custom size or graphic?
Yes! Chat with our concierge on WhatsApp to discuss custom artwork placements or bulk crew orders.
`;

export default async function FaqPage() {
  const page = await getCmsPage('faq');
  const content = page?.content || DEFAULT_FAQ;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0A0A0A]">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20 w-full space-y-8">
        <MarkdownContent content={content} />
      </main>

      <Footer />
    </div>
  );
}
