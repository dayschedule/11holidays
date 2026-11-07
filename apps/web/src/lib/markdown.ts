import { fromMarkdown } from 'mdast-util-from-markdown';
import { toString } from 'mdast-util-to-string';

type BlockNode = ReturnType<typeof fromMarkdown>['children'][number];

const LINE_SEPARATED_BLOCKS = new Set(['list', 'listItem', 'blockquote']);

// toString alone would run list items and paragraphs together without a separator.
function blockToText(node: BlockNode): string {
  return 'children' in node && LINE_SEPARATED_BLOCKS.has(node.type)
    ? node.children.map(blockToText).join('\n')
    : toString(node, { includeImageAlt: false });
}

/** Converts Markdown to plain text for uses such as meta tags and JSON-LD. */
export function markdownToText<T extends string | null | undefined>(text: T): T {
  return (text ? fromMarkdown(text).children.map(blockToText).join('\n\n') : text) as T;
}
