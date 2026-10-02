import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { getCmsPage } from '@/lib/cms-pages';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage('about');
  return {
    title: page?.seo_title || page?.title || 'About REVNTRIX',
    description: page?.seo_description || 'Learn about REVNTRIX print-on-demand streetwear philosophy.',
  };
}

const DEFAULT_ABOUT = `
# About REVNTRIX

*Placeholder content. Review and customize in Admin -> Website -> Pages.*

REVNTRIX is a print-on-demand streetwear brand created for original graphic apparel.

### Production Philosophy
We print each t-shirt to order. This eliminates mass inventory waste and ensures every garment is prepared specifically for you.

### Direct Ordering
Instead of traditional checkout carts, orders move directly to our WhatsApp concierge for transparent, personal order confirmation and direct UPI payment.
`;

export default async function AboutPage() {
  const page = await getCmsPage('about');
  const content = page?.content || DEFAULT_ABOUT;

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
