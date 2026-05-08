import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const ScrollContext = createContext();

// Custom hook to use the scroll context
export const useScroll = () => useContext(ScrollContext);

// Scroll provider component to wrap the app and provide the context
export const ScrollProvider = ({ children }) => {
  const [currentSectionColor, setCurrentSectionColor] =
    useState("--light-color");

  useEffect(() => {
    const updateSectionColor = () => {
      const sections = document.querySelectorAll(".section");
      let color = "--light-color"; // Default color

      // Loop through sections and determine the color based on background
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();

        // Check if the section is in the viewport
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          const bgColor = window.getComputedStyle(section).backgroundColor;

          // Set color based on section background color
          if (bgColor === "rgb(0, 0, 0)") {
            // Example for dark background
            color = "--dark-color";
          } else {
            color = "--light-color";
          }
        }
      });

      // Update the context color
      setCurrentSectionColor(color);
    };

    window.addEventListener("scroll", updateSectionColor);
    updateSectionColor(); // Initial check

    return () => {
      window.removeEventListener("scroll", updateSectionColor);
    };
  }, []);

  return (
    <ScrollContext.Provider value={{ currentSectionColor }}>
      {children}
    </ScrollContext.Provider>
  );
};
