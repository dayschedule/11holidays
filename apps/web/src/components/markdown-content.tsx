import type { ComponentProps } from 'react';
import Markdown, { type Components } from 'react-markdown';
import { SITE_URL } from '@/lib/seo';

// Descriptions are prose under a page heading, so headings, images and the like render as plain text.
const ALLOWED_ELEMENTS = ['p', 'a', 'strong', 'em', 'ul', 'ol', 'li'];

function toInternalPath(href: string) {
  if (href === SITE_URL || href.startsWith(`${SITE_URL}/`)) return href.slice(SITE_URL.length) || '/';
  return href.startsWith('/') && !href.startsWith('//') ? href : undefined;
}

function MarkdownLink({ href, children }: ComponentProps<'a'>) {
  // react-markdown blanks unsafe URLs such as javascript:
  if (!href) return children;

  const internalPath = toInternalPath(href);
  const className = 'text-primary underline underline-offset-4 hover:no-underline';

  return internalPath ? (
    <a href={internalPath} className={className}>
      {children}
    </a>
  ) : (
    <a href={href} target="_blank" rel="nofollow noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

const components: Components = {
  a: ({ href, children }) => <MarkdownLink href={href}>{children}</MarkdownLink>,
  p: ({ children }) => <p className="whitespace-pre-line">{children}</p>,
  ul: ({ children }) => <ul className="list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-1 pl-6">{children}</ol>,
};

export function MarkdownContent({ text }: { text?: string | null }) {
  if (!text) return null;

  return (
    <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
      <Markdown allowedElements={ALLOWED_ELEMENTS} unwrapDisallowed components={components}>
        {text}
      </Markdown>
    </div>
  );
}
