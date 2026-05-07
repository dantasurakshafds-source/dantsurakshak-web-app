"use client";

import { useEffect, useState } from "react";
import Header from "../header/Header";
import Sidebar from "../sidebar/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isToggle, setIsToggle] = useState(false); // mobile sidebar toggle state
  const [isMobile, setIsMobile] = useState(false); // device screen size
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true); // initial default

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 1024;
      setIsMobile(isNowMobile);
    };

    handleResize(); // initialize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load sidebar state from localStorage after mount (only for desktop)
  useEffect(() => {
    if (!isMobile) {
      const savedState = localStorage.getItem("sidebarState");
      if (savedState !== null) {
        setIsSidebarExpanded(JSON.parse(savedState));
      }
    }
  }, [isMobile]);

  // Save sidebar state when it changes (only for desktop)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem("sidebarState", JSON.stringify(isSidebarExpanded));
    }
  }, [isSidebarExpanded, isMobile]);

  // Toggle for desktop sidebar
  const handleToggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  // Toggle for mobile sidebar
  const openMenu = () => {
    setIsToggle((prev) => !prev);
  };

  return (
    <div className="dashboard_container">
      <div
        className={`sidebar ${
          isSidebarExpanded ? "expanded-view" : "collapse-view"
        } ${
          isMobile ? (isToggle ? "show-sidebar" : "hide-sidebar") : ""
        }`}
        style={{
          width: isMobile ? "90%" : isSidebarExpanded ? "250px" : "90px",
        }}
      >
        <Sidebar
          isSidebarExpanded={isSidebarExpanded}
          isMobile={isMobile}
          openMenu={openMenu}
        />
      </div>

      <div className="dashboard_main">
        <Header
          handleToggleSidebar={handleToggleSidebar}
          openMenu={openMenu}
          isMobile={isMobile}
        />
        <main className="dashboard_content">{children}</main>
      </div>
    </div>
  );
}
