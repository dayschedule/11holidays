import { ZodError, ZodIssue } from 'zod';

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
