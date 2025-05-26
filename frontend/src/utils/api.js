// API configuration and utility functions

// Update the API configuration to better handle environment variables and add more robust fallback options

// API configuration with better environment handling and process safety
const getApiBaseUrl = () => {
  // Try all possible environment variables in order of priority
  const apiUrls = [
    import.meta.env.VITE_API_BASE_URL, // Primary URL
    import.meta.env.VITE_BACKEND_API, // Secondary URL
    import.meta.env.VITE_DEV_API_URL, // Development fallback
  ];

  // Find the first defined URL
  const activeUrl = apiUrls.find((url) => url && url.trim() !== "");

  if (activeUrl) {
    return activeUrl;
  }

  // Default fallback based on current location
  if (typeof window !== "undefined") {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    return isLocalhost
      ? "http://localhost:8000" // Default local development URL
      : (() => {
          console.warn(
            "⚠️ No API URL configured. Please set VITE_API_BASE_URL in your environment."
          );
          return "";
        })();
  }

  return "";
};

const getCourseraUrl = () => import.meta.env.VITE_COURSERA_API_URL || "";
const getUdemyUrl = () => import.meta.env.VITE_UDEMY_API_URL || "";

const API_BASE_URL = getApiBaseUrl();

// Debugging output in development
if (import.meta.env.VITE_ENVIRONMENT !== "production") {
  console.log("API Configuration:", {
    environment: import.meta.env.VITE_ENVIRONMENT,
    baseUrl: API_BASE_URL,
    courseraUrl: getCourseraUrl(),
    udemyUrl: getUdemyUrl(),
    isProduction: import.meta.env.PROD,
  });
}

// API endpoints
export const API_ENDPOINTS = Object.freeze({
  // Main backend endpoints
  ANALYZE_RESUME: `${API_BASE_URL}/analyze_resume/`,
  FETCH_COURSES: `${API_BASE_URL}/fetch_courses/`,
  YOUTUBE_COURSES: `${API_BASE_URL}/youtube-courses/`,
  JOB_MATCHING: `${API_BASE_URL}/job_matching/`,
  PROJECT_GENERATOR: `${API_BASE_URL}/project_generator/`,

  // External API endpoints
  COURSERA_API: getCourseraUrl(),
  UDEMY_API: getUdemyUrl(),

  // Utility endpoints
  HEALTH_CHECK: `${API_BASE_URL}/health`,
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || "development",
});

