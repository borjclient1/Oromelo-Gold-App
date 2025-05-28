import React, { useState, useEffect } from "react";
import { ThemeContext } from "./ThemeContext";

function ThemeProvider({ children }) {
  // Check if user has a theme preference in localStorage
  // Or use their system preference as default
  // If neither exists, default to dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return true;
    }
    // Default to dark mode if no preference is found
    return true;
  });

  // Effect to apply theme changes to document
  useEffect(() => {
    // Update localStorage
    localStorage.setItem("theme", darkMode ? "dark" : "light");

    // Update document class for Tailwind dark mode
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Provide theme state and toggle function to children
  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
