import {
    parseISO,
    getDay,
    addDays,
    subDays,
    format,
    isWeekend,
} from "date-fns";
import { Holiday } from "./holidays-api";

export interface LongWeekend {
    id: number;
    month: string;
    startDate: string;
    endDate: string;
    days: number;
    occasion: string;
    leavesNeeded: number;
    tip: string;
}

/**
 * Given a holiday date, expand outward to include adjacent weekends
 * and optionally suggest up to 2 leaves to bridge gaps.
 */
function expandToLongWeekend(
    holidayDate: Date,
    holidayName: string
): LongWeekend | null {
    const dow = getDay(holidayDate); // 0=Sun … 6=Sat

    let start = holidayDate;
    let end = holidayDate;
    let leavesNeeded = 0;
    let tip = "";

    // Expand backward to include preceding weekends / bridge days
    // Expand forward to include following weekends / bridge days

    switch (dow) {
        case 1: // Monday — Sat-Sun-Mon = 3 days
            start = subDays(holidayDate, 2);
            end = holidayDate;
            break;
        case 2: // Tuesday — Sat-Sun + leave Mon + Tue = 4 days, 1 leave
            start = subDays(holidayDate, 3);
            end = holidayDate;
            leavesNeeded = 1;
            tip = `Take Monday off before ${holidayName} for a 4-day break.`;
            break;
        case 3: // Wednesday — bridge to prev weekend: Sat-Sun + Mon,Tue leave + Wed = 5d, 2 leaves
            start = subDays(holidayDate, 4);
            end = holidayDate;
            // also check if following Sat-Sun is closer
            // attach the following weekend too? let's bridge to prev weekend
            leavesNeeded = 2;
            tip = `Take 2 leaves on ${format(subDays(holidayDate, 2), "d MMM")} & ${format(subDays(holidayDate, 1), "d MMM")} for ${holidayName} to get a 5-day break.`;
            break;
        case 4: // Thursday — Thu-Fri(leave)-Sat-Sun = 4 days, 1 leave
            start = holidayDate;
            end = addDays(holidayDate, 3);
            leavesNeeded = 1;
            tip = `Take Friday off after ${holidayName} for a 4-day break.`;
            break;
        case 5: // Friday — Fri-Sat-Sun = 3 days
            start = holidayDate;
            end = addDays(holidayDate, 2);
            break;
        case 6: // Saturday — Sat-Sun = 2, take Fri off for 3
            start = subDays(holidayDate, 1);
            end = addDays(holidayDate, 1);
            leavesNeeded = 1;
            tip = `Take Friday off before ${holidayName} for a 3-day weekend.`;
            break;
        case 0: // Sunday — Sat-Sun-Mon(leave) = 3, or just Sat-Sun = 2
            start = subDays(holidayDate, 1);
            end = addDays(holidayDate, 1);
            leavesNeeded = 1;
            tip = `Take Monday off after ${holidayName} for a 3-day weekend.`;
            break;
    }

    // Extend start backward if it lands next to a weekend
    while (isWeekend(subDays(start, 1))) {
        start = subDays(start, 1);
    }
    // Extend end forward if it lands next to a weekend
    while (isWeekend(addDays(end, 1))) {
        end = addDays(end, 1);
    }

    const days =
        Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Only include if it's at least 3 days or has a useful tip
    if (days < 3 && leavesNeeded === 0) return null;

    return {
        id: 0, // assigned later
        month: format(holidayDate, "MMMM"),
        startDate: format(start, "yyyy-MM-dd"),
        endDate: format(end, "yyyy-MM-dd"),
        days,
        occasion: holidayName,
        leavesNeeded,
        tip,
    };
}

/**
 * Build a concise tip when multiple occasions are merged.
 */
function buildMergedTip(
    occasions: string[],
    leavesNeeded: number,
    startDate: string,
    endDate: string,
    days: number
): string {
    if (leavesNeeded === 0) return "";
    const leaveWord = leavesNeeded === 1 ? "1 leave" : `${leavesNeeded} leaves`;
    const combinedName = occasions.join(", ");
    return `Take ${leaveWord} around ${combinedName} to enjoy a ${days}-day break (${format(parseISO(startDate), "d MMM")} – ${format(parseISO(endDate), "d MMM")}).`;
}

interface MergeEntry extends LongWeekend {
    occasions: string[];
}

/**
 * Merge overlapping / adjacent long weekends so we don't show duplicates.
 */
function mergeOverlapping(
    weekends: LongWeekend[]
): LongWeekend[] {
    if (!weekends.length) return [];

    // Sort by start date
    const sorted: LongWeekend[] = [...weekends].sort(
        (a, b) =>
            parseISO(a.startDate).getTime() -
            parseISO(b.startDate).getTime()
    );

    // Seed merged array
    const merged: MergeEntry[] = [
        {
            ...sorted[0]!,
            occasions: [sorted[0]!.occasion],
        },
    ];

    for (let i = 1; i < sorted.length; i++) {
        const prev: MergeEntry = merged[merged.length - 1]!;
        const curr: LongWeekend = sorted[i]!;

        const prevEnd = parseISO(prev.endDate);
        const currStart = parseISO(curr.startDate);

        // Overlapping OR adjacent (within 1 day)
        if (currStart.getTime() <= addDays(prevEnd, 1).getTime()) {
            const currEnd = parseISO(curr.endDate);
            const newEnd = currEnd > prevEnd ? currEnd : prevEnd;
            const newStart = parseISO(prev.startDate);

            // Update end date
            prev.endDate = format(newEnd, "yyyy-MM-dd");

            // Recalculate total days
            prev.days =
                Math.round(
                    (newEnd.getTime() - newStart.getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1;

            // Merge occasions
            prev.occasions.push(curr.occasion);
            prev.occasion = prev.occasions.join(" + ");

            // Keep max leaves needed
            prev.leavesNeeded = Math.max(
                prev.leavesNeeded,
                curr.leavesNeeded
            );
        } else {
            merged.push({
                ...curr,
                occasions: [curr.occasion],
            });
        }
    }

    // Build final result without `occasions`
    return merged.map(({ occasions, ...rest }) => {
        const tip =
            occasions.length > 1 || rest.leavesNeeded > 0
                ? buildMergedTip(
                    occasions,
                    rest.leavesNeeded,
                    rest.startDate,
                    rest.endDate,
                    rest.days
                )
                : "";

        return {
            ...rest,
            tip,
        };
    });
}

export function generateLongWeekends(holidays: Holiday[]): LongWeekend[] {
    const raw = holidays
        .map((h) => expandToLongWeekend(parseISO(h.date), h.name))
        .filter((lw): lw is LongWeekend => lw !== null);

    const merged = mergeOverlapping(raw);

    return merged.map((lw, i) => ({ ...lw, id: i + 1 }));
}
