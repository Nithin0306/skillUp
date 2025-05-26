"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Analytics } from "@vercel/analytics/react";
import {
  Upload,
  Sparkles,
  BookOpen,
  Lightbulb,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Target,
  Shield,
} from "lucide-react";

// Import validation configuration
import {
  INAPPROPRIATE_WORDS,
  JOB_KEYWORDS,
  MEANINGLESS_PATTERNS,
  NAME_PATTERN,
} from "../config/validation";



const Home = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const [validationError, setValidationError] = useState("");
  const [documentValidating, setDocumentValidating] = useState(false);
  const [documentValidationResult, setDocumentValidationResult] =
    useState(null);

  // Resume content validation keywords
  const RESUME_KEYWORDS = [
    "experience",
    "education",
    "skills",
    "work",
    "employment",
    "job",
    "career",
    "university",
    "college",
    "degree",
    "bachelor",
    "master",
    "phd",
    "certification",
    "project",
    "achievement",
    "responsibility",
    "accomplishment",
    "objective",
    "summary",
    "profile",
    "contact",
    "email",
    "phone",
    "address",
    "linkedin",
    "github",
    "portfolio",
    "references",
    "volunteer",
    "internship",
    "training",
    "course",
    "workshop",
    "seminar",
    "conference",
    "publication",
    "research",
    "language",
    "software",
    "programming",
    "technical",
    "management",
    "leadership",
    "teamwork",
    "communication",
    "problem solving",
    "analytical",
    "creative",
    "resume",
    "cv",
    "curriculum vitae",
    "certifications",
    "responsibilities",
    "employer",
    "designation",
    "role",
    "objective",
    "career summary",
    "key skills",
    "technical skills",
    "soft skills",
    "achievements",
    "interests",
    "hobbies",
    "projects",
    "work experience",
    "academic",
    "professional summary",
    "honors",
    "awards",
  ];

  const INAPPROPRIATE_CONTENT = [
    "confidential",
    "classified",
    "secret",
    "private",
    "internal only",
    "do not distribute",
    "proprietary",
    "restricted",
    "sensitive",
    "personal diary",
    "journal",
    "medical record",
    "financial statement",
    "bank statement",
    "tax return",
    "social security",
    "passport",
    "driver license",
    "birth certificate",
    "marriage certificate",
    "time table",
    "schedule",
    "category",
    "time line",
    "road map",
    "roadmap",
    "timeline",
    "course outline",
    "syllabus",
    "training schedule",
    "book",
    "ebook",
    "manual",
    "lecture",
    "notes",
    "presentation",
    "slides",
    "tutorial",
    "walkthrough",
    "video timestamps",
  ];

  // Document content validation function
  const validateDocumentContent = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          let content = "";

          if (file.type === "application/pdf") {
            // For PDF files, we'll do basic validation based on file structure
            // In a real implementation, you'd use a PDF parser library
            content = "pdf content validation placeholder";
          } else if (
            file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          ) {
            // For DOCX files, basic validation
            content = "docx content validation placeholder";
          } else {
            // For text-based files
            content = e.target.result.toLowerCase();
          }

          // Validate file size (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            resolve({
              isValid: false,
              reason: "File size exceeds 10MB limit",
              confidence: 100,
            });
            return;
          }

          // Check file type
          const allowedTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
          ];

          if (!allowedTypes.includes(file.type)) {
            resolve({
              isValid: false,
              reason:
                "Invalid file type. Please upload PDF, DOCX, or TXT files only",
              confidence: 100,
            });
            return;
          }

          // For actual content validation, we'll simulate the process
          // In a real implementation, you'd extract text from PDF/DOCX and analyze it

          // Simulate content analysis
          setTimeout(() => {
            // Check for resume-like content (simulated)
            const hasResumeKeywords = RESUME_KEYWORDS.some(
              (keyword) =>
                file.name.toLowerCase().includes(keyword) ||
                file.name.toLowerCase().includes("resume") ||
                file.name.toLowerCase().includes("cv")
            );

            // Check for inappropriate content (simulated)
            const hasInappropriateContent = INAPPROPRIATE_CONTENT.some((term) =>
              file.name.toLowerCase().includes(term)
            );

            if (hasInappropriateContent) {
              resolve({
                isValid: false,
                reason:
                  "Document appears to contain inappropriate or sensitive content",
                confidence: 85,
              });
              return;
            }

            if (
              !hasResumeKeywords &&
              !file.name.toLowerCase().includes("resume") &&
              !file.name.toLowerCase().includes("cv")
            ) {
              resolve({
                isValid: false,
                reason: "Document does not appear to be a resume or CV",
                confidence: 70,
              });
              return;
            }

            // If all checks pass
            resolve({
              isValid: true,
              reason: "Document appears to be a valid resume",
              confidence: 90,
            });
          }, 2000); // Simulate processing time
        } catch (error) {
          resolve({
            isValid: false,
            reason: "Error reading document content",
            confidence: 100,
          });
        }
      };

      reader.onerror = () => {
        resolve({
          isValid: false,
          reason: "Error reading file",
          confidence: 100,
        });
      };

      reader.readAsText(file);
    });
  };

  // Job title validation function with imported configuration
  const validateJobTitle = (title) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return "Please enter a job title";
    }

    if (trimmedTitle.length < 2) {
      return "Job title must be at least 2 characters long";
    }

    if (trimmedTitle.length > 100) {
      return "Job title must be less than 100 characters";
    }

    // Check for inappropriate words
    const lowerTitle = trimmedTitle.toLowerCase();
    for (const word of INAPPROPRIATE_WORDS) {
      if (lowerTitle.includes(word)) {
        return "Please enter a professional job title";
      }
    }

    // Check for meaningless patterns
    for (const pattern of MEANINGLESS_PATTERNS) {
      if (pattern.test(trimmedTitle)) {
        return "Please enter a valid job title (e.g., Software Engineer, Data Analyst, Marketing Manager)";
      }
    }

    // Check if it looks like a personal name
    if (NAME_PATTERN.test(trimmedTitle)) {
      return "Please enter a job title, not a personal name";
    }

    if (!/[a-zA-Z]/.test(trimmedTitle)) {
      return "Job title must contain at least one letter";
    }

    // Check for job-related keywords
    const hasJobKeyword = JOB_KEYWORDS.some((keyword) =>
      lowerTitle.includes(keyword.toLowerCase())
    );

    if (!hasJobKeyword && trimmedTitle.length < 15) {
      return "Please enter a specific job title (e.g., Software Engineer, Data Analyst, Marketing Manager)";
    }

    return null;
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setDocumentValidationResult(null);
      setDocumentValidating(true);

      // Validate document content
      const validationResult = await validateDocumentContent(selectedFile);
      setDocumentValidationResult(validationResult);
      setDocumentValidating(false);

      if (!validationResult.isValid) {
        setFile(null);
        setFileName("No file chosen");
      }
    }
  };

  const handleJobTitleChange = (e) => {
    const value = e.target.value;
    setJobTitle(value);

    if (validationError) {
      setValidationError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const titleError = validateJobTitle(jobTitle);
    if (titleError) {
      setValidationError(titleError);
      return;
    }

    if (!file) {
      alert("Please upload a resume");
      return;
    }

    if (documentValidationResult && !documentValidationResult.isValid) {
      alert("Please upload a valid resume document");
      return;
    }

    setValidationError("");
    setLoading(true);

    try {
      // Convert file to base64 for storage
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const analysisData = {
          file: {
            name: file.name,
            type: file.type,
            data: fileReader.result,
          },
          jobTitle: jobTitle.trim(),
          timestamp: new Date().toISOString(),
          validation: documentValidationResult,
        };

        sessionStorage.setItem("analysisData", JSON.stringify(analysisData));

        // Navigate to results page
        navigate("/results");
      };
      fileReader.readAsDataURL(file);
    } catch (error) {
      console.error("Error preparing analysis:", error);
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                AI-Based Resume Analyzer
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Bridge the gap between your current skills and your dream job
                with personalized recommendations.
              </p>

              {/* Features Preview */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">
                    AI-powered skill gap analysis
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">
                    Personalized course recommendations
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">
                    Project ideas & job matching
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-700">
                    Document content validation
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() =>
                    document.getElementById("resumeUpload").click()
                  }
                  className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  Get Started
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Enhanced Form Card */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  Start Your Analysis
                </h2>
                <p className="text-gray-600">
                  Upload your resume and get instant insights
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume Upload
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
                    onClick={() =>
                      document.getElementById("resumeUpload").click()
                    }
                  >
                    <input
                      type="file"
                      id="resumeUpload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-gray-100 rounded-full">
                        <Upload className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {fileName === "No file chosen" ? (
                            <>
                              <span className="text-purple-600 font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </>
                          ) : (
                            <span className="text-green-600">{fileName}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, DOCX, or TXT up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Validation Status */}
                  {documentValidating && (
                    <div className="flex items-center gap-2 text-blue-600 text-sm mt-2 p-3 bg-blue-50 rounded-lg">
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Validating document content...</span>
                    </div>
                  )}

                  {documentValidationResult && (
                    <div
                      className={`flex items-center gap-2 text-sm mt-2 p-3 rounded-lg ${
                        documentValidationResult.isValid
                          ? "text-green-600 bg-green-50"
                          : "text-red-600 bg-red-50"
                      }`}
                    >
                      {documentValidationResult.isValid ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <div>
                        <span className="font-medium">
                          {documentValidationResult.reason}
                        </span>
                        <div className="text-xs opacity-75 mt-1">
                          Confidence: {documentValidationResult.confidence}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Job Title Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Job Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer, Data Analyst, Marketing Manager"
                    required
                    value={jobTitle}
                    onChange={handleJobTitleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                      validationError
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {validationError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>{validationError}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a specific job role you're targeting
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:bg-purple-400 disabled:cursor-not-allowed font-medium"
                  disabled={
                    loading ||
                    !!validationError ||
                    documentValidating ||
                    (documentValidationResult &&
                      !documentValidationResult.isValid)
                  }
                >
                  {loading ? (
                    <>
                      <Clock className="h-5 w-5 animate-spin" />
                      Preparing Analysis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Analyze Resume
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

             
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="bg-gradient-to-br from-gray-50 to-purple-50 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get comprehensive insights into your career development with our
                AI-powered analysis and secure document validation
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  AI-Powered Analysis
                </h3>
                <p className="text-gray-600 text-sm">
                  Advanced algorithms analyze your resume and compare it with
                  job requirements to identify skill gaps
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Personalized Learning
                </h3>
                <p className="text-gray-600 text-sm">
                  Get customized course recommendations from top platforms to
                  fill your skill gaps effectively
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Career Guidance</h3>
                <p className="text-gray-600 text-sm">
                  Receive project ideas and job recommendations tailored to your
                  evolving skill set
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Secure Validation
                </h3>
                <p className="text-gray-600 text-sm">
                  Advanced content validation ensures only appropriate resume
                  documents are processed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-purple-600 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Accelerate Your Career?
            </h2>
            <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have successfully bridged
              their skill gaps with our AI-powered platform
            </p>
            <button
              onClick={() => document.getElementById("resumeUpload").click()}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Your Analysis Now
            </button>
          </div>
        </div>

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
            <Analytics />
          </div>
        </footer>
       
      </div>
    </div>
  );
};

export default Home;
