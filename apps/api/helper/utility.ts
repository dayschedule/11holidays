import { ZodError, ZodIssue } from 'zod';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString } from 'mdast-util-to-string';

const formatZodIssue = (issue: ZodIssue): string => {
  const { path, message } = issue;
  const pathString = path.join('.');
  return `${pathString}: ${message}`;
};

export const formatZodError = (error: ZodError): string => {
  const { issues } = error;
  if (issues.length) {
    const currentIssue = issues[0];
    return formatZodIssue(currentIssue);
  }
  return '';
};

type BlockNode = ReturnType<typeof fromMarkdown>['children'][number];

const LINE_SEPARATED_BLOCKS = new Set(['list', 'listItem', 'blockquote']);

// toString alone would run list items and paragraphs together without a separator.
const blockToText = (node: BlockNode): string =>
  'children' in node && LINE_SEPARATED_BLOCKS.has(node.type)
    ? node.children.map(blockToText).join('\n')
    : toString(node, { includeImageAlt: false });

// List endpoints convert up to 1000 descriptions per request, so plain prose skips the parser.
const MARKDOWN_MARKER = /[[*_`]/;

// Occasion descriptions can hold Markdown for the website. API responses stay plain text.
export const markdownToText = <T extends string | null | undefined>(text: T): T =>
  (text && MARKDOWN_MARKER.test(text)
    ? fromMarkdown(text).children.map(blockToText).join('\n\n')
    : text) as T;

export const slugify = (str: string) => {
  str = str.replace(/^\s+|\s+$/g, '');
  str = str.toLowerCase();
  str = str
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return str;
};

export const escapeSQL = (str: string) => {
  if (!str) return;
  return str.replace(/'/g, "''"); // Escape single quotes by doubling them
};
