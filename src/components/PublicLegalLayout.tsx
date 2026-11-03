"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaTooth,
  FaShieldAlt,
  FaFileContract,
  FaCalendarAlt,
  FaGlobe,
  FaChevronRight,
} from "react-icons/fa";
import OvalLoader from "@/(common)/OvalLoader";

export interface LegalSection {
  heading: {
    en: string;
    kn: string;
  };
  description: {
    en: string;
    kn: string;
  };
}

interface PublicLegalLayoutProps {
  pageType: "privacy" | "terms";
  titleEn: string;
  titleKn: string;
  updatedAt?: string;
  sections: LegalSection[];
  isLoading?: boolean;
}

export default function PublicLegalLayout({
  pageType,
  titleEn,
  titleKn,
  updatedAt,
  sections,
  isLoading,
}: PublicLegalLayoutProps) {
  const [lang, setLang] = useState<"en" | "kn">("en");

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const pageTitle = lang === "en" ? titleEn : titleKn;
  const badgeText =
    pageType === "privacy"
      ? lang === "en"
        ? "Official Privacy Policy"
        : "ಅಧಿಕೃತ ಗೌಪ್ಯತಾ ನೀತಿ"
      : lang === "en"
      ? "Official Terms & Conditions"
      : "ಅಧಿಕೃತ ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು";

  return (
    <div className="legal-page-wrapper">
      {/* Hero Banner */}
      <section className="legal-hero">
        <div className="legal-hero-inner">
          <div className="hero-left-col">
            
            <h1 className="hero-title">{pageTitle}</h1>
            <div className="hero-meta">
              
              <span>
                <FaGlobe size={13} />
                {lang === "en" ? "Language: English" : "ಭಾಷೆ: ಕನ್ನಡ"}
              </span>
            </div>
          </div> 

          <div className="hero-right-col">
            <div className="lang-switcher" aria-label="Language selection">
              <button
                type="button"
                className={lang === "en" ? "active" : ""}
                onClick={() => setLang("en")}
              >
                English
              </button>
              <button
                type="button"
                className={lang === "kn" ? "active" : ""}
                onClick={() => setLang("kn")}
              >
                ಕನ್ನಡ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="legal-body-container">
        <div className="legal-grid">
          {/* Table of Contents (Sticky on Desktop) */}
          <aside className="toc-card">
            <div className="toc-title">
              <FaTooth size={16} />
              <span>{lang === "en" ? "Table of Contents" : "ಪರಿವಿಡಿ"}</span>
            </div>
            <ul className="toc-list">
              {sections.map((sec, idx) => {
                const headingText =
                  lang === "en"
                    ? sec.heading.en || sec.heading.kn
                    : sec.heading.kn || sec.heading.en;
                return (
                  <li key={idx} className="toc-item">
                    <a href={`#section-${idx + 1}`}>
                      {idx + 1}. {headingText || `Section ${idx + 1}`}
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="toc-footer-link">
              {pageType === "privacy" ? (
                <Link href="/terms-conditions">
                  Terms & Conditions <FaChevronRight size={11} />
                </Link>
              ) : (
                <Link href="/privacy-policy">
                  Privacy Policy <FaChevronRight size={11} />
                </Link>
              )}
            </div>
          </aside>

          {/* Legal Document Content */}
          <article className="legal-content-card">
            {isLoading ? (
              <div className="empty-state">
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}>
                  <OvalLoader height="36" width="36" color="#56235E" ariaLabel="loading" />
                </div>
                <h3>Loading Document...</h3>
                <p>Fetching latest details from server...</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="empty-state">
                <h3>No Content Available</h3>
                <p>The policy document is being updated. Please check back soon.</p>
              </div>
            ) : (
              sections.map((sec, idx) => {
                const headingText =
                  lang === "en"
                    ? sec.heading.en || sec.heading.kn
                    : sec.heading.kn || sec.heading.en;
                const bodyHtml =
                  lang === "en"
                    ? sec.description.en || sec.description.kn
                    : sec.description.kn || sec.description.en;

                return (
                  <section
                    key={idx}
                    id={`section-${idx + 1}`}
                    className="section-block"
                  >
                    <div className="section-header">
                      <span className="section-number">{idx + 1}</span>
                      <h2 className="section-heading">{headingText}</h2>
                    </div>
                    <div
                      className="section-body"
                      dangerouslySetInnerHTML={{ __html: bodyHtml || "" }}
                    />
                  </section>
                );
              })
            )}
          </article>
        </div>
      </main>
    </div>
  );
}
