"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaTooth, FaShieldAlt, FaFileContract, FaCalendarAlt, FaGlobe, FaChevronRight } from "react-icons/fa";
import dantaLogo from "@/images/danta-suraksha-logo.png";
import msruasLogo from "@/images/r-u-o-a-s.png";

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
      {/* Top Navbar */}
      <header className="legal-navbar">
        <div className="legal-navbar-inner">
          <Link href="/" className="brand-group">
            <Image
              src={dantaLogo.src}
              alt="Danta Surakshak Logo"
              width={140}
              height={44}
              className="brand-logo-img"
              priority
            />
            <div className="brand-text-col">
              <span className="brand-title">Danta Surakshak</span>
              <span className="brand-subtitle">
                Faculty of Dental Sciences, MSRUAS
              </span>
            </div>
          </Link>

          <div className="header-actions">
            {/* Language Switcher */}
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

            <Link href="/auth/login" className="login-nav-link">
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="legal-hero">
        <div className="legal-hero-inner">
          <div className="badge">
            {pageType === "privacy" ? (
              <FaShieldAlt size={14} />
            ) : (
              <FaFileContract size={14} />
            )}
            <span>{badgeText}</span>
          </div>
          <h1 className="hero-title">{pageTitle}</h1>
          <div className="hero-meta">
            <span>
              <FaCalendarAlt size={13} />
              {lang === "en" ? "Last Updated:" : "ಕೊನೆಯದಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ:"}{" "}
              {formattedDate}
            </span>
            <span>
              <FaGlobe size={13} />
              {lang === "en" ? "Language: English" : "ಭಾಷೆ: ಕನ್ನಡ"}
            </span>
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
                <h3>Loading...</h3>
                <p>Fetching latest document details...</p>
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

      {/* Footer */}
      <footer className="legal-footer">
        <div className="legal-footer-inner">
          <div className="footer-links">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms-conditions">Terms & Conditions</Link>
            <Link href="/auth/login">Portal Login</Link>
          </div>
          <Image
            src={msruasLogo.src}
            alt="MSRUAS Logo"
            width={160}
            height={45}
            style={{ objectFit: "contain", margin: "6px 0", maxWidth: "100%" }}
          />
          <p className="footer-credit">
            © {new Date().getFullYear()}{" "}
            <strong>Danta Surakshak (Oral Health Initiative)</strong>. All
            rights reserved.
            <br />
            Faculty of Dental Sciences, M.S. Ramaiah University of Applied
            Sciences (MSRUAS), Bengaluru.
          </p>
        </div>
      </footer>
    </div>
  );
}
