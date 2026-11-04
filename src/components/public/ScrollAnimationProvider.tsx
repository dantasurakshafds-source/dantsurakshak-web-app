"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollAnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const targetSelectors = [
      ".selector-card",
      ".takeover-architecture-banner",
      ".textured-card-inner",
      ".edu-spacious-card",
      ".brushing-routine-banner",
      ".workflow-tab-bar",
      ".workflow-card-details-panel",
      ".dynamic-section-container",
      ".section-block",
      ".toc-card",
      ".legal-content-card",
      ".da-card",
      ".da-guide-card",
      ".step-item",
      ".da-two-col-grid > div",
      "[data-fade-up]",
    ];

    const observedElements = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in-view");
          } else {
            const rect = entry.boundingClientRect;
            // When user scrolls away, reset so it fades up in again upon scrolling back
            if (rect.top > window.innerHeight * 0.85 || rect.bottom < 0) {
              entry.target.classList.remove("is-in-view");
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.1,
      }
    );

    const attachObserver = () => {
      targetSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          if (!observedElements.has(el)) {
            el.classList.add("fade-up-element");
            observer.observe(el);
            observedElements.add(el);
          }
        });
      });
    };

    // Delay slightly to let initial render settle
    const timer = setTimeout(attachObserver, 50);

    const mutationObserver = new MutationObserver(() => {
      attachObserver();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      mutationObserver.disconnect();
      observedElements.clear();
    };
  }, [pathname]);

  return <>{children}</>;
}

