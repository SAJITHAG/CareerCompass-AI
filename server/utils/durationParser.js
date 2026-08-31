// Turns the dataset's free-text Duration column (e.g. "3 - 6 Months") into
// an estimated total hours figure so it can be combined with a student's
// stated weekly study time into an actual timeline.
//
// The dataset only has 4 distinct Duration values (verified against the
// full CSV): "Less Than 2 Hours", "1 - 4 Weeks", "1 - 3 Months", "3 - 6 Months".
// None of them carry a workload number, only a calendar span — so we treat
// each span as if it were completed at a REFERENCE_PACE (a documented,
// adjustable assumption, not a fact from the dataset) and derive an
// implied total-hours figure from that. That total is then what gets
// divided by the student's own hours/week — same content, personalized pace.
const REFERENCE_PACE_HOURS_PER_WEEK = 10; // Coursera's commonly-cited "suggested pace" baseline

const WEEKS_PER_MONTH = 4.33;

// { regex, midpointWeeks } OR a fixed-hours override for the sub-week case
const DURATION_RULES = [
  { pattern: /less than 2 hours/i, fixedHours: 1.5 },
  { pattern: /(\d+)\s*-\s*(\d+)\s*weeks?/i, unit: "weeks" },
  { pattern: /(\d+)\s*-\s*(\d+)\s*months?/i, unit: "months" },
];

/**
 * @param {string} durationRaw - the Course.duration free-text field
 * @returns {{ totalHours: number, midpointWeeksAtReferencePace: number, matched: boolean }}
 */
export const estimateCourseHours = (durationRaw) => {
  const raw = (durationRaw || "").trim();

  for (const rule of DURATION_RULES) {
    const match = raw.match(rule.pattern);
    if (!match) continue;

    if (rule.fixedHours != null) {
      return { totalHours: rule.fixedHours, midpointWeeksAtReferencePace: rule.fixedHours / REFERENCE_PACE_HOURS_PER_WEEK, matched: true };
    }

    const low = parseFloat(match[1]);
    const high = parseFloat(match[2]);
    const midpoint = (low + high) / 2;
    const midpointWeeks = rule.unit === "months" ? midpoint * WEEKS_PER_MONTH : midpoint;
    const totalHours = midpointWeeks * REFERENCE_PACE_HOURS_PER_WEEK;

    return { totalHours: Math.round(totalHours * 10) / 10, midpointWeeksAtReferencePace: Math.round(midpointWeeks * 10) / 10, matched: true };
  }

  // Unrecognized/blank duration — fall back to a conservative flat estimate
  // rather than skipping the course entirely from the timeline.
  return { totalHours: 20, midpointWeeksAtReferencePace: 2, matched: false };
};

export const READINESS_REFERENCE_PACE_HOURS_PER_WEEK = REFERENCE_PACE_HOURS_PER_WEEK;