// Helper function to validate URLs
export function validateApiUrl(url) {
  if (!url) {
    console.error("API URL is not defined");
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch (e) {
    console.error(`Invalid API URL: ${url}`);
    return false;
  }
}

// Alternative course sources (fallback options)
export const COURSE_SOURCES = {
  // Free course platforms
  COURSERA_PUBLIC: "https://www.coursera.org/search?query=",
  UDEMY_PUBLIC: "https://www.udemy.com/courses/search/?q=",
  EDEX_PUBLIC: "https://www.edx.org/search?q=",
  KHAN_ACADEMY: "https://www.khanacademy.org/search?page_search_query=",

  // Free coding platforms
  FREECODECAMP: "https://www.freecodecamp.org/learn/",
  CODECADEMY: "https://www.codecademy.com/catalog/subject/",

  // Documentation and tutorials
  MDN_DOCS: "https://developer.mozilla.org/en-US/search?q=",
  W3SCHOOLS: "https://www.w3schools.com/",
};

// Add more comprehensive fallback courses for different domains
export const COMPREHENSIVE_FALLBACK_COURSES = {
  // Programming Languages
  javascript: [
    {
      title: "JavaScript Fundamentals - FreeCodeCamp",
      link: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
      platform: "FreeCodeCamp",
      snippet:
        "Learn JavaScript fundamentals including variables, functions, and data structures",
      isFree: true,
    },
    {
      title: "Modern JavaScript Course",
      link: "https://javascript.info/",
      platform: "JavaScript.info",
      snippet: "Comprehensive JavaScript tutorial covering ES6+ features",
      isFree: true,
    },
  ],
  python: [
    {
      title: "Python for Everybody Specialization",
      link: "https://www.coursera.org/specializations/python",
      platform: "Coursera",
      snippet: "Learn Python programming from basics to advanced concepts",
      isFree: false,
    },
    {
      title: "Python Tutorial - W3Schools",
      link: "https://www.w3schools.com/python/",
      platform: "W3Schools",
      snippet: "Interactive Python tutorial with examples and exercises",
      isFree: true,
    },
  ],
  // Add more comprehensive mappings...
};

// Fallback course recommendations based on skills
export const FALLBACK_COURSES = {
  javascript: [
    {
      title: "JavaScript Fundamentals",
      link: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
      platform: "FreeCodeCamp",
      snippet:
        "Learn JavaScript fundamentals including variables, functions, and data structures",
    },
    {
      title: "Modern JavaScript Course",
      link: "https://www.udemy.com/courses/search/?q=javascript",
      platform: "Udemy",
      snippet: "Comprehensive JavaScript course covering ES6+ features",
    },
  ],
  python: [
    {
      title: "Python for Everybody",
      link: "https://www.coursera.org/search?query=python",
      platform: "Coursera",
      snippet: "Learn Python programming from basics to advanced concepts",
    },
    {
      title: "Python Tutorial",
      link: "https://www.w3schools.com/python/",
      platform: "W3Schools",
      snippet: "Interactive Python tutorial with examples and exercises",
    },
  ],
  react: [
    {
      title: "React Documentation",
      link: "https://react.dev/learn",
      platform: "Official Docs",
      snippet: "Official React documentation and tutorial",
    },
    {
      title: "React Course",
      link: "https://www.freecodecamp.org/learn/front-end-development-libraries/",
      platform: "FreeCodeCamp",
      snippet: "Learn React and build interactive user interfaces",
    },
  ],
  "node.js": [
    {
      title: "Node.js Tutorial",
      link: "https://www.w3schools.com/nodejs/",
      platform: "W3Schools",
      snippet: "Learn Node.js for server-side JavaScript development",
    },
  ],
  sql: [
    {
      title: "SQL Tutorial",
      link: "https://www.w3schools.com/sql/",
      platform: "W3Schools",
      snippet: "Learn SQL for database management and queries",
    },
  ],
  "data analysis": [
    {
      title: "Data Analysis with Python",
      link: "https://www.freecodecamp.org/learn/data-analysis-with-python/",
      platform: "FreeCodeCamp",
      snippet: "Learn data analysis using Python, Pandas, and NumPy",
    },
  ],
  "machine learning": [
    {
      title: "Machine Learning Course",
      link: "https://www.coursera.org/search?query=machine%20learning",
      platform: "Coursera",
      snippet: "Introduction to machine learning algorithms and applications",
    },
  ],
};

// API call wrapper with error handling
export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

// Enhanced course generation with better categorization
export const generateEnhancedFallbackCourses = (missingSkills, jobTitle) => {
  const courses = [];
  const jobTitleLower = jobTitle.toLowerCase();

  // Job-specific course recommendations
  const jobSpecificCourses = {
    "software engineer": [
      {
        title: "Full Stack Web Development",
        link: "https://www.freecodecamp.org/learn/",
        platform: "FreeCodeCamp",
        snippet: "Complete full-stack development curriculum",
        isFree: true,
      },
    ],
    "data scientist": [
      {
        title: "Data Science Fundamentals",
        link: "https://www.kaggle.com/learn",
        platform: "Kaggle Learn",
        snippet: "Free micro-courses in data science and machine learning",
        isFree: true,
      },
    ],
    "product manager": [
      {
        title: "Product Management Fundamentals",
        link: "https://www.coursera.org/search?query=product%20management",
        platform: "Coursera",
        snippet: "Learn product management principles and practices",
        isFree: false,
      },
    ],
  };

  // Add job-specific courses
  Object.keys(jobSpecificCourses).forEach((job) => {
    if (jobTitleLower.includes(job)) {
      courses.push(...jobSpecificCourses[job]);
    }
  });

  // Add skill-specific courses with better matching
  missingSkills.forEach((skill) => {
    const skillLower = skill.toLowerCase();

    // Direct skill matches
    if (COMPREHENSIVE_FALLBACK_COURSES[skillLower]) {
      courses.push(...COMPREHENSIVE_FALLBACK_COURSES[skillLower]);
    }

    // Partial matches and synonyms
    const skillSynonyms = {
      js: "javascript",
      "react.js": "react",
      "node.js": "nodejs",
      ml: "machine learning",
      ai: "artificial intelligence",
    };

    const normalizedSkill = skillSynonyms[skillLower] || skillLower;
    if (COMPREHENSIVE_FALLBACK_COURSES[normalizedSkill]) {
      courses.push(...COMPREHENSIVE_FALLBACK_COURSES[normalizedSkill]);
    }

    // Generic course recommendations
    courses.push({
      title: `${skill} Complete Guide`,
      link: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(
        skill
      )}`,
      platform: "Udemy",
      snippet: `Comprehensive ${skill} courses with practical projects`,
      isFree: false,
    });
  });

  // Remove duplicates and prioritize free courses
  const uniqueCourses = courses
    .filter(
      (course, index, self) =>
        index === self.findIndex((c) => c.title === course.title)
    )
    .sort((a, b) => {
      // Prioritize free courses
      if (a.isFree && !b.isFree) return -1;
      if (!a.isFree && b.isFree) return 1;
      return 0;
    })
    .slice(0, 12); // Limit to 12 courses

  return uniqueCourses;
};

// Generate fallback courses based on missing skills
export const generateFallbackCourses = (missingSkills, jobTitle) => {
  return generateEnhancedFallbackCourses(missingSkills, jobTitle);
};

export default {
  API_ENDPOINTS,
  COURSE_SOURCES,
  FALLBACK_COURSES,
  apiCall,
  generateFallbackCourses,
  COMPREHENSIVE_FALLBACK_COURSES,
  generateEnhancedFallbackCourses,
};
