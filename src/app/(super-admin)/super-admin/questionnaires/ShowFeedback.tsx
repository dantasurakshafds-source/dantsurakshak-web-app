"use client";

import { Questionnaire } from "@/utils/Types";
import React, { useState } from "react";
import {
  MessageSquare,
  X,
  UserCheck,
  Stethoscope,
  ClipboardList,
  FileText,
  AlertCircle,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  MapPin,
  Heart,
} from "lucide-react";

export const FeedbackButton = ({ el }: { el: Questionnaire }) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const hasFeedbackContent =
    el.questionary_type ||
    el.diagnosis_notes ||
    el.recomanded_actions ||
    el.comments_or_notes;

  const patientIdDisplay = el.case_number
    ? `#${el.case_number}`
    : "QUESTIONNAIRE FEEDBACK";

  return (
    <div style={{ display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setShowFeedback(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 12px",
          backgroundColor: "#f5ebf7",
          color: "#56235E",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "#dfc2e3",
          borderRadius: "6px",
          fontSize: "12.5px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        title="View Patient & Feedback"
      >
        <MessageSquare size={13} />
        <span>View Feedback</span>
      </button>

      {showFeedback && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
          onClick={() => setShowFeedback(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              width: "500px",
              maxWidth: "94vw",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #56235E 0%, #7d3588 100%)",
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#ffffff",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.22)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {patientIdDisplay}
                  </span>
                </div>
                <h3
                  style={{
                    margin: "6px 0 0",
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  Patient & Clinical Feedback
                </h3>
                {el.assignTo && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.88)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <UserCheck size={13} />
                    Assigned: <strong>{el.assignTo.name}</strong>
                    {el.assignTo.phoneNumber && ` (${el.assignTo.phoneNumber})`}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                aria-label="Close"
                style={{
                  background: "rgba(255, 255, 255, 0.18)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#ffffff",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
              >
                <X size={17} />
              </button>
            </div>

            {/* Body */}
            <div
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                maxHeight: "75vh",
                overflowY: "auto",
              }}
            >
              {/* ─── Patient Profile Card ─── */}
              <div
                style={{
                  backgroundColor: "#faf7fb",
                  border: "1px solid #eadbee",
                  borderRadius: "12px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid #ebdfee",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "#56235E",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: 700,
                      }}
                    >
                      {el.name ? el.name.charAt(0).toUpperCase() : <User size={18} />}
                    </div>
                    <div>
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#1f2937",
                        }}
                      >
                        {el.name || "Unknown Patient"}
                      </h4>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#7c3aed",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Patient Profile
                      </span>
                    </div>
                  </div>

                  {el.case_number && (
                    <span
                      style={{
                        fontSize: "11.5px",
                        fontWeight: 600,
                        backgroundColor: "#ffffff",
                        color: "#56235E",
                        border: "1px solid #eadbee",
                        padding: "3px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      #{el.case_number}
                    </span>
                  )}
                </div>

                {/* Details Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "10px 14px",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Calendar size={14} color="#56235E" />
                    <span style={{ color: "#6b7280" }}>Age:</span>
                    <strong style={{ color: "#1f2937" }}>
                      {el.age ? `${el.age} yrs` : "N/A"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <User size={14} color="#56235E" />
                    <span style={{ color: "#6b7280" }}>Gender:</span>
                    <strong style={{ color: "#1f2937", textTransform: "capitalize" }}>
                      {el.gender || "N/A"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Phone size={14} color="#56235E" />
                    <span style={{ color: "#6b7280" }}>Phone:</span>
                    <strong style={{ color: "#1f2937" }}>
                      {el.phoneNumber || "N/A"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Mail size={14} color="#56235E" />
                    <span style={{ color: "#6b7280" }}>Email:</span>
                    <strong
                      style={{
                        color: "#1f2937",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "140px",
                      }}
                      title={el.email || el.submitted_by?.email || "N/A"}
                    >
                      {el.email || el.submitted_by?.email || "N/A"}
                    </strong>
                  </div>

                  {el.cardNumber && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <CreditCard size={14} color="#56235E" />
                      <span style={{ color: "#6b7280" }}>ID Card:</span>
                      <strong style={{ color: "#1f2937" }}>{el.cardNumber}</strong>
                    </div>
                  )}

                  {el.bloodGroup && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Heart size={14} color="#56235E" />
                      <span style={{ color: "#6b7280" }}>Blood:</span>
                      <strong style={{ color: "#1f2937" }}>{el.bloodGroup}</strong>
                    </div>
                  )}

                  {el.address && (
                    <div
                      style={{
                        gridColumn: "1 / -1",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "6px",
                        paddingTop: "6px",
                        borderTop: "1px dashed #eedcee",
                      }}
                    >
                      <MapPin size={14} color="#56235E" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span style={{ color: "#6b7280" }}>Address:</span>
                      <span style={{ color: "#1f2937", lineHeight: 1.4 }}>{el.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Feedback Header Divider ─── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  margin: "4px 0 -4px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    color: "#56235E",
                    textTransform: "uppercase",
                  }}
                >
                  Doctor / Admin Feedback
                </span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e5e7eb" }} />
              </div>

              {/* ─── Feedback Details ─── */}
              {!hasFeedbackContent ? (
                <div
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    backgroundColor: "#f9fafb",
                    borderRadius: "10px",
                    border: "1px dashed #d1d5db",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AlertCircle size={26} color="#9ca3af" />
                  <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                    No clinical feedback recorded for this case yet.
                  </p>
                </div>
              ) : (
                <>
                  {el.questionary_type && (
                    <div
                      style={{
                        backgroundColor: "#f9fafb",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "#e5e7eb",
                        borderRadius: "10px",
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#56235E",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        <ClipboardList size={14} />
                        <span>Questionnaire Type</span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13.5px",
                          color: "#1f2937",
                          lineHeight: 1.5,
                        }}
                      >
                        {el.questionary_type}
                      </p>
                    </div>
                  )}

                  {el.diagnosis_notes && (
                    <div
                      style={{
                        backgroundColor: "#fef2f2",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "#fecaca",
                        borderRadius: "10px",
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#991b1b",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        <Stethoscope size={14} />
                        <span>Diagnosis Notes</span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13.5px",
                          color: "#1f2937",
                          lineHeight: 1.5,
                        }}
                      >
                        {el.diagnosis_notes}
                      </p>
                    </div>
                  )}

                  {el.recomanded_actions && (
                    <div
                      style={{
                        backgroundColor: "#f0fdf4",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "#bbf7d0",
                        borderRadius: "10px",
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#166534",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        <FileText size={14} />
                        <span>Recommended Actions</span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13.5px",
                          color: "#1f2937",
                          lineHeight: 1.5,
                        }}
                      >
                        {el.recomanded_actions}
                      </p>
                    </div>
                  )}

                  {el.comments_or_notes && (
                    <div
                      style={{
                        backgroundColor: "#f8fafc",
                        borderWidth: "1px",
                        borderStyle: "solid",
                        borderColor: "#e2e8f0",
                        borderRadius: "10px",
                        padding: "12px 14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#475569",
                          textTransform: "uppercase",
                          marginBottom: "4px",
                        }}
                      >
                        <MessageSquare size={14} />
                        <span>Comments or Notes</span>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13.5px",
                          color: "#1f2937",
                          lineHeight: 1.5,
                        }}
                      >
                        {el.comments_or_notes}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "12px 22px",
                borderTop: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "flex-end",
                backgroundColor: "#f9fafb",
              }}
            >
              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                style={{
                  padding: "7px 18px",
                  borderRadius: "8px",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "#d1d5db",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
