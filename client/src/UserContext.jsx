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
        const response = await axios.get("/profile", {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Fixed: Use response.data instead of undefined 'data'
        setUser(response.data);
        localStorage.setItem('token', response.data.token); // Store token if returned
      } catch (err) {
        console.log("Auth check failed", err);
        // Clear invalid token
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false); // Ensure loading is set to false when done
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
      setLoading(true); // Set loading state
      const endpoint = isAdmin ? "/admin/login" : "/login";
      const response = await axios.post(
        endpoint, // Removed hardcoded URL - use relative path
        { email, password },
        { withCredentials: true }
      );

      if (!response.data) {
        throw new Error("User not found");
      }

      // Set user data based on the response
      const { token, user: userData } = response.data;
      if (token) {
        localStorage.setItem('token', token); // Store the token
      }
      
      setUser(userData || response.data); // Update user in context
      setError(null);
      return userData || response.data; // Return user data for potential use
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
      throw err; // Re-throw for component-level handling
    } finally {
      setLoading(false); // Ensure loading is reset
    }
  };

  // Logout function
  const logoutUser = async () => {
    try {
      setLoading(true);
      await axios.post(
        "/logout", // Removed hardcoded URL
        {},
        { withCredentials: true }
      );
      setUser(null); // Clear user data
      localStorage.removeItem('token'); // Clear token
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{ 
        user, 
        loginUser, 
        logoutUser, 
        loading, 
        error,
        setUser // Added setUser in case you need to update user elsewhere
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;