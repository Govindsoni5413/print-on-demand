import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`prose prose-zinc max-w-none text-zinc-700 leading-relaxed ${className}`}>
      <ReactMarkdown
        // Strict safety: DO NOT include rehype-raw. ReactMarkdown escapes raw HTML by default.
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-display font-black tracking-tight text-zinc-950 mt-8 mb-4 border-b border-zinc-100 pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-display font-bold tracking-tight text-zinc-900 mt-6 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold text-zinc-900 mt-5 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-sm text-zinc-600 leading-relaxed mb-4" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1.5 text-sm text-zinc-600 mb-4 pl-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-zinc-600 mb-4 pl-2" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-zinc-600" {...props} />
          ),
          a: ({ node, href, ...props }) => {
            const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="text-zinc-950 underline underline-offset-4 font-medium hover:text-black transition"
                {...props}
              />
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-zinc-300 pl-4 italic text-zinc-500 my-4" {...props} />
          ),
          hr: () => <hr className="border-zinc-200 my-6" />,
          code: ({ node, ...props }) => (
            <code className="bg-zinc-100 text-zinc-800 text-xs px-1.5 py-0.5 rounded font-mono" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
