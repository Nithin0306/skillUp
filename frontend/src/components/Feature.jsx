import {
  FileUp,
  Brain,
  BookOpen,
  Youtube,
  Route,
  Briefcase,
  Lightbulb,
  FileText,
  Sparkles,
} from "lucide-react";
import Navbar from "./Navbar";


const Features = () => {
  const features = [
    {
      icon: <FileUp className="h-10 w-10 text-purple-600" />,
      title: "Resume Upload",
      description: "Users upload their resume and enter a target job role.",
    },
    {
      icon: <Brain className="h-10 w-10 text-purple-600" />,
      title: "AI Analysis",
      description:
        "AI extracts skills and compares them with job requirements.",
    },
    {
      icon: <BookOpen className="h-10 w-10 text-purple-600" />,
      title: "Course Recommendations",
      description: "Fetches course recommendations from Coursera & Udemy.",
    },
    {
      icon: <Youtube className="h-10 w-10 text-purple-600" />,
      title: "Video Tutorials",
      description: "YouTube API recommends video tutorials for missing skills.",
    },
    {
      icon: <Route className="h-10 w-10 text-purple-600" />,
      title: "Learning Path",
      description: "Suggests a personalized learning path.",
    },
  ];

  const keyFeatures = [
    {
      icon: <Route className="h-6 w-6 text-purple-600" />,
      title: "Hybrid Learning Paths",
      description:
        "Blends courses + video tutorials + projects for comprehensive skill development.",
    },
    {
      icon: <BookOpen className="h-6 w-6 text-purple-600" />,
      title: "Top Course Recommendations",
      description: "Recommends top courses from Coursera, Udemy, YouTube.",
    },
    {
      icon: <Briefcase className="h-6 w-6 text-purple-600" />,
      title: "Job Matching Engine",
      description: "Suggests roles tailored to newly acquired skills.",
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-purple-600" />,
      title: "Project Generator",
      description: "Real-world projects to build portfolios fast.",
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      title: "Resume-to-Role Match",
      description:
        "AI extracts skills from resumes & compares them to job requirements.",
    },
  ];

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-white">
        
        <main className="flex-1">
          <section className="py-12 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
              <div className="mx-auto max-w-3xl space-y-4 text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Features
                </h1>
                <p className="text-gray-600 md:text-xl">
                  Discover how our AI-powered platform helps you bridge skill
                  gaps and accelerate your career.
                </p>
              </div>

              <div className="mx-auto mt-16 max-w-5xl">
                <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">
                  How It Works
                </h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="border-0 shadow-md bg-white/60 backdrop-blur rounded-lg"
                    >
                      <div className="p-6 flex flex-col items-center text-center">
                        <div className="mb-4 rounded-full bg-purple-100 p-3">
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-20">
                  <h2 className="text-2xl font-bold tracking-tight mb-8 text-center">
                    Key Features
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {keyFeatures.map((feature, index) => (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{feature.title}</h3>
                          <p className="text-sm text-gray-600">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-20 rounded-lg bg-gray-100 p-8">
                  <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">
                        The Skill Gap Challenge
                      </h3>
                      <p className="text-gray-600">
                        In today's rapidly evolving job market, professionals
                        struggle to identify which skills they need to advance
                        their careers. Traditional methods of skill development
                        are often untargeted and inefficient.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Our Solution</h3>
                      <p className="text-gray-600">
                        Our AI-powered platform analyzes your resume against job
                        requirements to identify specific skill gaps, then
                        provides personalized learning paths and project
                        recommendations to help you bridge those gaps
                        efficiently.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-12 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                    Ready to Bridge Your Skill Gap?
                  </h2>
                  <p className="mx-auto mt-4 max-w-[700px] text-gray-600 md:text-lg">
                    Upload your resume today and get personalized
                    recommendations to accelerate your career growth.
                  </p>
                  <div className="mt-8 flex flex-col gap-2 min-[400px]:flex-row justify-center">
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Get Started
                    </button>
                    <button className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

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

export default Features;
