import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await axios.get("http://localhost:4000/user", {
          withCredentials: true, // Ensure cookies are sent with the request
        });
        setUser(response.data);
      } catch (err) {
        // Handle 401 Unauthorized (user not logged in) gracefully
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

  const loginUser = async (email, password) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
  
    try {
      const response = await axios.post(
        "http://localhost:4000/login",
        { email, password },
        { withCredentials: true }
      );
  
      if (!response.data) {
        throw new Error("User not found");
      }
  
      setUser(response.data);
      setError(null);
    } catch (err) {
      throw new Error(err.response?.data?.error || "Login failed. Please check your credentials.");
    }
  };

  const logoutUser = async () => {
    try {
      await axios.post(
        "http://localhost:4000/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.error || "Logout failed. Please try again."
      );
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