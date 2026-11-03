import React from "react";
import Image from "next/image";
import type { Metadata } from "next";
import {
  FaTooth,
  FaCheck,
  FaHeartbeat,
  FaShieldAlt,
  FaBookMedical,
  FaComments,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { FiArrowUpRight } from "react-icons/fi";
import CareWorkflowTabs from "@/components/public/CareWorkflowTabs";
import ambassadorImg from "@/images/ambassador-portrait.jpg";

export const metadata: Metadata = {
  title: "Danta Surakshak | Oral Health Education & Community Care Platform - MSRUAS",
  description:
    "Official portal of Danta Surakshak: An oral health care initiative by Faculty of Dental Sciences, Ramaiah University of Applied Sciences (MSRUAS). Connecting Users, Danta Surakshak ambassadors, Admins, and Hospital Dental Doctors.",
};

export default function HomePage() {
  return (
    <div className="home-page">
      {/* ─── 1. EDITORIAL HERO SECTION (Matches Reference Design) ─── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          {/* Category Kicker */}
          <div className="hero-kicker-wrapper">
            <span className="hero-kicker">
              DECISION INTELLIGENCE • COMMUNITY ORAL HEALTHCARE
            </span>
          </div>

          {/* Large Editorial Headline */}
          <h1 className="hero-editorial-title">
            Oral health care, <br />
            made durable.
          </h1>

          {/* Subtitle */}
          <p className="hero-editorial-desc">
            Danta Surakshak gives patients, community ambassadors, case administrators,
            and hospital dental surgeons one synchronized platform for early lesion screening,
            exclusive case ownership, and verified doctor feedback.
          </p>

          {/* Centered Action Buttons */}
          <div className="hero-editorial-cta">
            <a href="#care-workflow" className="btn-dark-pill">
              <span>Explore Workflow</span>
              <FiArrowUpRight size={17} />
            </a>
            <a href="#disease-education" className="btn-outline-pill">
              <span>How It Works</span>
              <FiArrowUpRight size={17} />
            </a>
          </div>

          {/* ─── 3-COLUMN EDITORIAL BENTO SHOWCASE (Reference Layout) ─── */}
          <div className="hero-bento-grid">
            {/* Column 1: Tall Ambassador Portrait */}
            <div className="bento-col bento-col-portrait">
              <div className="portrait-image-wrapper">
                <Image
                  src={ambassadorImg.src}
                  alt="Danta Surakshak Oral Health Ambassador"
                  fill
                  sizes="(max-width: 992px) 100vw, 33vw"
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                  priority
                />
                <div className="portrait-floating-tag">
                  <span className="tag-dot" />
                  <span>Danta Surakshak Ambassador • Field Screening Lead</span>
                </div>
              </div>
            </div>

            {/* Column 2: Textured Clinical Case Status Card */}
            <div className="bento-col bento-col-textured">
              <div className="textured-card-inner">
                <div className="textured-card-top">
                  <span className="card-kicker">ACTIVE SCREENING PIPELINE</span>
                  <h3>Community Oral Assessment &amp; Lesion Photography</h3>
                </div>

                <div className="status-pills-stack">
                  <div className="glass-status-pill">
                    <span className="pill-label">PATIENT INTAKE</span>
                    <span className="pill-value">CAPTURED</span>
                  </div>
                  <div className="glass-status-pill">
                    <span className="pill-label">ADMIN STATUS</span>
                    <span className="pill-value">EXCLUSIVE</span>
                  </div>
                  <div className="glass-status-pill">
                    <span className="pill-label">DOCTOR REVIEW</span>
                    <span className="pill-value">SCHEDULED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Stacked Verification & Decision Record */}
            <div className="bento-col bento-col-stacked">
              {/* Top Stacked Card: Checkmark Validation */}
              <div className="stacked-card-top">
                <div className="check-circle-icon">
                  <FaCheck size={28} />
                </div>
                <h4>Verified Patient Continuum</h4>
                <p>100% Doctor-Verified Clinical Review &amp; Advice</p>
              </div>

              {/* Bottom Stacked Card: Decision Record */}
              <div className="stacked-card-bottom">
                <div className="record-header">
                  <span className="record-code">DECISION RECORD • DS-402</span>
                  <span className="record-badge">ACTIVE</span>
                </div>

                <h3 className="record-title">
                  Exclusive takeover approved for central admin.
                </h3>

                <p className="record-sub">
                  Doctor clinical review completed at MSRUAS. Action plan relayed to field ambassador.
                </p>

                <div className="record-meta-row">
                  <div className="meta-item">
                    <span className="meta-label">STATUS</span>
                    <span className="meta-val">Verified</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">DISCIPLINE</span>
                    <span className="meta-val">Oral Medicine</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">TURNAROUND</span>
                    <span className="meta-val">&lt; 24 Hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. THE 4-STAGE CARE WORKFLOW (Spacious, Generous Height) ─── */}
      <section id="care-workflow" className="workflow-section">
        <div className="workflow-inner">
          <div className="section-header-editorial">
            <span className="sec-kicker">THE 4-ROLE CONTINUUM</span>
            <h2 className="sec-title">From community doorstep to hospital specialist.</h2>
            <p className="sec-subtitle">
              A synchronized 4-stage referral and feedback chain connecting the grassroot
              community with university hospital dental surgeons without duplicate efforts or communication gaps.
            </p>
          </div>

          {/* Interactive Care Continuum Tabs */}
          <CareWorkflowTabs />
        </div>
      </section>

      {/* ─── 3. DENTAL EDUCATION & CLEANING LIBRARY (Spacious) ─── */}
      <section id="disease-education" className="education-section">
        <div className="education-inner">
          <div className="section-header-editorial">
            <span className="sec-kicker">PREVENTATIVE CARE &amp; AWARENESS</span>
            <h2 className="sec-title">Dental Awareness &amp; Teeth Cleaning Library</h2>
            <p className="sec-subtitle">
              Clear, clinically verified guidelines provided by the Faculty of Dental Sciences,
              empowering patients with early detection skills and proper oral hygiene habits.
            </p>
          </div>

          {/* 6 Rich Education Cards */}
          <div className="education-spacious-grid">
            <div className="edu-spacious-card">
              <div className="edu-icon-bubble">
                <FaTooth size={22} />
              </div>
              <h3>Dental Caries &amp; Cavities</h3>
              <p>
                Understand acid erosion of enamel, early white-spot lesions, dietary sugars,
                fluoride remineralization, and when to seek restoration fillings before pain begins.
              </p>
              <div className="edu-tags-row">
                <span>Tooth Decay</span>
                <span>Fluoride Treatment</span>
                <span>Filling Guide</span>
              </div>
            </div>

            <div className="edu-spacious-card">
              <div className="edu-icon-bubble">
                <FaShieldAlt size={22} />
              </div>
              <h3>Oral Lesions &amp; Pre-Cancer Signs</h3>
              <p>
                Recognize persistent red or white patches (Leukoplakia, Oral Submucous Fibrosis),
                burning sensations with spicy food, restricted mouth opening, and tobacco cessation aid.
              </p>
              <div className="edu-tags-row">
                <span>OPMD Screening</span>
                <span>Tobacco Risks</span>
                <span>Biopsy Referral</span>
              </div>
            </div>

            <div className="edu-spacious-card">
              <div className="edu-icon-bubble">
                <FaHeartbeat size={22} />
              </div>
              <h3>Gum &amp; Periodontal Health</h3>
              <p>
                Identify gingival inflammation, bleeding during brushing, tartar calcification,
                and advanced bone-loss periodontitis preventable with routine ultrasonic scaling.
              </p>
              <div className="edu-tags-row">
                <span>Gingivitis</span>
                <span>Bleeding Gums</span>
                <span>Scaling Care</span>
              </div>
            </div>

            <div className="edu-spacious-card featured-brushing-card">
              <div className="edu-icon-bubble">
                <HiSparkles size={22} />
              </div>
              <h3>How to Clean Teeth Properly</h3>
              <p>
                Step-by-step Modified Bass Technique: 45° angle at the gum line, gentle circular
                vibrations, 2 minutes twice daily, tongue cleaning, and replacing brushes every 90 days.
              </p>
              <div className="edu-tags-row">
                <span>Modified Bass</span>
                <span>2-Min Timer</span>
                <span>Flossing Protocol</span>
              </div>
            </div>

            <div className="edu-spacious-card">
              <div className="edu-icon-bubble">
                <FaBookMedical size={22} />
              </div>
              <h3>Dental Emergencies &amp; First Aid</h3>
              <p>
                Immediate protocol for knocked-out (avulsed) permanent teeth: keep in cold milk
                or saliva, avoid touching the root, and reach a dental trauma center within 60 minutes.
              </p>
              <div className="edu-tags-row">
                <span>Avulsed Tooth</span>
                <span>Tooth Fracture</span>
                <span>Emergency Care</span>
              </div>
            </div>

            <div className="edu-spacious-card">
              <div className="edu-icon-bubble">
                <FaComments size={22} />
              </div>
              <h3>Oral Health Myths vs Facts</h3>
              <p>
                Evidence-based facts debunking myths: scaling does NOT loosen teeth; wisdom tooth
                extraction does NOT harm eyesight; hard bristles cause irreversible enamel abrasion.
              </p>
              <div className="edu-tags-row">
                <span>Verified Facts</span>
                <span>Doctor Advice</span>
                <span>Evidence-Based</span>
              </div>
            </div>
          </div>

          {/* Daily 4-Step Teeth Cleaning Routine Banner */}
          <div className="brushing-routine-banner">
            <div className="routine-header">
              <span className="routine-badge">DAILY CLINICAL ROUTINE</span>
              <h3>Doctor-Recommended 4-Step Daily Oral Hygiene</h3>
            </div>
            <div className="routine-steps-grid">
              <div className="routine-step-item">
                <span className="step-idx">01</span>
                <h4>Morning Brushing</h4>
                <p>2 full minutes using a soft-bristle toothbrush and fluoridated paste at a 45° angle.</p>
              </div>
              <div className="routine-step-item">
                <span className="step-idx">02</span>
                <h4>Interdental Flossing</h4>
                <p>Gently clean contact areas between adjacent teeth to remove plaque where bristles cannot reach.</p>
              </div>
              <div className="routine-step-item">
                <span className="step-idx">03</span>
                <h4>Tongue Cleaning</h4>
                <p>Clean from back to front with a gentle tongue scraper to clear bacterial residue.</p>
              </div>
              <div className="routine-step-item">
                <span className="step-idx">04</span>
                <h4>Night Routine</h4>
                <p>Always brush before bedtime; saliva flow drops at night, making teeth vulnerable to acid decay.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
