"use client";

import React, { useState } from "react";
import {
  FaTooth,
  FaUserCheck,
  FaUserShield,
  FaUserMd,
  FaArrowRight,
  FaLock,
  FaCheckCircle,
} from "react-icons/fa";

interface StageData {
  id: string;
  stepNum: string;
  title: string;
  roleTag: string;
  shortLabel: string;
  icon: React.ReactNode;
  description: string;
  checklist: string[];
  mockTitle: string;
  mockBadge: string;
  mockDetails: { label: string; value: string }[];
  mockNote: string;
}

export default function CareWorkflowTabs() {
  // Default active tab to Stage 03 (Admin Exclusive Takeover) matching the user's design reference
  const [activeTab, setActiveTab] = useState<number>(2);

  const stages: StageData[] = [
    {
      id: "user",
      stepNum: "01",
      title: "Community User",
      roleTag: "PATIENT & PUBLIC",
      shortLabel: "01 Community User",
      icon: <FaTooth size={22} />,
      description:
        "Citizens explore dental disease education, daily teeth brushing routines, and symptom checklists. They register their oral health concerns or receive free field screening in their local community.",
      checklist: [
        "Learn disease symptoms, brushing & flossing hygiene",
        "Participate in ambassador-guided oral screenings",
        "Receive doctor-verified diagnosis via field ambassador",
      ],
      mockTitle: "Community Patient Screening Intake",
      mockBadge: "STAGE 01 • CITIZEN INTAKE",
      mockDetails: [
        { label: "USER STATUS", value: "Registered via Ambassador" },
        { label: "HABIT HISTORY", value: "Recorded in App" },
        { label: "PRIMARY NEED", value: "Preventive Checkup & Caries Guide" },
        { label: "NEXT ACTION", value: "Ambassador Lesion Scan" },
      ],
      mockNote: "Empowering citizens with early dental awareness before tooth pain turns severe.",
    },
    {
      id: "danta",
      stepNum: "02",
      title: "Danta Surakshak",
      roleTag: "FIELD AMBASSADOR",
      shortLabel: "02 Danta Surakshak",
      icon: <FaUserCheck size={22} />,
      description:
        "Trained health ambassadors visit rural and urban households. Using the mobile app, they capture high-resolution oral lesion photos and fill structured risk questionnaires.",
      checklist: [
        "Captures clinical oral photographs & lesion scans",
        "Records patient habits, pain history & tobacco risk",
        "Submits complete case dossier to central admin queue",
      ],
      mockTitle: "Field Screening Dossier #DS-782",
      mockBadge: "STAGE 02 • FIELD AMBASSADOR",
      mockDetails: [
        { label: "AMBASSADOR ID", value: "DS-BLR-042 (Trained)" },
        { label: "CLINICAL PHOTOS", value: "4 High-Res Lesion Scans Captured" },
        { label: "QUESTIONNAIRE", value: "Completed (Tobacco risk flagged)" },
        { label: "TRANSMISSION", value: "Delivered to Central Queue" },
      ],
      mockNote: "Field ambassadors act as the frontline eyes and ears of university dental doctors.",
    },
    {
      id: "admin",
      stepNum: "03",
      title: "Admin",
      roleTag: "EXCLUSIVE TAKEOVER",
      shortLabel: "03 Admin (Exclusive Lock)",
      icon: <FaUserShield size={22} />,
      description:
        "Multiple administrators monitor incoming screening submissions. When one admin takes over a case, it locks exclusively to prevent duplicate interventions.",
      checklist: [
        "Exclusive case takeover (Remaining admins cannot alter)",
        "Physically consults with hospital dental doctors at MSRUAS",
        "Enters doctor feedback and sends resolution to ambassador",
      ],
      mockTitle: "Admin Case Record #DS-782",
      mockBadge: "EXCLUSIVE LOCK ACTIVE",
      mockDetails: [
        { label: "ASSIGNED ADMIN", value: "Admin #07 (Exclusive Ownership)" },
        { label: "LOCK STATUS", value: "Locked (Other admins cannot modify)" },
        { label: "DOCTOR CONSULT", value: "Physical consult at MSRUAS Dental OPD" },
        { label: "RESOLUTION", value: "Clinical feedback recorded & dispatched" },
      ],
      mockNote: "Exclusive lock prevents duplicate interventions and ensures single-point clinical accountability.",
    },
    {
      id: "doctor",
      stepNum: "04",
      title: "Hospital Dental Doctor",
      roleTag: "HOSPITAL SPECIALIST",
      shortLabel: "04 Hospital Dental Doctor",
      icon: <FaUserMd size={22} />,
      description:
        "Dental surgeons and faculty at MSRUAS review the clinical photographs and symptom data to provide expert clinical opinions, referral pathways, and treatment advice.",
      checklist: [
        "Expert diagnosis of oral lesions, caries, & periodontitis",
        "Prescribes immediate clinical guidance & hospital visit",
        "Closes feedback loop: Admin inputs advice for patient",
      ],
      mockTitle: "Clinical Specialist Assessment #DS-782",
      mockBadge: "STAGE 04 • DOCTOR VERIFIED",
      mockDetails: [
        { label: "CLINICAL FACULTY", value: "Dept of Oral Medicine & Radiology" },
        { label: "EVALUATION", value: "Early Enamel Caries & Gingival Tartar" },
        { label: "RECOMMENDATION", value: "Fluoride Restoration & Scaling Visit" },
        { label: "STATUS", value: "Verified by Dental Surgeon" },
      ],
      mockNote: "Hospital dental specialists provide expert tertiary care guidance directly to rural & urban communities.",
    },
  ];

  return (
    <div className="care-workflow-tabs-container">
      {/* ─── 1. Interactive Tabs Bar (Matches Screenshot) ─── */}
      <div className="workflow-tab-bar" role="tablist" aria-label="Care Workflow Stages">
        {stages.map((stage, idx) => {
          const isActive = activeTab === idx;
          return (
            <React.Fragment key={stage.id}>
              <button
                type="button"
                role="tab"
                id={`tab-${stage.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${stage.id}`}
                className={`tab-nav-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(idx)}
              >
                <span className="tab-nav-label">{stage.shortLabel}</span>
              </button>

              {idx < stages.length - 1 && (
                <span className="tab-nav-arrow" aria-hidden="true">
                  <FaArrowRight size={12} />
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ─── 2. The 4 Interactive Cards Grid (Directly below tab bar as in screenshot) ─── */}
      <div className="workflow-cards-selector-grid">
        {stages.map((st, index) => {
          const isSelected = activeTab === index;
          return (
            <div
              key={st.id}
              role="button"
              tabIndex={0}
              className={`selector-card ${isSelected ? "selected" : ""}`}
              onClick={() => setActiveTab(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setActiveTab(index);
                }
              }}
            >
              <div className="selector-card-top">
                <span className={`selector-step ${isSelected ? "active-step" : ""}`}>
                  STEP {st.stepNum}
                </span>
                <span className="selector-tag">{st.roleTag}</span>
              </div>

              <div className={`selector-icon ${isSelected ? "active-icon" : ""}`}>
                {st.icon}
              </div>

              <h4 className="selector-title">{st.title}</h4>
              <p className="selector-desc">{st.description}</p>

              <ul className="selector-checklist">
                {st.checklist.map((item, i) => (
                  <li key={i}>
                    <FaCheckCircle size={14} className="check-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="selector-footer">
                <span className="click-hint">
                  {isSelected ? "Stage Active" : "Click to select"}
                </span>
                <FaArrowRight size={11} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── 3. Exclusive Takeover Architecture Feature Box ─── */}
      <div className="takeover-architecture-banner">
        <div className="takeover-icon-col">
          <div className="lock-circle">
            <FaLock size={20} />
          </div>
        </div>
        <div className="takeover-content-col">
          <span className="takeover-kicker">GOVERNANCE &amp; PATIENT INTEGRITY</span>
          <h4 className="takeover-headline">
            Why Exclusive Admin Takeover Protects Patients
          </h4>
          <p className="takeover-body">
            In our central queue, multiple qualified administrators operate simultaneously. To
            prevent overlapping inquiries, conflicting medical advice, or duplicate hospital visits,
            the system assigns an <strong>exclusive lock</strong> to the administrator who claims the
            patient dossier. Remaining administrators cannot modify or interfere. The claiming admin
            takes personal responsibility: liaising physically with the hospital doctor at MSRUAS,
            recording the doctor&apos;s authoritative clinical opinion, and replying to the questionnaire
            so the field ambassador can convey precise guidance to the patient.
          </p>
        </div>
      </div>
    </div>
  );
}
