"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import LoadingAnimation from "./LoadingAnimation";
import {
  Upload,
  Sparkles,
  BookOpen,
  Lightbulb,
  ChevronRight,
  BriefcaseConveyorBelt,
  Youtube,
} from "lucide-react";

const Home = () => {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [missingSkills, setMissingSkills] = useState([]);
  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]);
  const [jobRecommendations, setJobRecommendations] = useState("");
  const [projectIdeas, setProjectIdeas] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const [activeTab, setActiveTab] = useState("skills");
  const [analyzed, setAnalyzed] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleJobTitleChange = (e) => {
    setJobTitle(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !jobTitle) {
      alert("Please upload a resume and enter a job title");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_title", jobTitle);

    try {
      // Resume Analysis
      const resAnalysis = await fetch(
        "https://skillup-1-u242.onrender.com/analyze_resume/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!resAnalysis.ok) throw new Error("Resume analysis failed");
      const analysisData = await resAnalysis.json();
      const skillsList = analysisData.missing_skills
        .split("\n")
        .filter((skill) => skill.trim() !== "")
        .map((skill) => skill.replace(/^-\s*/, "").trim());

      setMissingSkills(skillsList);

      // Course Recommendations
      const encodedJobTitle = encodeURIComponent(jobTitle);
      const resCourses = await fetch(
        `https://skillup-1-u242.onrender.com/fetch_courses/${encodedJobTitle}`
      );
      if (!resCourses.ok) throw new Error("Fetching courses failed");
      const courseData = await resCourses.json();
      setCourses(courseData.courses || []);

      // YouTube Videos
      const resVideos = await fetch(
        `https://skillup-1-u242.onrender.com/youtube-courses/${encodedJobTitle}`
      );
      if (!resVideos.ok) throw new Error("Fetching YouTube videos failed");
      const videoData = await resVideos.json();
      setVideos(videoData.videos || []);

      // Job Matching
      const resJobMatching = await fetch(
        "https://skillup-1-u242.onrender.com/job_matching/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ skills: skillsList }),
        }
      );
      if (!resJobMatching.ok) throw new Error("Job matching failed");
      const jobMatchData = await resJobMatching.json();
      setJobRecommendations(jobMatchData.job_recommendations);

      // Project Generator
      const resProjects = await fetch(
        "https://skillup-1-u242.onrender.com/project_generator/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ skills: skillsList }),
        }
      );
      if (!resProjects.ok) throw new Error("Project generation failed");
      const projectData = await resProjects.json();
      setProjectIdeas(projectData.project_ideas);

      setAnalyzed(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Something went wrong. Check console for details.");
    }
    setLoading(false);
  };

  // Function to format job recommendations
  const formatJobRecommendations = (text) => {
    if (!text) return [];

    // Split the text into sections (one job per section)
    const jobSections = text.split(/\d+\.\s+/);

    // Filter out empty sections and process each job
    return jobSections
      .filter((section) => section.trim().length > 0)
      .map((section) => {
        // Extract job title - everything up to the first "* **"
        const titleMatch = section.match(/^([^*]+)/);
        const title = titleMatch ? titleMatch[1].trim() : "Job Title";

        // Extract description
        const descMatch = section.match(
          /\*\s+\*\*Description:\*\*\s+(.*?)(?=\*\s+\*\*|$)/s
        );
        const description = descMatch ? descMatch[1].trim() : "";

        // Extract skills
        const skillsMatch = section.match(
          /\*\s+\*\*Key Required Skills:\*\*\s+(.*?)(?=\*\s+\*\*|$)/s
        );
        const skills = skillsMatch ? skillsMatch[1].trim() : "";

        // Extract career path
        const pathMatch = section.match(
          /\*\s+\*\*Potential Career Path:\*\*\s+(.*?)(?=\*\s+\*\*|$)/s
        );
        const careerPath = pathMatch ? pathMatch[1].trim() : "";

        return {
          title,
          description,
          skills,
          careerPath,
        };
      });
  };

  // Function to format project ideas
  const formatProjectIdeas = (text) => {
    if (!text) return [];

    const projects = text.split(/\d+\.\s+Project Title:/g);

    return projects
      .filter((project) => project.trim().length > 0)
      .map((project) => {
        // Extract project details
        const titleMatch = project.match(
          /Project Title:\s*(.*?)(?=\s*Description:|$)/s
        );
        const title = titleMatch ? titleMatch[1].trim() : "Project";

        const descriptionMatch = project.match(
          /Description:\s*(.*?)(?=\s*Key Skills Demonstrated:|$)/s
        );
        const description = descriptionMatch ? descriptionMatch[1].trim() : "";

        const skillsMatch = project.match(
          /Key Skills Demonstrated:\s*(.*?)(?=\s*Potential Real-World Impact:|$)/s
        );
        const skills = skillsMatch ? skillsMatch[1].trim() : "";

        const impactMatch = project.match(
          /Potential Real-World Impact:\s*(.*?)(?=\s*Difficulty Level:|$)/s
        );
        const impact = impactMatch ? impactMatch[1].trim() : "";

        const difficultyMatch = project.match(/Difficulty Level:\s*(.*?)$/s);
        const difficulty = difficultyMatch
          ? difficultyMatch[1].trim()
          : "Intermediate";

        return {
          title,
          description,
          skills,
          impact,
          difficulty,
        };
      });
  };

  const formattedJobs = jobRecommendations
    ? formatJobRecommendations(jobRecommendations)
    : [];
  const formattedProjects = projectIdeas
    ? formatProjectIdeas(projectIdeas)
    : [];

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-white">
        {!analyzed ? (
          <>
            {/* Hero Section - Matching the screenshot layout */}
            <div className="container mx-auto px-4 py-16 md:py-24">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                    AI-Based Resume Analyzer
                  </h1>
                  <p className="text-gray-600 text-lg mb-8">
                    Bridge the gap between your current skills and your dream
                    job with personalized recommendations.
                  </p>
                  <div className="flex flex-wrap gap-4 mb-8">
                    <button
                      onClick={() =>
                        document.getElementById("resumeUpload").click()
                      }
                      className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="h-5 w-5" />
                      Get Started
                    </button>
                    <button className="border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-lg ml-10 mt-10 mb-15">
                  <h2 className="text-2xl font-semibold mb-4">
                    Analyze Your Resume
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Upload your resume and enter your desired job to receive
                    personalized recommendations.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <div
                        className="border border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() =>
                          document.getElementById("resumeUpload").click()
                        }
                      >
                        <input
                          type="file"
                          id="resumeUpload"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.docx"
                        />
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-10 w-10 text-gray-400" />
                          <p className="text-sm font-medium">
                            {fileName === "No file chosen" ? (
                              <>
                                <span className="text-purple-600 font-semibold">
                                  Upload Resume
                                </span>{" "}
                                or drag and drop
                              </>
                            ) : (
                              fileName
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF or DOCX up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Enter your desired job title"
                        required
                        value={jobTitle}
                        onChange={handleJobTitleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Analyzing...
                        </span>
                      ) : (
                        <span>Analyze Resume</span>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="bg-gray-50 py-16">
              <div className="container mx-auto px-4">
                <div className="mb-4">
                  <span className="text-4xl font-medium text-gray-500">
                    Why Choose Us ?
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                      Unlock Your Career Potential
                    </h2>
                    <p className="text-gray-600">
                      In today's competitive job market, identifying the exact
                      skill gaps preventing you from securing your desired roles
                      is crucial. Our AI-powered tool provides personalized
                      insights to help bridge those gaps.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          AI-Powered Analysis
                        </h3>
                        <p className="text-gray-600">
                          Our advanced AI extracts skills from your resume and
                          compares them with job requirements to identify gaps.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Personalized Learning Paths
                        </h3>
                        <p className="text-gray-600">
                          Get customized course recommendations from top
                          platforms like Coursera and Udemy.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Lightbulb className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Project Generator
                        </h3>
                        <p className="text-gray-600">
                          Receive real-world project ideas tailored to your
                          skills to build an impressive portfolio.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Analysis Results
                </h1>
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setAnalyzed(false);
                    setMissingSkills([]);
                    setCourses([]);
                    setVideos([]);
                    setJobRecommendations("");
                    setProjectIdeas("");
                    setFile(null);
                    setFileName("No file chosen");
                    setJobTitle("");
                  }}
                >
                  New Analysis
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <LoadingAnimation />
                  <p className="mt-4 text-lg text-gray-600">
                    Analyzing your resume...
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div
                      className={`bg-purple-50 border border-purple-200 rounded-lg p-6 flex flex-col items-center text-center cursor-pointer hover:bg-purple-100 transition-colors ${
                        activeTab === "skills" ? "ring-2 ring-purple-500" : ""
                      }`}
                      onClick={() => setActiveTab("skills")}
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold">Missing Skills</h3>
                      <p className="text-sm text-gray-600">
                        Skills you need to develop
                      </p>
                    </div>

                    <div
                      className={`bg-blue-50 border border-blue-200 rounded-lg p-6 flex flex-col items-center text-center cursor-pointer hover:bg-blue-100 transition-colors ${
                        activeTab === "courses" ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setActiveTab("courses")}
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold">Courses</h3>
                      <p className="text-sm text-gray-600">
                        Recommended learning
                      </p>
                    </div>

                    <div
                      className={`bg-amber-50 border border-amber-200 rounded-lg p-6 flex flex-col items-center text-center cursor-pointer hover:bg-amber-100 transition-colors ${
                        activeTab === "projects" ? "ring-2 ring-amber-500" : ""
                      }`}
                      onClick={() => setActiveTab("projects")}
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                        <Lightbulb className="h-6 w-6 text-amber-600" />
                      </div>
                      <h3 className="font-semibold">
                        Projects & Job Recommendations
                      </h3>
                      <p className="text-sm text-gray-600">
                        Projects & roles for you
                      </p>
                    </div>

                    <div
                      className={`bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center text-center cursor-pointer hover:bg-red-100 transition-colors ${
                        activeTab === "videos" ? "ring-2 ring-red-500" : ""
                      }`}
                      onClick={() => setActiveTab("videos")}
                    >
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6 text-red-600"
                        >
                          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                          <path d="m10 15 5-3-5-3z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold">YouTube</h3>
                      <p className="text-sm text-gray-600">Video tutorials</p>
                    </div>
                  </div>

                  {activeTab === "skills" && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                          Missing Skills
                        </h2>

                        {missingSkills.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {missingSkills.map((skill, index) => (
                              <div
                                key={index}
                                className="bg-purple-50 rounded-lg p-3 flex items-center"
                              >
                                <div className="w-2 h-2 rounded-full bg-purple-600 mr-2"></div>
                                <span>{skill}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">
                            No missing skills found.
                          </p>
                        )}

                        <div className="mt-6 flex justify-end">
                          <button
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                            onClick={() => setActiveTab("courses")}
                          >
                            View Recommended Courses
                            <ChevronRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "courses" && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                          Recommended Courses
                        </h2>

                        {courses && courses.length > 0 ? (
                          <div className="grid gap-4">
                            {courses.map((course, index) => (
                              <a
                                key={index}
                                href={course.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                              >
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                                  <BookOpen className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium hover:text-blue-600">
                                    {course.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {course.platform || "Online Course"}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {course.snippet ||
                                      "Click to view course details"}
                                  </p>
                                </div>
                              </a>
                            ))}
                            <div className="mt-6 flex justify-end">
                              <button
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                                onClick={() => setActiveTab("videos")}
                              >
                                View YouTube Tutorials
                                <ChevronRight />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-600">Loading courses...</p>
                            <div className="mt-4 animate-pulse">
                              <div className="h-12 bg-gray-200 rounded mb-4"></div>
                              <div className="h-12 bg-gray-200 rounded mb-4"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "projects" && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <Lightbulb className="h-5 w-5 mr-2 text-amber-600" />
                          Project Ideas
                        </h2>

                        {formattedProjects.length > 0 ? (
                          <div className="grid gap-6 md:grid-cols-2">
                            {formattedProjects.map((project, index) => (
                              <div
                                key={index}
                                className="overflow-hidden border border-amber-200 rounded-lg"
                              >
                                <div className="bg-amber-50 p-4 border-b border-amber-200">
                                  <h3 className="font-semibold text-lg">
                                    {project.title}
                                  </h3>
                                  <div className="mt-1 inline-flex items-center rounded-full border border-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-700 bg-amber-50">
                                    {project.difficulty}
                                  </div>
                                </div>
                                <div className="p-4 space-y-3">
                                  <div>
                                    <h4 className="text-sm font-medium">
                                      Description
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {project.description}
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-medium">
                                      Key Skills
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {project.skills}
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-medium">
                                      Real-World Impact
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {project.impact}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">
                            No project ideas found.
                          </p>
                        )}

                        <div className="mt-6 flex justify-end">
                          <button
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                            onClick={() => setActiveTab("jobs")}
                          >
                            View Job Recommendations
                            <ChevronRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "videos" && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                         < Youtube className="text-red-500 mr-2"/>
                          YouTube Tutorials
                        </h2>

                        {videos.length > 0 ? (
                          <div className="grid gap-4">
                            {videos.map((video, index) => (
                              <a
                                key={index}
                                href={`https://www.youtube.com/watch?v=${video.video_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start rounded-lg border hover:bg-gray-50 transition-colors overflow-hidden"
                              >
                                <div className="w-32 h-20 flex-shrink-0 relative">
                                  <img
                                    src={video.thumbnail || "/placeholder.svg"}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                                      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <h3 className="font-medium hover:text-red-600 line-clamp-2">
                                    {video.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {video.channel}
                                  </p>
                                </div>
                              </a>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">No videos found.</p>
                        )}

                        <div className="mt-6 flex justify-end">
                          <button
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                            onClick={() => setActiveTab("projects")}
                          >
                            View Project Ideas
                            <ChevronRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "jobs" && (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                      <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                       <BriefcaseConveyorBelt className="text-green-500 mr-2"/>
                          Job Recommendations
                        </h2>

                        {formattedJobs.length > 0 ? (
                          <div className="grid gap-6">
                            {formattedJobs.map((job, index) => (
                              <div
                                key={index}
                                className="overflow-hidden border border-green-200 rounded-lg"
                              >
                                <div className="bg-green-50 p-4 border-b border-green-200">
                                  <h3 className="font-semibold text-lg">
                                    {job.title.replace(/\*\*/g, "")}
                                  </h3>
                                </div>
                                <div className="p-4 space-y-3">
                                  <div>
                                    <h4 className="text-sm font-medium">
                                      Description
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {job.description}
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-medium">
                                      Key Required Skills
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {job.skills}
                                    </p>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-medium">
                                      Potential Career Path
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {job.careerPath}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">
                            No job recommendations found.
                          </p>
                        )}

                        <div className="mt-6 flex justify-end">
                          <button
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
                            onClick={() => setActiveTab("skills")}
                          >
                            Back to Missing Skills
                            <ChevronRight />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <footer className="border-t bg-white">
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
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
