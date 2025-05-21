import { BookOpen, Sparkles, Lightbulb, Briefcase } from "lucide-react";
import Navbar from "./Navbar";

const About = () => {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-white">

        <main className="container mx-auto px-4 py-12 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                About Us
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Bridging the gap between your current skills and your dream
                career with AI-powered insights.
              </p>
            </div>

            <div className="space-y-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                  <p className="text-gray-600 mb-4">
                    In today's competitive job market, individuals often
                    struggle to identify the exact skill gaps preventing them
                    from securing their desired roles.
                  </p>
                  <p className="text-gray-600">
                    Our mission is to provide personalized, data-driven insights
                    that help professionals bridge these gaps efficiently and
                    accelerate their career growth.
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                    The Skill Gap Challenge
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 mr-2"></div>
                      <span className="text-sm">
                        Generic career advice lacks personalization
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 mr-2"></div>
                      <span className="text-sm">
                        Finding the right learning resources is time-consuming
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 mr-2"></div>
                      <span className="text-sm">
                        Traditional skill development is often untargeted
                      </span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 mr-2"></div>
                      <span className="text-sm">
                        Professionals struggle to identify which skills to
                        prioritize
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-b py-12">
                <h2 className="text-2xl font-semibold mb-8 text-center">
                  How We Help
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <Sparkles className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
                    <p className="text-sm text-gray-600">
                      Our advanced AI extracts skills from your resume and
                      compares them with job requirements.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Curated Learning</h3>
                    <p className="text-sm text-gray-600">
                      We recommend the best courses from platforms like Coursera
                      and Udemy to fill your skill gaps.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                      <Lightbulb className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Project Ideas</h3>
                    <p className="text-sm text-gray-600">
                      We generate tailored project ideas to help you build a
                      portfolio that showcases your new skills.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <Briefcase className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Career Guidance</h3>
                    <p className="text-sm text-gray-600">
                      We provide job recommendations and career path insights
                      based on your evolving skill set.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

export default About;
