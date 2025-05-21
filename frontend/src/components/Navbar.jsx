"use client";

import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronUp, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-purple-800 text-gray-100

 backdrop-blur"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 ">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
            <ChevronUp className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-xl font-bold">Skill Up</span>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-gray-100" />
          ) : (
            <Menu className="h-6 w-6 text-gray-100" />
          )}
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-lg font-medium ">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-gray-900 border-b-2 border-purple-600 "
                : "text-gray-100 hover:text-gray-900 transition-colors"
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive
                ? "text-gray-900 border-b-2 border-purple-600 "
                : "text-gray-100 hover:text-gray-900 transition-colors"
            }
          >
            About
          </NavLink>
          <NavLink
            to="/features"
            className={({ isActive }) =>
              isActive
                ? "text-gray-900 border-b-2 border-purple-600 "
                : "text-gray-100 hover:text-gray-900 transition-colors"
            }
          >
            Features
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "text-gray-900 border-b-2 border-purple-600 "
                : "text-gray-100 hover:text-gray-900 transition-colors"
            }
          >
            Contact
          </NavLink>
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-md md:hidden">
            <nav className="flex flex-col py-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "text-gray-900 bg-purple-50 px-4 py-3 font-medium"
                    : "text-gray-600 hover:bg-gray-50 px-4 py-3 transition-colors"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive
                    ? "text-gray-900 bg-purple-50 px-4 py-3 font-medium"
                    : "text-gray-600 hover:bg-gray-50 px-4 py-3 transition-colors"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </NavLink>
              <NavLink
                to="/features"
                className={({ isActive }) =>
                  isActive
                    ? "text-gray-900 bg-purple-50 px-4 py-3 font-medium"
                    : "text-gray-600 hover:bg-gray-50 px-4 py-3 transition-colors"
                }
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </NavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
