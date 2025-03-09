import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";
import { BsFillCaretDownFill } from "react-icons/bs";
import { FaBars, FaTimes } from "react-icons/fa"; // Hamburger and close icons

export default function Header() {
  const { user, logoutUser } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef();

  // Close search results on document click
  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setSearchQuery("");
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  // Handle search input change
  const handleSearchInputChange = (event) => setSearchQuery(event.target.value);

  // Logout function
  const logout = async () => {
    try {
      console.log("Logging out user:", user);
      await logoutUser();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when a link is clicked
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md py-3 px-4 sm:px-6 md:px-8 sticky top-0 z-50">
      {/* Header Content (Logo, Search Bar, Hamburger Icon) */}
      <div className="flex justify-between items-center">
        {/* Logo and Search Bar */}
        <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            {/* Show EventLogo.png on phone screens and logo.png on larger screens */}
            <img
              src={window.innerWidth < 768 ? "/assets/EventLogo.png" : "/assets/logo.png"}
              alt="Logo"
              className="w-30 h-7 md:w-26 md:h-9"
            />
          </Link>

          {/* Search Bar */}
          <div className="flex items-center bg-gray-100 rounded-lg py-2 px-4 w-full md:w-64 gap-2">
            <button className="text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
            <div ref={searchInputRef} className="flex-grow">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="w-full text-sm text-gray-700 bg-transparent outline-none placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Hamburger Icon for Mobile */}
        <div className="md:hidden ml-4"> {/* Added margin-left for spacing */}
          <button
            onClick={toggleMobileMenu}
            className="text-[#062966] hover:text-[#041A4D] focus:outline-none transition-colors duration-300"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" /> // Hamburger icon
            )}
          </button>
        </div>

        {/* Navigation Links (Visible on Desktop) */}
        <div className="hidden md:flex items-center gap-4 md:gap-6">
          <Link
            to="/createEvent"
            className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
          >
            Create Event
          </Link>

          {user && user.role === "admin" && (
            <Link
              to="/adminDashboard"
              className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
            >
              Dashboard
            </Link>
          )}

          <Link
            to="/calendar"
            className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
          >
            Calendar
          </Link>

          {!user && (
            <>
              <Link to="/login">
                <button className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200">
                  Log in
                </button>
              </Link>
              <Link to="/register">
                <button className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200">
                  Sign up
                </button>
              </Link>
            </>
          )}

          {user && (
            <div className="relative">
              <Link
                to="/userAccount"
                className="flex items-center gap-1 md:gap-2 cursor-pointer"
              >
                <span className="font-semibold text-gray-700 text-sm md:text-base">
                  {user?.username ? user.username.toUpperCase() : "Guest"}
                </span>
                <BsFillCaretDownFill
                  className="h-3 w-3 md:h-4 md:w-4 text-gray-500"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                />
              </Link>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                  <nav>
                    <div className="flex flex-col py-2">
                      <button
                        onClick={logout}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        Log out
                      </button>
                    </div>
                  </nav>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu (Opens Below the Header) */}
      <div
        className={`${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } md:hidden overflow-hidden transition-all duration-500 ease-in-out`}
      >
        <div className="flex flex-col items-center gap-4 py-4">
          <Link
            to="/createEvent"
            onClick={closeMobileMenu}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
          >
            Create Event
          </Link>

          {user && user.role === "admin" && (
            <Link
              to="/adminDashboard"
              onClick={closeMobileMenu}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
            >
              Dashboard
            </Link>
          )}

          <Link
            to="/calendar"
            onClick={closeMobileMenu}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
          >
            Calendar
          </Link>

          {!user && (
            <>
              <Link to="/login" onClick={closeMobileMenu}> {/* Close menu on click */}
                <button className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200">
                  Log in
                </button>
              </Link>
              <Link to="/register" onClick={closeMobileMenu}> {/* Close menu on click */}
                <button className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200">
                  Sign up
                </button>
              </Link>
            </>
          )}

          {user && (
            <div className="relative">
              <Link
                to="/userAccount"
                onClick={closeMobileMenu}
                className="flex items-center gap-1 md:gap-2 cursor-pointer"
              >
                <span className="font-semibold text-gray-700 text-sm md:text-base">
                  {user?.username ? user.username.toUpperCase() : "Guest"}
                </span>
                <BsFillCaretDownFill
                  className="h-3 w-3 md:h-4 md:w-4 text-gray-500"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                />
              </Link>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                  <nav>
                    <div className="flex flex-col py-2">
                      <button
                        onClick={logout}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        Log out
                      </button>
                    </div>
                  </nav>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}