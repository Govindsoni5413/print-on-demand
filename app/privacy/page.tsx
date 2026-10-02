import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { getCmsPage } from '@/lib/cms-pages';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage('privacy');
  return {
    title: page?.seo_title || page?.title || 'Privacy Policy',
    description: page?.seo_description || 'Privacy policy for REVNTRIX print-on-demand platform.',
  };
}

const DEFAULT_PRIVACY = `
# Privacy Policy

*Placeholder content. Review and customize in Admin -> Website -> Pages.*

REVNTRIX respects your privacy. When you initiate an order, we collect order specifications, contact phone number, and delivery address to fulfill your print-on-demand shipment.

We do not sell your personal information to third parties. Data is used solely for order dispatch, customer support, and essential website analytics.
`;

export default async function PrivacyPage() {
  const page = await getCmsPage('privacy');
  const content = page?.content || DEFAULT_PRIVACY;

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
