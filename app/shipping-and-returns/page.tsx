import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { getCmsPage } from '@/lib/cms-pages';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage('shipping-and-returns');
  return {
    title: page?.seo_title || page?.title || 'Shipping & Returns Policy',
    description: page?.seo_description || 'Review delivery and order guidelines.',
  };
}

const DEFAULT_SHIPPING = `
# Shipping & Returns Policy

*Placeholder content. Review and customize in Admin -> Website -> Pages.*

### Dispatch & Shipping
- Each order is printed on demand upon confirmation on WhatsApp.
- Orders are queued for printing and dispatched across India via tracked couriers.
- Tracking details are provided directly via WhatsApp.

### Order Policy
- As items are custom printed upon order, orders cannot be cancelled once production commences.
- Contact our team on WhatsApp for any order inquiries or updates.
`;

export default async function ShippingAndReturnsPage() {
  const page = await getCmsPage('shipping-and-returns');
  const content = page?.content || DEFAULT_SHIPPING;

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
