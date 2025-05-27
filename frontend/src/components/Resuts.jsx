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
  const [extractedText, setExtractedText] = useState("");
  const [loadingStates, setLoadingStates] = useState({
    skills: true,
    courses: true,
    videos: true,
    jobs: true,
    projects: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedData = sessionStorage.getItem("analysisData");
    if (!storedData) {
      navigate("/");
      return;
    }

    const data = JSON.parse(storedData);
    setAnalysisData(data);
    performAnalysis(data);
  }, [navigate]);

  const performAnalysis = async (data) => {
    const { file, jobTitle } = data;

    const response = await fetch(file.data);
    const blob = await response.blob();
    const fileObj = new File([blob], file.name, { type: file.type });

    const formData = new FormData();
    formData.append("file", fileObj);
    formData.append("job_title", jobTitle);

    // Start all API calls
    analyzeResume(formData, jobTitle);
    fetchCourses(jobTitle);
    fetchVideos(jobTitle);
  };

  const analyzeResume = async (formData, jobTitle) => {
    try {
      const response = await fetch(API_ENDPOINTS.ANALYZE_RESUME, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Resume analysis failed");

      const data = await response.json();
      const skillsList = parseSkillsResponse(data.missing_skills);
      const extractedText = data.extracted_text || "";

      setMissingSkills(skillsList);
      setExtractedText(extractedText);
      setLoadingStates((prev) => ({ ...prev, skills: false }));

      // Start dependent API calls
      fetchJobMatching(skillsList, jobTitle, extractedText);
      fetchProjects(skillsList);
    } catch (error) {
      setErrors((prev) => ({ ...prev, skills: "Failed to analyze resume" }));
      setLoadingStates((prev) => ({ ...prev, skills: false }));
    }
  };

  const parseSkillsResponse = (response) => {
    if (!response || typeof response !== "string") return [];

    const cleanedResponse = response
      .replace(/Missing Skills:/i, "")
      .replace(/^\s*\n/, "")
      .trim();

    let skills = [];

    if (
      cleanedResponse.includes("•") ||
      cleanedResponse.includes("*") ||
      cleanedResponse.includes("-")
    ) {
      skills = cleanedResponse
        .split(/[•*-]\s*/)
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)
        .map((skill) =>
          skill
            .replace(/:\s*.*$/, "")
            .replace(/\.$/, "")
            .trim()
        )
        .filter((skill) => skill.length > 0);
    }

    if (skills.length === 0) {
      skills = cleanedResponse
        .split(/[.\n]/)
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0 && skill.length < 100)
        .map((skill) => {
          const match = skill.match(/^([^(:]+)/);
          return match ? match[1].trim() : skill.trim();
        })
        .filter((skill) => skill.length > 0);
    }

    return skills.length > 0
      ? skills
      : cleanedResponse
          .split("\n")
          .filter((skill) => skill.trim() !== "")
          .map((skill) => skill.replace(/^-\s*/, "").trim());
  };

  const fetchCourses = async (jobTitle) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.FETCH_COURSES}${encodeURIComponent(jobTitle)}`
      );

      if (!response.ok) throw new Error("Course API failed");

      const data = await response.json();
      setCourses(
        data.courses?.length > 0
          ? data.courses
          : generateEnhancedFallbackCourses(missingSkills, jobTitle)
      );
      setLoadingStates((prev) => ({ ...prev, courses: false }));
    } catch (error) {
      setCourses(generateEnhancedFallbackCourses(missingSkills, jobTitle));
      setLoadingStates((prev) => ({ ...prev, courses: false }));
    }
  };

  const fetchVideos = async (jobTitle) => {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.YOUTUBE_COURSES}${encodeURIComponent(jobTitle)}`
      );

      if (!response.ok) throw new Error("Videos API failed");

      const data = await response.json();
      setVideos(data.videos || []);
      setLoadingStates((prev) => ({ ...prev, videos: false }));
    } catch (error) {
      setErrors((prev) => ({ ...prev, videos: "Failed to load videos" }));
      setLoadingStates((prev) => ({ ...prev, videos: false }));
    }
  };

  const fetchJobMatching = async (skills, jobTitle, extractedText) => {
    try {
      const response = await fetch(API_ENDPOINTS.JOB_MATCHING, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          skills: skills,
          job_title: jobTitle,
          extracted_text: extractedText,
        }),
      });

      if (!response.ok)
        throw new Error(`Job matching failed: ${response.status}`);

      const data = await response.json();
      setJobRecommendations(data.job_recommendations);
      setLoadingStates((prev) => ({ ...prev, jobs: false }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        jobs: "Failed to load job recommendations",
      }));
      setLoadingStates((prev) => ({ ...prev, jobs: false }));
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
      setProjectIdeas(data.project_ideas);
      setLoadingStates((prev) => ({ ...prev, projects: false }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        projects: "Failed to load project ideas",
      }));
      setLoadingStates((prev) => ({ ...prev, projects: false }));
    }
  };

  const formatJobRecommendations = (text) => {
    if (!text || typeof text !== "string") return [];

    const jobSections = text
      .split(/\d+\.\s+/)
      .filter((section) => section.trim().length > 0);

    return jobSections.map((section, index) => {
      let title = "";
      const titleMatch = section.match(/^\*\*([^*]+)\*\*/);
      if (titleMatch) {
        title = titleMatch[1].trim();
      } else {
        const firstLine = section.split("\n")[0];
        title = firstLine.replace(/\*\*/g, "").trim();
      }

      const descMatch = section.match(
        /\*\s*\*\*Description:\*\*\s+(.*?)(?=\*\s*\*\*|$)/s
      );
      const description = descMatch
        ? descMatch[1].trim()
        : "Description not available";

      const skillsMatch = section.match(
        /\*\s*\*\*Key Required Skills:\*\*\s+(.*?)(?=\*\s*\*\*|$)/s
      );
      const skills = skillsMatch
        ? skillsMatch[1].trim()
        : "Skills information not available";

      const pathMatch = section.match(
        /\*\s*\*\*Potential Career Path:\*\*\s+(.*?)(?=\*\s*\*\*|$)/s
      );
      const careerPath = pathMatch
        ? pathMatch[1].trim()
        : "Career path information not available";

      return {
        title: title || `Job Recommendation ${index + 1}`,
        description:
          description.length > 300
            ? description.substring(0, 300) + "..."
            : description,
        skills: skills.length > 200 ? skills.substring(0, 200) + "..." : skills,
        careerPath:
          careerPath.length > 200
            ? careerPath.substring(0, 200) + "..."
            : careerPath,
      };
    });
  };

  const formatProjectIdeas = (text) => {
    if (!text || typeof text !== "string") return [];

    const projectSections = text.split(/\d+\.\s+/);
    return projectSections
      .filter((section) => section.trim().length > 0)
      .map((section, index) => {
        let title = "";
        const titleWithLabelMatch = section.match(/Project Title:\s*([^\n]+)/);
        if (titleWithLabelMatch) {
          title = titleWithLabelMatch[1].trim();
        } else {
          const firstLineMatch = section.match(/^([^\n]+)/);
          title = firstLineMatch
            ? firstLineMatch[1].trim()
            : `Creative Project ${index + 1}`;
        }

        title = title
          .replace(/\*\*/g, "")
          .replace(/Project Title:\s*/i, "")
          .replace(/\s*Description:.*$/i, "")
          .trim();

        const descriptionMatch = section.match(
          /Description:\s*(.*?)(?=Key Skills Demonstrated:|$)/s
        );
        const description = descriptionMatch
          ? descriptionMatch[1].trim()
          : "Description not available";

        const skillsMatch = section.match(
          /Key Skills Demonstrated:\s*(.*?)(?=Potential Real-World Impact:|$)/s
        );
        const skills = skillsMatch
          ? skillsMatch[1].trim()
          : "Skills information not available";

        const impactMatch = section.match(
          /Potential Real-World Impact:\s*(.*?)(?=Difficulty Level:|$)/s
        );
        const impact = impactMatch
          ? impactMatch[1].trim()
          : "Impact information not available";

        const difficultyMatch = section.match(/Difficulty Level:\s*(.*?)$/s);
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
      });
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
                    Creative Project Ideas
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
                        Generating creative project ideas...
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
                          <h3 className="font-semibold text-lg break-words text-amber-900">
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
                          <h3 className="font-semibold text-lg break-words text-green-900">
                            {job.title}
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
