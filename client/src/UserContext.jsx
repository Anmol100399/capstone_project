import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check user session on app load
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await axios.get("https://memorable-moments.onrender.com/user", {
          withCredentials: true, // Ensure cookies are sent
        });
        setUser(response.data); // Set user data
      } catch (err) {
        if (err.response?.status === 401) {
          setUser(null); // No user is logged in
        } else {
          setError(err.response?.data?.error || "Failed to fetch user data");
        }
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  // Login function for both regular users and admins
  const loginUser = async (email, password, isAdmin = false) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    try {
      const endpoint = isAdmin ? "/admin/login" : "/login";
      const response = await axios.post(
        `https://memorable-moments.onrender.com${endpoint}`,
        { email, password },
        { withCredentials: true }
      );

      if (!response.data) {
        throw new Error("User not found");
      }

      setUser(response.data); // Update user in context
      setError(null);
    } catch (err) {
      throw new Error(err.response?.data?.error || "Login failed. Please check your credentials.");
    }
  };

  // Logout function
  const logoutUser = async () => {
    try {
      await axios.post(
        "https://memorable-moments.onrender.com/logout",
        {},
        { withCredentials: true }
      );
      setUser(null); // Clear user data
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Logout failed. Please try again.");
    }
  };

  return (
    <UserContext.Provider
      value={{ user, loginUser, logoutUser, loading, error }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;