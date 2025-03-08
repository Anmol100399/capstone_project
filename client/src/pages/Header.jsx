import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";
import { BsFillCaretDownFill } from "react-icons/bs";

export default function Header() {
  const { user, logoutUser } = useContext(UserContext); // Use logoutUser from context
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      await logoutUser(); // Use logoutUser from context
      window.location.href = "/"; // Redirect to homepage
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="bg-white shadow-md py-3 px-4 sm:px-6 md:px-8 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50">
      {/* Logo and Search Bar (Left Side) */}
      <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto mb-4 md:mb-0">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="../src/assets/logo.png" alt="Logo" className="w-30 h-7 md:w-26 md:h-9" />
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

      {/* Search Results */}
      {searchQuery && (
        <div className="absolute left-4 md:left-64 mt-12 w-11/12 md:w-64 bg-white rounded-lg shadow-lg border border-gray-200">
          {events
            .filter((event) =>
              event.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((event) => (
              <div key={event._id} className="p-3 hover:bg-gray-50">
                <Link to={"/event/" + event._id}>
                  <div className="text-gray-700 text-sm">{event.title}</div>
                </Link>
              </div>
            ))}
        </div>
      )}

      {/* Navigation Links (Right Side) */}
      <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-start">
        {/* Create Event */}
        <Link
          to="/createEvent"
          className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
        >
          Create Event
        </Link>

        {/* Dashboard (for admin) */}
        {user && user.role === "admin" && (
          <Link
            to="/adminDashboard"
            className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
          >
            Dashboard
          </Link>
        )}

        {/* Calendar */}
        <Link
          to="/calendar"
          className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
        >
          Calendar
        </Link>

        {/* Login and Sign Up (for non-logged-in users) */}
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

        {/* User Menu (for logged-in users) */}
        {user && (
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative">
              {/* User Name (Clickable to go to Account Page) */}
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
                    e.preventDefault(); // Prevent Link navigation
                    setIsMenuOpen(!isMenuOpen);
                  }}
                />
              </Link>

              {/* Dropdown Menu (Only Log Out Option) */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 md:w-48 bg-white rounded-lg shadow-lg border border-gray-200">
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
          </div>
        )}
      </div>
    </header>
  );
}