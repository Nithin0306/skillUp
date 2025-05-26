"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import LoadingAnimation from "./LoadingAnimation";
import { Analytics } from "@vercel/analytics/react";
import { API_ENDPOINTS, generateEnhancedFallbackCourses } from "../utils/api";
import {
  Sparkles,
  BookOpen,
  Lightbulb,
  BriefcaseIcon as BriefcaseConveyorBelt,
  Youtube,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Download,
  Share2,
  ExternalLink,
} from "lucide-react";

const Results = () => {
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState(null);
  const [missingSkills, setMissingSkills] = useState([]);
  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]);
  const [jobRecommendations, setJobRecommendations] = useState("");
  const [projectIdeas, setProjectIdeas] = useState("");
  const [activeTab, setActiveTab] = useState("skills");
  const [loadingStates, setLoadingStates] = useState({
    skills: true,
    courses: true,
    videos: true,
    jobs: true,
    projects: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Get analysis data from sessionStorage
    const storedData = sessionStorage.getItem("analysisData");
    if (!storedData) {
      navigate("/");
      return;
    }

    const data = JSON.parse(storedData);
    setAnalysisData(data);

    // Start the analysis process
    performAnalysis(data);
  }, [navigate]);

  const performAnalysis = async (data) => {
    const { file, jobTitle } = data;

    try {
      // Convert base64 back to file
      const response = await fetch(file.data);
      const blob = await response.blob();
      const fileObj = new File([blob], file.name, { type: file.type });

      const formData = new FormData();
      formData.append("file", fileObj);
      formData.append("job_title", jobTitle);

      // Start all API calls simultaneously for better performance
      const apiCalls = [
        analyzeResume(formData),
        fetchCourses(jobTitle),
        fetchVideos(jobTitle),
      ];

      // Execute API calls with progressive updates
      Promise.allSettled(apiCalls).then((results) => {
        const [resumeResult, coursesResult, videosResult] = results;

        if (resumeResult.status === "fulfilled") {
          const skillsList = resumeResult.value;
          setMissingSkills(skillsList);
          setLoadingStates((prev) => ({ ...prev, skills: false }));

          // Now fetch job matching and projects based on skills
          Promise.allSettled([
            fetchJobMatching(skillsList),
            fetchProjects(skillsList),
          ]).then(([jobResult, projectResult]) => {
            if (jobResult.status === "fulfilled") {
              setJobRecommendations(jobResult.value);
              setLoadingStates((prev) => ({ ...prev, jobs: false }));
            } else {
              setErrors((prev) => ({
                ...prev,
                jobs: "Failed to load job recommendations",
              }));
              setLoadingStates((prev) => ({ ...prev, jobs: false }));
            }

            if (projectResult.status === "fulfilled") {
              setProjectIdeas(projectResult.value);
              setLoadingStates((prev) => ({ ...prev, projects: false }));
            } else {
              setErrors((prev) => ({
                ...prev,
                projects: "Failed to load project ideas",
              }));
              setLoadingStates((prev) => ({ ...prev, projects: false }));
            }
          });
        } else {
          setErrors((prev) => ({
            ...prev,
            skills: "Failed to analyze resume",
          }));
          setLoadingStates((prev) => ({ ...prev, skills: false }));
        }

        if (coursesResult.status === "fulfilled") {
          setCourses(coursesResult.value);
          setLoadingStates((prev) => ({ ...prev, courses: false }));
        } else {
          // Use fallback courses if API fails
          console.log("Course API failed, using fallback courses");
          const fallbackCourses = generateEnhancedFallbackCourses(
            missingSkills.length > 0 ? missingSkills : [],
            jobTitle
          );
          setCourses(fallbackCourses);
          setLoadingStates((prev) => ({ ...prev, courses: false }));
        }

        if (videosResult.status === "fulfilled") {
          setVideos(videosResult.value);
          setLoadingStates((prev) => ({ ...prev, videos: false }));
        } else {
          setErrors((prev) => ({ ...prev, videos: "Failed to load videos" }));
          setLoadingStates((prev) => ({ ...prev, videos: false }));
        }
      });
    } catch (error) {
      console.error("Error performing analysis:", error);
      setErrors({ general: "Failed to perform analysis. Please try again." });
    }
  };

  const analyzeResume = async (formData) => {
    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE_RESUME, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Resume analysis failed");
      const data = await response.json();

      // Get the raw response
      const rawResponse = data.missing_skills;

      // Enhanced parsing function to handle different formats
      const parseSkillsResponse = (response) => {
        if (!response || typeof response !== "string") return [];

        // Remove the "Missing Skills:" header and any extra whitespace
        let cleanedResponse = response
          .replace(/Missing Skills:/i, "")
          .replace(/^\s*\n/, "")
          .trim();

        // Try different parsing approaches
        let skills = [];

        // Method 1: Split by bullet points and dashes
        if (
          cleanedResponse.includes("•") ||
          cleanedResponse.includes("*") ||
          cleanedResponse.includes("-")
        ) {
          skills = cleanedResponse
            .split(/[•*\-]\s*/)
            .map((skill) => skill.trim())
            .filter((skill) => skill.length > 0)
            .map((skill) => {
              // Clean up each skill - remove trailing punctuation and extra text
              return skill
                .replace(/:\s*.*$/, "") // Remove everything after colon
                .replace(/$$[^)]*$$:.*$/, "") // Remove parenthetical explanations
                .replace(/\.$/, "") // Remove trailing period
                .trim();
            })
            .filter((skill) => skill.length > 0);
        }

        // Method 2: If no bullet points, try splitting by periods or newlines
        if (skills.length === 0) {
          skills = cleanedResponse
            .split(/[.\n]/)
            .map((skill) => skill.trim())
            .filter((skill) => skill.length > 0 && skill.length < 100) // Filter out very long descriptions
            .map((skill) => {
              // Extract just the skill name before any description
              const match = skill.match(/^([^(:]+)/);
              return match ? match[1].trim() : skill.trim();
            })
            .filter((skill) => skill.length > 0);
        }

        return skills;
      };

      const parsedSkills = parseSkillsResponse(rawResponse);

      // Add debugging to see what's happening
      console.log("Raw response:", rawResponse);
      console.log("Parsed skills:", parsedSkills);

      // Return parsed skills, or fallback to original parsing if parsing fails
      return parsedSkills.length > 0
        ? parsedSkills
        : rawResponse
            .split("\n")
            .filter((skill) => skill.trim() !== "")
            .map((skill) => skill.replace(/^-\s*/, "").trim());
    } catch (error) {
      console.error("Resume analysis error:", error);
      throw error;
    }
  };

  const fetchCourses = async (jobTitle) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.FETCH_COURSES}${encodeURIComponent(jobTitle)}`
      );
      if (!response.ok) {
        console.warn("Course API failed, using enhanced fallback courses");
        throw new Error("Course API failed");
      }
      const data = await response.json();

      // If API returns empty results, use fallback
      if (!data.courses || data.courses.length === 0) {
        console.log("API returned empty results, using fallback courses");
        return generateEnhancedFallbackCourses(missingSkills, jobTitle);
      }

      return data.courses;
    } catch (error) {
      console.error("Course fetch error:", error);
      // Return enhanced fallback courses instead of throwing
      return generateEnhancedFallbackCourses(missingSkills, jobTitle);
    }
  };

  const fetchVideos = async (jobTitle) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.YOUTUBE_COURSES}${encodeURIComponent(jobTitle)}`
      );
      if (!response.ok) throw new Error("Fetching videos failed");
      const data = await response.json();
      return data.videos || [];
    } catch (error) {
      console.error("Video fetch error:", error);
      throw error;
    }
  };

  const fetchJobMatching = async (skills) => {
    try {
      const response = await fetch(API_ENDPOINTS.JOB_MATCHING, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills }),
      });
      if (!response.ok) throw new Error("Job matching failed");
      const data = await response.json();
      return data.job_recommendations;
    } catch (error) {
      console.error("Job matching error:", error);
      throw error;
    }
  };

  const fetchProjects = async (skills) => {
    try {
      const response = await fetch(API_ENDPOINTS.PROJECT_GENERATOR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills }),
      });
      if (!response.ok) throw new Error("Project generation failed");
      const data = await response.json();
      return data.project_ideas;
    } catch (error) {
      console.error("Project generation error:", error);
      throw error;
    }
  };

  // Formatting functions (same as before but with better error handling)
  const formatJobRecommendations = (text) => {
    if (!text || typeof text !== "string") return [];

    try {
      const jobSections = text.split(/\d+\.\s+/);
      return jobSections
        .filter((section) => section.trim().length > 0)
        .map((section, index) => {
          try {
            const titleMatch = section.match(/^([^*]+)/);
            const title = titleMatch
              ? titleMatch[1].trim()
              : `Job Recommendation ${index + 1}`;

            const descMatch = section.match(
              /\*\s+\*\*Description:\*\*\s+(.*?)(?=\*\s+\*\*|$)/s
            );
            const description = descMatch
              ? descMatch[1].trim()
              : "Description not available";

            const skillsMatch = section.match(
              /\*\s+\*\*Key Required Skills:\*\*\s+(.*?)(?=\*\s+\*\*|$)/s
            );
            const skills = skillsMatch
              ? skillsMatch[1].trim()
              : "Skills information not available";

            const pathMatch = section.match(
              /\*\s+\*\*Potential Career Path:\*\*\s+(.*?)(?=\*\s+\*\*|$)/s
            );
            const careerPath = pathMatch
              ? pathMatch[1].trim()
              : "Career path information not available";

            return {
              title:
                title.length > 100 ? title.substring(0, 100) + "..." : title,
              description:
                description.length > 300
                  ? description.substring(0, 300) + "..."
                  : description,
              skills:
                skills.length > 200 ? skills.substring(0, 200) + "..." : skills,
              careerPath:
                careerPath.length > 200
                  ? careerPath.substring(0, 200) + "..."
                  : careerPath,
            };
          } catch (error) {
            return {
              title: `Job Recommendation ${index + 1}`,
              description: "Unable to parse job details",
              skills: "Skills information unavailable",
              careerPath: "Career path information unavailable",
            };
          }
        });
    } catch (error) {
      return [];
    }
  };

  const formatProjectIdeas = (text) => {
    if (!text || typeof text !== "string") return [];

    try {
      const projects = text.split(/\d+\.\s+Project Title:/g);
      return projects
        .filter((project) => project.trim().length > 0)
        .map((project, index) => {
          try {
            const titleMatch = project.match(
              /Project Title:\s*(.*?)(?=\s*Description:|$)/s
            );
            const title = titleMatch
              ? titleMatch[1].trim()
              : `Project ${index + 1}`;

            const descriptionMatch = project.match(
              /Description:\s*(.*?)(?=\s*Key Skills Demonstrated:|$)/s
            );
            const description = descriptionMatch
              ? descriptionMatch[1].trim()
              : "Description not available";

            const skillsMatch = project.match(
              /Key Skills Demonstrated:\s*(.*?)(?=\s*Potential Real-World Impact:|$)/s
            );
            const skills = skillsMatch
              ? skillsMatch[1].trim()
              : "Skills information not available";

            const impactMatch = project.match(
              /Potential Real-World Impact:\s*(.*?)(?=\s*Difficulty Level:|$)/s
            );
            const impact = impactMatch
              ? impactMatch[1].trim()
              : "Impact information not available";

            const difficultyMatch = project.match(
              /Difficulty Level:\s*(.*?)$/s
            );
            const difficulty = difficultyMatch
              ? difficultyMatch[1].trim()
              : "Intermediate";

            return {
              title: title.length > 80 ? title.substring(0, 80) + "..." : title,
              description:
                description.length > 250
                  ? description.substring(0, 250) + "..."
                  : description,
              skills:
                skills.length > 150 ? skills.substring(0, 150) + "..." : skills,
              impact:
                impact.length > 150 ? impact.substring(0, 150) + "..." : impact,
              difficulty: difficulty.length > 20 ? "Intermediate" : difficulty,
            };
          } catch (error) {
            return {
              title: `Project ${index + 1}`,
              description: "Unable to parse project details",
              skills: "Skills information unavailable",
              impact: "Impact information unavailable",
              difficulty: "Intermediate",
            };
          }
        });
    } catch (error) {
      return [];
    }
  };

  const formattedJobs = jobRecommendations
    ? formatJobRecommendations(jobRecommendations)
    : [];
  const formattedProjects = projectIdeas
    ? formatProjectIdeas(projectIdeas)
    : [];

  const getTabStatus = (tabName) => {
    if (loadingStates[tabName]) return "loading";
    if (errors[tabName]) return "error";
    return "completed";
  };

  const retrySection = (section) => {
    setLoadingStates((prev) => ({ ...prev, [section]: true }));
    setErrors((prev) => ({ ...prev, [section]: null }));

    if (analysisData) {
      performAnalysis(analysisData);
    }
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back to Home
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold">Analysis Results</h1>
                  <p className="text-gray-600">
                    Resume analysis for:{" "}
                    <span className="font-medium">{analysisData.jobTitle}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <Download className="h-4 w-4" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Analysis Progress</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: "skills", label: "Skills Analysis", icon: Sparkles },
                {
                  key: "courses",
                  label: "Course Recommendations",
                  icon: BookOpen,
                },
                { key: "videos", label: "Video Tutorials", icon: Youtube },
                { key: "projects", label: "Project Ideas", icon: Lightbulb },
                {
                  key: "jobs",
                  label: "Job Matching",
                  icon: BriefcaseConveyorBelt,
                },
              ].map(({ key, label, icon: Icon }) => {
                const status = getTabStatus(key);
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <div
                      className={`p-2 rounded-full ${
                        status === "completed"
                          ? "bg-green-100"
                          : status === "error"
                          ? "bg-red-100"
                          : "bg-gray-100"
                      }`}
                    >
                      {status === "loading" ? (
                        <Clock className="h-4 w-4 text-gray-600 animate-spin" />
                      ) : status === "error" ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              {
                key: "skills",
                label: "Missing Skills",
                icon: Sparkles,
                color: "purple",
              },
              {
                key: "courses",
                label: "Courses",
                icon: BookOpen,
                color: "blue",
              },
              {
                key: "projects",
                label: "Projects",
                icon: Lightbulb,
                color: "amber",
              },
              { key: "videos", label: "Videos", icon: Youtube, color: "red" },
              {
                key: "jobs",
                label: "Jobs",
                icon: BriefcaseConveyorBelt,
                color: "green",
              },
            ].map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  activeTab === key
                    ? `border-${color}-500 bg-${color}-50`
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <Icon
                    className={`h-6 w-6 ${
                      activeTab === key ? `text-${color}-600` : "text-gray-600"
                    }`}
                  />
                  <span
                    className={`font-medium text-sm ${
                      activeTab === key ? `text-${color}-900` : "text-gray-700"
                    }`}
                  >
                    {label}
                  </span>
                  {getTabStatus(key) === "loading" && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm">
            {/* Skills Tab */}
            {activeTab === "skills" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Missing Skills
                  </h2>
                  {errors.skills && (
                    <button
                      onClick={() => retrySection("skills")}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </button>
                  )}
                </div>

                {loadingStates.skills ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <LoadingAnimation />
                      <p className="mt-4 text-gray-600">
                        Analyzing your resume...
                      </p>
                    </div>
                  </div>
                ) : errors.skills ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{errors.skills}</p>
                    <button
                      onClick={() => retrySection("skills")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : missingSkills.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {missingSkills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100"
                      >
                        <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0 mt-2"></div>
                        <span className="text-sm text-gray-800 leading-relaxed">
                          {skill}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Great! No missing skills found for this role.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Recommended Courses
                  </h2>
                  {errors.courses && (
                    <button
                      onClick={() => retrySection("courses")}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </button>
                  )}
                </div>

                {loadingStates.courses ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <LoadingAnimation />
                      <p className="mt-4 text-gray-600">
                        Finding the best courses for you...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {courses.map((course, index) => (
                      <a
                        key={index}
                        href={course.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {course.title}
                            </h3>
                            {course.isFree && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Free
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {course.platform || "Online Course"}
                          </p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {course.snippet || "Click to view course details"}
                          </p>
                        </div>
                        <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === "projects" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                    Project Ideas
                  </h2>
                  {errors.projects && (
                    <button
                      onClick={() => retrySection("projects")}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </button>
                  )}
                </div>

                {loadingStates.projects ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <LoadingAnimation />
                      <p className="mt-4 text-gray-600">
                        Generating project ideas...
                      </p>
                    </div>
                  </div>
                ) : errors.projects ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{errors.projects}</p>
                    <button
                      onClick={() => retrySection("projects")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : formattedProjects.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {formattedProjects.map((project, index) => (
                      <div
                        key={index}
                        className="border border-amber-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="bg-amber-50 p-4 border-b border-amber-200">
                          <h3 className="font-semibold text-lg break-words">
                            {project.title}
                          </h3>
                          <div className="mt-2 inline-flex items-center rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-100">
                            {project.difficulty}
                          </div>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              Description
                            </h4>
                            <p className="text-sm text-gray-600 break-words">
                              {project.description}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              Key Skills
                            </h4>
                            <p className="text-sm text-gray-600 break-words">
                              {project.skills}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              Real-World Impact
                            </h4>
                            <p className="text-sm text-gray-600 break-words">
                              {project.impact}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No project ideas available.</p>
                  </div>
                )}
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === "videos" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-600" />
                    YouTube Tutorials
                  </h2>
                  {errors.videos && (
                    <button
                      onClick={() => retrySection("videos")}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </button>
                  )}
                </div>

                {loadingStates.videos ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <LoadingAnimation />
                      <p className="mt-4 text-gray-600">
                        Finding relevant video tutorials...
                      </p>
                    </div>
                  </div>
                ) : errors.videos ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{errors.videos}</p>
                    <button
                      onClick={() => retrySection("videos")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : videos.length > 0 ? (
                  <div className="grid gap-4">
                    {videos.map((video, index) => (
                      <a
                        key={index}
                        href={`https://www.youtube.com/watch?v=${video.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start rounded-lg border hover:border-red-300 hover:bg-red-50 transition-colors overflow-hidden group"
                      >
                        <div className="w-40 h-24 flex-shrink-0 relative">
                          <img
                            src={video.thumbnail || "/placeholder.svg"}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 break-words">
                            {video.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {video.channel}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Click to watch on YouTube
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Youtube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No video tutorials found.</p>
                  </div>
                )}
              </div>
            )}

            {/* Jobs Tab */}
            {activeTab === "jobs" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BriefcaseConveyorBelt className="h-5 w-5 text-green-600" />
                    Job Recommendations
                  </h2>
                  {errors.jobs && (
                    <button
                      onClick={() => retrySection("jobs")}
                      className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Retry
                    </button>
                  )}
                </div>

                {loadingStates.jobs ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <LoadingAnimation />
                      <p className="mt-4 text-gray-600">
                        Finding matching job opportunities...
                      </p>
                    </div>
                  </div>
                ) : errors.jobs ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{errors.jobs}</p>
                    <button
                      onClick={() => retrySection("jobs")}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Try Again
                    </button>
                  </div>
                ) : formattedJobs.length > 0 ? (
                  <div className="grid gap-6">
                    {formattedJobs.map((job, index) => (
                      <div
                        key={index}
                        className="border border-green-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="bg-green-50 p-4 border-b border-green-200">
                          <h3 className="font-semibold text-lg break-words">
                            {job.title.replace(/\*\*/g, "")}
                          </h3>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              Description
                            </h4>
                            <p className="text-sm text-gray-600 break-words">
                              {job.description}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              Key Required Skills
                            </h4>
                            <p className="text-sm text-gray-600 break-words">
                              {job.skills}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              Potential Career Path
                            </h4>
                            <p className="text-sm text-gray-600 break-words">
                              {job.careerPath}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BriefcaseConveyorBelt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No job recommendations available.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="border-t bg-white mt-12">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <p className="text-center text-sm leading-loose text-gray-600 md:text-left">
                &copy; {new Date().getFullYear()} Skill Up. All rights reserved.
              </p>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-sm text-gray-600 hover:underline">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-600 hover:underline">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:underline">
                Contact
              </a>
            </div>
            <Analytics />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Results;
