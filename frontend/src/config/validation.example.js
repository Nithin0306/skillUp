// Example validation configuration file
// Copy this to validation.js and customize as needed

export const INAPPROPRIATE_WORDS = [
  "example1",
  "example2",
  // Add inappropriate words here
];

export const JOB_KEYWORDS = [
  "engineer",
  "developer",
  "manager",
  // Add job-related keywords here
];

export const MEANINGLESS_PATTERNS = [
  /^[a-z]\1{2,}$/i,
  /^[0-9]+$/,
  // Add regex patterns for meaningless input
];

export const NAME_PATTERN = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
