import { getISOWeek } from 'date-fns';
import type { jsPDF } from 'jspdf';
import {
  getWeekDays,
  type CalendarDay,
  type CalendarMonth,
  type CalendarThemeColors,
  type WeekStart,
} from './calendar-utils';

const UNSUPPORTED_COLOR = /oklch|oklab|lab\(|lch\(|color\(/;

/** Renders a calendar element to a canvas for PNG and image PDF exports */
export async function captureCalendar(element: HTMLElement, theme: CalendarThemeColors) {
  const { default: html2canvas } = await import('html2canvas');
  return html2canvas(element, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: theme.background,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    onclone: (clonedDoc) => {
      // html2canvas cannot parse modern color functions used by the site theme
      clonedDoc.querySelectorAll<HTMLElement>('*').forEach((el) => {
        const computed = clonedDoc.defaultView!.getComputedStyle(el);
        if (UNSUPPORTED_COLOR.test(computed.color)) el.style.color = theme.text;
        if (UNSUPPORTED_COLOR.test(computed.backgroundColor)) el.style.backgroundColor = 'transparent';
        if (UNSUPPORTED_COLOR.test(computed.borderTopColor + computed.borderBottomColor + computed.borderLeftColor + computed.borderRightColor))
          el.style.borderColor = 'transparent';
        if (UNSUPPORTED_COLOR.test(computed.outlineColor)) el.style.outlineColor = 'transparent';
        if (UNSUPPORTED_COLOR.test(computed.textDecorationColor)) el.style.textDecorationColor = 'currentColor';
      });
    },
  });
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

export type PaperSize = 'a4' | 'letter';

interface PdfOptions {
  year: number;
  months: CalendarMonth[];
  theme: CalendarThemeColors;
  heading?: string;
  weekStart: WeekStart;
  paper: PaperSize;
  /** Adds the full year on one portrait page */
  overview: boolean;
  /** Adds a landscape page for each of `months` */
  monthPages: boolean;
  filename: string;
}

const MARGIN = 28;
const FOOTER = 'Made with 11holidays.com';
const FOOTER_URL = 'https://11holidays.com';

/** The built-in PDF fonts only cover Latin-1, so keep names readable instead of printing boxes */
function pdfText(value: string) {
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\xff]/g, '');
}

function paintPage(pdf: jsPDF, theme: CalendarThemeColors) {
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  if (theme.background.toLowerCase() !== '#ffffff') {
    pdf.setFillColor(theme.background);
    pdf.rect(0, 0, width, height, 'F');
  }
  pdf.setFont('helvetica', 'normal').setFontSize(7).setTextColor(theme.text);
  pdf.textWithLink(FOOTER, width - MARGIN - pdf.getTextWidth(FOOTER), height - 14, { url: FOOTER_URL });
  return { width, height };
}

function titleBand(pdf: jsPDF, theme: CalendarThemeColors, width: number, title: string, subtitle?: string) {
  const height = subtitle ? 50 : 38;
  pdf.setFillColor(theme.primary);
  pdf.roundedRect(MARGIN, MARGIN, width - MARGIN * 2, height, 6, 6, 'F');
  pdf.setTextColor('#ffffff');
  pdf.setFont('helvetica', 'bold').setFontSize(20);
  pdf.text(pdfText(title), width / 2, MARGIN + 25, { align: 'center' });
  if (subtitle) {
    pdf.setFont('helvetica', 'normal').setFontSize(10);
    pdf.text(pdfText(subtitle), width / 2, MARGIN + 41, { align: 'center' });
  }
  return MARGIN + height + 14;
}

/** Drops the trailing weeks that have no day of this month */
function monthWeeks(days: CalendarDay[]) {
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    const week = days.slice(i, i + 7);
    if (week.some((d) => d.isCurrentMonth)) weeks.push(week);
  }
  return weeks;
}

