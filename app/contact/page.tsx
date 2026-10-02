import React from 'react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { getCmsPage } from '@/lib/cms-pages';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage('contact');
  return {
    title: page?.seo_title || page?.title || 'Contact REVNTRIX',
    description: page?.seo_description || 'Get in touch with REVNTRIX support via email or WhatsApp.',
  };
}

const DEFAULT_CONTACT = `
# Contact REVNTRIX

*Placeholder content. Review and customize in Admin -> Website -> Pages.*

Have questions about your order, sizing, or collaboration? Reach our team directly:

- **Email**: revntrix@gmail.com
- **WhatsApp Line 1**: [+91 7852811695](https://wa.me/917852811695)
- **WhatsApp Line 2**: [+91 9376406174](https://wa.me/919376406174)
- **Operating Hours**: Monday – Saturday, 10:00 AM – 8:00 PM IST
`;

export default async function ContactPage() {
  const page = await getCmsPage('contact');
  const content = page?.content || DEFAULT_CONTACT;

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
