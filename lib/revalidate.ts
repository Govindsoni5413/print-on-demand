import React from 'react';
import { toast } from 'sonner';

export async function triggerRevalidation(
  paths: string[] = ['/'],
  isLayout: boolean = false,
  viewUrl: string = '/'
) {
  try {
    const res = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths, isLayout }),
    });

    if (res.ok) {
      toast.success(
        React.createElement(
          'div',
          { className: 'flex items-center justify-between gap-4 w-full' },
          React.createElement('span', null, 'Saved ✓'),
          React.createElement(
            'a',
            {
              href: viewUrl,
              target: '_blank',
              rel: 'noopener noreferrer',
              className: 'text-xs font-bold underline text-emerald-700 hover:text-emerald-900',
            },
            'View on site ↗'
          )
        )
      );
    }
  } catch (e) {
    console.warn('Revalidation trigger error:', e);
  }
}