function drawYearPage(pdf: jsPDF, { year, months, theme, heading, weekStart }: PdfOptions) {
  const { width, height } = paintPage(pdf, theme);
  const top = titleBand(pdf, theme, width, String(year), heading);

  const columns = 3;
  const rows = 4;
  const gap = 16;
  const blockWidth = (width - MARGIN * 2 - gap * (columns - 1)) / columns;
  const blockHeight = (height - top - MARGIN - gap * (rows - 1)) / rows;
  const cellWidth = blockWidth / 7;
  const cellHeight = (blockHeight - 30) / 6;
  const letters = getWeekDays(weekStart, 'narrow');

  months.forEach((month, index) => {
    const x = MARGIN + (index % columns) * (blockWidth + gap);
    const y = top + Math.floor(index / columns) * (blockHeight + gap);

    pdf.setFont('helvetica', 'bold').setFontSize(11).setTextColor(theme.primary);
    pdf.text(month.name, x + blockWidth / 2, y + 10, { align: 'center' });

    pdf.setFontSize(7);
    letters.forEach((letter, i) => pdf.text(letter, x + cellWidth * (i + 0.5), y + 23, { align: 'center' }));

    monthWeeks(month.days).forEach((week, row) => {
      week.forEach((day, column) => {
        if (!day.isCurrentMonth) return;
        const cx = x + cellWidth * column;
        const cy = y + 28 + cellHeight * row;
        const holiday = day.holidays.length > 0;
        if (holiday) {
          pdf.setFillColor(theme.holiday);
          pdf.roundedRect(cx + 1, cy + 0.5, cellWidth - 2, cellHeight - 1, 2, 2, 'F');
        }
        pdf.setFont('helvetica', holiday ? 'bold' : 'normal').setFontSize(8);
        pdf.setTextColor(holiday ? '#ffffff' : day.isWeekend ? theme.primary : theme.text);
        pdf.text(String(day.day), cx + cellWidth / 2, cy + cellHeight / 2 + 2.8, { align: 'center' });
      });
    });
  });
}

function drawMonthPage(pdf: jsPDF, month: CalendarMonth, { year, theme, heading, weekStart }: PdfOptions) {
  const { width, height } = paintPage(pdf, theme);
  const top = titleBand(pdf, theme, width, `${month.name} ${year}`, heading);

  const weekColumn = 22;
  const headerHeight = 18;
  const gridWidth = width - MARGIN * 2 - weekColumn;
  const cellWidth = gridWidth / 7;
  const weeks = monthWeeks(month.days);
  const cellHeight = (height - top - headerHeight - MARGIN) / weeks.length;
  const left = MARGIN + weekColumn;

  pdf.setFont('helvetica', 'bold').setFontSize(9).setTextColor(theme.primary);
  pdf.text('Wk', MARGIN + weekColumn / 2, top + 11, { align: 'center' });
  getWeekDays(weekStart).forEach((name, i) => {
    pdf.text(name, left + cellWidth * (i + 0.5), top + 11, { align: 'center' });
  });

  weeks.forEach((week, row) => {
    const y = top + headerHeight + cellHeight * row;

    // The Monday of the row names the ISO week
    pdf.setFont('helvetica', 'normal').setFontSize(8).setTextColor(theme.text);
    pdf.text(String(getISOWeek(week[weekStart === 'sun' ? 1 : 0]!.date)), MARGIN + weekColumn / 2, y + 14, { align: 'center' });

    week.forEach((day, column) => {
      const x = left + cellWidth * column;
      const holiday = day.isCurrentMonth && day.holidays.length > 0;

      pdf.setDrawColor(theme.soft).setLineWidth(0.6);
      pdf.setFillColor(holiday ? theme.soft : day.isCurrentMonth && day.isWeekend ? theme.secondary : theme.background);
      pdf.rect(x, y, cellWidth, cellHeight, 'FD');

      pdf.setFont('helvetica', 'bold').setFontSize(12);
      pdf.setTextColor(!day.isCurrentMonth ? theme.soft : holiday || day.isWeekend ? theme.primary : theme.text);
      pdf.text(String(day.day), x + 6, y + 15);

      if (!holiday) return;
      pdf.setFont('helvetica', 'normal').setFontSize(7).setTextColor(theme.text);
      const lineHeight = 8.5;
      const maxLines = Math.max(1, Math.floor((cellHeight - 22) / lineHeight));
      const lines = day.holidays.flatMap((h) => pdf.splitTextToSize(pdfText(h.name), cellWidth - 10) as string[]);
      const shown = lines.length > maxLines ? [...lines.slice(0, maxLines - 1), `+${lines.length - maxLines + 1} more`] : lines;
      shown.forEach((line, i) => pdf.text(line, x + 5, y + 24 + i * lineHeight));
    });
  });
}

/** Writes a real vector PDF, so text stays sharp at any print size and the file stays small */
export async function downloadCalendarPdf(options: PdfOptions) {
  const { default: JsPdf } = await import('jspdf');
  const { paper, overview, monthPages, months, filename } = options;

  const pdf = new JsPdf({ unit: 'pt', format: paper, orientation: overview ? 'portrait' : 'landscape' });
  if (overview) drawYearPage(pdf, options);
  if (monthPages) {
    months.forEach((month, i) => {
      if (overview || i > 0) pdf.addPage(paper, 'landscape');
      drawMonthPage(pdf, month, options);
    });
  }
  pdf.save(filename);
}
