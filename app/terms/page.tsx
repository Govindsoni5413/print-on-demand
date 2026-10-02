import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { getCmsPage } from '@/lib/cms-pages';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage('terms');
  return {
    title: page?.seo_title || page?.title || 'Terms of Service',
    description: page?.seo_description || 'Terms of service and customer agreements for REVNTRIX.',
  };
}

const DEFAULT_TERMS = `
# Terms of Service

*Placeholder content. Review and customize in Admin -> Website -> Pages.*

By accessing or placing an order on REVNTRIX, you agree to these Terms:

1. **Ordering**: Orders are placed via WhatsApp and fulfilled upon payment receipt.
2. **Pricing**: All prices are listed in Indian Rupees (₹ INR).
3. **Print-on-Demand**: Every t-shirt is made to order; minor placement variations within industry standards may occur.
4. **Intellectual Property**: Brand graphics and website content are the property of REVNTRIX.
`;

export default async function TermsPage() {
  const page = await getCmsPage('terms');
  const content = page?.content || DEFAULT_TERMS;

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
