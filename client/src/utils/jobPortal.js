// Builds a search-results URL on a public job portal for a given career
// name. No API key / partner integration needed — this just deep-links
// into the portal's own search with the career name pre-filled.
//
// Swap JOB_PORTAL below (or add more) if you'd rather point at Indeed,
// Naukri, etc.
const JOB_PORTAL = {
  name: "LinkedIn",
  buildUrl: (careerName) =>
    `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(careerName)}`,
};

export const getJobPortalName = () => JOB_PORTAL.name;

export const buildJobSearchUrl = (careerName) => JOB_PORTAL.buildUrl(careerName);

// A match is "fully covered" when there are no missing required/optional
// skills left for that career — that's the trigger for showing the
// "Apply Now" link instead of (or alongside) course suggestions.
export const isFullyQualified = (match) => (match?.missingSkills?.length ?? 0) === 0;
