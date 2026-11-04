"use client";

import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  ClipboardList,
  Info,
  Clock,
  Trash2,
  RefreshCw,
} from "lucide-react";
import OvalLoader from "@/(common)/OvalLoader";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
}

interface ActivityRecord {
  _id: string;
  case_number?: string;
  status: string;
  location?: string;
  createdAt: string;
}

interface VerifiedData {
  user: UserData;
  lesionCount: number;
  questionnaireCount: number;
  recentLesions: ActivityRecord[];
  recentQuestionnaires: ActivityRecord[];
  hasPendingRequest: boolean;
  pendingRequestId?: string;
}

export default function DeleteAccountPage() {
  const [lang, setLang] = useState<"en" | "kn">("en");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reason, setReason] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [verifiedData, setVerifiedData] = useState<VerifiedData | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Phone input: numeric only, strictly maximum 10 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(onlyDigits);
  };

  // Step 1: Verify Email and Phone against DB
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPhone = phoneNumber.trim();

    if (!cleanEmail || !cleanPhone) {
      setErrorMessage(
        lang === "en"
          ? "Please enter both registered Email and Phone Number."
          : "ದಯವಿಟ್ಟು ನೋಂದಾಯಿತ ಇಮೇಲ್ ಮತ್ತು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಎರಡನ್ನೂ ನಮೂದಿಸಿ."
      );
      return;
    }

    if (cleanPhone.length !== 10) {
      setErrorMessage(
        lang === "en"
          ? "Phone number must be exactly 10 digits."
          : "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಸರಿಯಾಗಿ 10 ಅಂಕಿಗಳಾಗಿರಬೇಕು."
      );
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch("/api/account-deletion/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, phoneNumber: cleanPhone }),
      });

      const result = await res.json();
      if (!res.ok) {
        setErrorMessage(
          result.error ||
            (lang === "en"
              ? "Failed to locate account. Please check your credentials."
              : "ಖಾತೆಯನ್ನು ಹುಡುಕಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.")
        );
        return;
      }

      setVerifiedData(result.data);
      if (result.data.hasPendingRequest) {
        setSubmittedRequestId(result.data.pendingRequestId || null);
      }
    } catch (err) {
      console.error("Error during verification:", err);
      setErrorMessage(
        lang === "en"
          ? "Network error occurred. Please try again."
          : "ನೆಟ್‌ವರ್ಕ್ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Step 2: Submit Account Deletion Request
  const handleSubmitRequest = async () => {
    if (!verifiedData) return;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/account-deletion/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verifiedData.user.email,
          phoneNumber: verifiedData.user.phoneNumber,
          reason,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setErrorMessage(result.error || "Failed to submit deletion request.");
        setShowConfirmModal(false);
        return;
      }

      setSubmittedRequestId(result.requestId);
      setIsCompleted(true);
      setShowConfirmModal(false);
    } catch (err) {
      console.error("Error submitting deletion request:", err);
      setErrorMessage("Network error. Could not submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setPhoneNumber("");
    setReason("");
    setVerifiedData(null);
    setSubmittedRequestId(null);
    setIsCompleted(false);
    setErrorMessage(null);
  };

  return (
    <div className="delete-account-page">
      {/* Hero Banner: Heading on Left, Language Switcher on Right (space-between) */}
      <section className="da-hero">
        <div className="da-hero-inner">
          <div className="da-hero-left">
            
            <h1 className="da-title">
              {lang === "en"
                ? "Account & Data Deletion Portal"
                : "ಖಾತೆ ಮತ್ತು ಡೇಟಾ ಅಳಿಸುವಿಕೆ ಪೋರ್ಟಲ್"}
            </h1>
            <p className="da-subtitle">
              {lang === "en" ? (
                <>
                  In compliance with Google Play Store developer policy, users of the{" "}
                  <strong>Danta Surakshak</strong> mobile app may request permanent deletion of
                  their registered account and all associated personal health data.
                </>
              ) : (
                <>
                  ಗೂಗಲ್ ಪ್ಲೇ ಸ್ಟೋರ್ ಡೆವಲಪರ್ ನೀತಿಯ ಪ್ರಕಾರ,{" "}
                  <strong>ದಂತ ಸುರಕ್ಷಕ್</strong> ಮೊಬೈಲ್ ಆಪ್ ಬಳಕೆದಾರರು ತಮ್ಮ ನೋಂದಾಯಿತ ಖಾತೆ ಮತ್ತು
                  ಎಲ್ಲಾ ವೈಯಕ್ತಿಕ ಆರೋಗ್ಯ ಡೇಟಾವನ್ನು ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲು ವಿನಂತಿಸಬಹುದು.
                </>
              )}
            </p>
          </div>

          <div className="da-hero-right">
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

      {/* Main Container */}
      <main className="da-body-container">
        {errorMessage && (
          <div className="da-alert-error">
            <AlertTriangle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: VERIFICATION FORM (Two Column Grid) */}
        {!verifiedData && !isCompleted && (
          <div className="da-two-col-grid">
            {/* Left Column: Form Card */}
            <div className="da-card">
              <h2 className="card-heading">
                <Search size={20} />
                {lang === "en"
                  ? "Find & Verify Your Account"
                  : "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಹುಡುಕಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿ"}
              </h2>
              <p className="card-desc">
                {lang === "en"
                  ? "Enter your registered email address and 10-digit phone number used during registration in the Danta Surakshak mobile app to view your account details."
                  : "ನಿಮ್ಮ ಖಾತೆಯ ವಿವರಗಳನ್ನು ನೋಡಲು ದಂತ ಸುರಕ್ಷಕ್ ಮೊಬೈಲ್ ಆಪ್‌ನಲ್ಲಿ ನೋಂದಾಯಿಸಿದ ಇಮೇಲ್ ಮತ್ತು 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ."}
              </p>

              <form onSubmit={handleVerify} className="da-form">
                <div className="form-group">
                  <label>
                    <Mail size={15} />
                    {lang === "en" ? "Registered Email Address" : "ನೋಂದಾಯಿತ ಇಮೇಲ್ ವಿಳಾಸ"}{" "}
                    <span className="req">*</span>
                  </label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <Phone size={15} />
                    {lang === "en"
                      ? "Registered Phone Number (10 Digits)"
                      : "ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (10 ಅಂಕಿಗಳು)"}{" "}
                    <span className="req">*</span>
                  </label>
                  <div className="input-wrapper">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      maxLength={10}
                      pattern="[0-9]{10}"
                      placeholder="e.g. 9876543210"
                      required
                    />
                  </div>
                  <span style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                    {lang === "en"
                      ? `${phoneNumber.length}/10 digits entered`
                      : `${phoneNumber.length}/10 ಅಂಕಿಗಳನ್ನು ನಮೂದಿಸಲಾಗಿದೆ`}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="btn-primary-gradient"
                  style={{ marginTop: "8px" }}
                >
                  {isVerifying ? (
                    <>
                      <OvalLoader height="18" width="18" color="#ffffff" ariaLabel="verifying" />
                      <span>{lang === "en" ? "Checking Records..." : "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..."}</span>
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      <span>
                        {lang === "en"
                          ? "Verify & Locate Account"
                          : "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಖಾತೆಯನ್ನು ಹುಡುಕಿ"}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Guide & Data Deletion Info Card */}
            <div className="da-guide-card">
              <h3 className="guide-title">
                <Info size={18} />
                {lang === "en"
                  ? "How Account Deletion Works"
                  : "ಖಾತೆ ಅಳಿಸುವಿಕೆ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ"}
              </h3>

              <div className="guide-steps">
                <div className="step-item">
                  <span className="step-num">1</span>
                  <div className="step-text">
                    <strong>{lang === "en" ? "Locate Account:" : "ಖಾತೆಯನ್ನು ಹುಡುಕಿ:"}</strong>
                    {lang === "en"
                      ? "Provide your credentials to match your account records securely in our database."
                      : "ನಮ್ಮ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಖಾತೆಯ ದಾಖಲೆಗಳನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ಹೊಂದಿಸಲು ವಿವರಗಳನ್ನು ಒದಗಿಸಿ."}
                  </div>
                </div>

                <div className="step-item">
                  <span className="step-num">2</span>
                  <div className="step-text">
                    <strong>
                      {lang === "en"
                        ? "Review Associated Data:"
                        : "ಸಂಬಂಧಿತ ಡೇಟಾವನ್ನು ಪರಿಶೀಲಿಸಿ:"}
                    </strong>
                    {lang === "en"
                      ? "Verify your linked screening cases, questionnaires, and profile information."
                      : "ನಿಮ್ಮ ಲಿಂಕ್ ಮಾಡಲಾದ ತಪಾಸಣೆ ಕೇಸ್‌ಗಳು, ಪ್ರಶ್ನಾವಳಿಗಳು ಮತ್ತು ಪ್ರೊಫೈಲ್ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ."}
                  </div>
                </div>

                <div className="step-item">
                  <span className="step-num">3</span>
                  <div className="step-text">
                    <strong>{lang === "en" ? "Submit Request:" : "ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಿ:"}</strong>
                    {lang === "en"
                      ? "Your request enters the Super Admin review queue for permanent erasure."
                      : "ಶಾಶ್ವತ ಅಳಿಸುವಿಕೆಗಾಗಿ ನಿಮ್ಮ ವಿನಂತಿಯು ಸೂಪರ್ ಅಡ್ಮಿನ್ ಪರಿಶೀಲನಾ ಸರದಿಯನ್ನು ಪ್ರವೇಶಿಸುತ್ತದೆ."}
                  </div>
                </div>
              </div>

              <div className="erased-list-title">
                {lang === "en"
                  ? "Data That Will Be Permanently Erased:"
                  : "ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಲಾಗುವ ಡೇಟಾ:"}
              </div>
              <ul className="erased-list">
                <li>
                  <CheckCircle2 size={16} />{" "}
                  {lang === "en"
                    ? "User credentials, name, email & phone number"
                    : "ಬಳಕೆದಾರ ರುಜುವಾತುಗಳು, ಹೆಸರು, ಇಮೇಲ್ ಮತ್ತು ಮೊಬೈಲ್ ಸಂಖ್ಯೆ"}
                </li>
                <li>
                  <CheckCircle2 size={16} />{" "}
                  {lang === "en"
                    ? "Oral lesion clinical photo records & submissions"
                    : "ಬಾಯಿಯ ಲೆಸಿಯಾನ್ ಕ್ಲಿನಿಕಲ್ ಫೋಟೋ ದಾಖಲೆಗಳು ಮತ್ತು ಸಲ್ಲಿಕೆಗಳು"}
                </li>
                <li>
                  <CheckCircle2 size={16} />{" "}
                  {lang === "en"
                    ? "Oral health risk assessment questionnaire answers"
                    : "ಮೌಖಿಕ ಆರೋಗ್ಯ ಅಪಾಯ ಮೌಲ್ಯಮಾಪನ ಪ್ರಶ್ನಾವಳಿ ಉತ್ತರಗಳು"}
                </li>
                <li>
                  <CheckCircle2 size={16} />{" "}
                  {lang === "en"
                    ? "Push notification tokens & app session tokens"
                    : "ಪುಶ್ ಅಧಿಸೂಚನೆ ಟೋಕನ್‌ಗಳು ಮತ್ತು ಅಪ್ಲಿಕೇಶನ್ ಸೆಷನ್ ಟೋಕನ್‌ಗಳು"}
                </li>
              </ul>

              <p className="contact-note">
                {lang === "en"
                  ? "For urgent inquiries, contact the Faculty of Dental Sciences, MSRUAS support team."
                  : "ತುರ್ತು ವಿಚಾರಣೆಗಳಿಗಾಗಿ, ಡೆಂಟಲ್ ಸೈನ್ಸಸ್ ಫ್ಯಾಕಲ್ಟಿ, MSRUAS ಬೆಂಬಲ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ."}
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: ACCOUNT FOUND & SHOW ASSOCIATED RECORDS */}
        {verifiedData && !isCompleted && (
          <div className="da-account-container">
            {/* If deletion request already exists */}
            {verifiedData.hasPendingRequest && (
              <div className="da-alert-warning">
                <Clock size={20} />
                <div>
                  <strong style={{ display: "block", marginBottom: "4px" }}>
                    {lang === "en"
                      ? "Deletion Request Already Pending"
                      : "ಅಳಿಸುವಿಕೆ ವಿನಂತಿ ಈಗಾಗಲೇ ಬಾಕಿ ಉಳಿದಿದೆ"}
                  </strong>
                  <span>
                    {lang === "en"
                      ? "A deletion request for this account has already been submitted and is currently under Super Admin review."
                      : "ಈ ಖಾತೆಗೆ ಅಳಿಸುವಿಕೆಯ ವಿನಂತಿಯನ್ನು ಈಗಾಗಲೇ ಸಲ್ಲಿಸಲಾಗಿದೆ ಮತ್ತು ಪ್ರಸ್ತುತ ಸೂಪರ್ ಅಡ್ಮಿನ್ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ."}
                    {submittedRequestId && ` (Request Reference: #${submittedRequestId.slice(-8)})`}
                  </span>
                </div>
              </div>
            )}

            {/* User Profile Overview Card */}
            <div className="da-user-profile-banner">
              <div className="profile-left">
                <div className="profile-avatar">
                  <User size={28} />
                </div>
                <div className="profile-info">
                  <h3 className="profile-name">
                    <span>{verifiedData.user.name}</span>
                    <span className="role-badge">{verifiedData.user.role}</span>
                  </h3>
                  <div className="profile-meta-row">
                    <span>
                      <Mail size={14} />
                      {verifiedData.user.email}
                    </span>
                    <span>
                      <Phone size={14} />
                      {verifiedData.user.phoneNumber || "Not provided"}
                    </span>
                    <span>
                      <Calendar size={14} />
                      {lang === "en" ? "Member since: " : "ಸದಸ್ಯತ್ವ ದಿನಾಂಕ: "}
                      {new Date(verifiedData.user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Associated Data Statistics Grid */}
            <div className="da-stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <ClipboardList size={26} />
                </div>
                <div className="stat-data">
                  <div className="stat-value">{verifiedData.lesionCount}</div>
                  <div className="stat-title">
                    {lang === "en"
                      ? "Dental Lesion Screening Records"
                      : "ದಂತ ತಪಾಸಣೆ ದಾಖಲೆಗಳು"}
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FileText size={26} />
                </div>
                <div className="stat-data">
                  <div className="stat-value">{verifiedData.questionnaireCount}</div>
                  <div className="stat-title">
                    {lang === "en"
                      ? "Oral Health Risk Questionnaires"
                      : "ಮೌಖಿಕ ಆರೋಗ್ಯ ಪ್ರಶ್ನಾವಳಿಗಳು"}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Screenings Preview if available */}
            {verifiedData.recentLesions && verifiedData.recentLesions.length > 0 && (
              <div className="da-records-card">
                <div className="records-header">
                  <span>
                    {lang === "en"
                      ? "Recent Dental Lesion Submissions"
                      : "ಇತ್ತೀಚಿನ ದಂತ ತಪಾಸಣೆ ಸಲ್ಲಿಕೆಗಳು"}
                  </span>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    {verifiedData.recentLesions.length} record(s) listed
                  </span>
                </div>
                <div className="records-list">
                  {verifiedData.recentLesions.map((item) => (
                    <div key={item._id} className="record-row">
                      <span className="case-tag">
                        <ClipboardList size={15} color="#56235E" />
                        Case #{item.case_number || item._id.slice(-6)}
                      </span>
                      <span className="status-pill">{item.status}</span>
                      <span className="date-text">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Reason for Deletion */}
            {!verifiedData.hasPendingRequest && (
              <div className="da-card">
                <h3 className="card-heading" style={{ fontSize: "16px", marginBottom: "8px" }}>
                  {lang === "en"
                    ? "Reason for Account Deletion (Optional)"
                    : "ಖಾತೆ ಅಳಿಸುವಿಕೆಗೆ ಕಾರಣ (ಐಚ್ಛಿಕ)"}
                </h3>
                <p className="card-desc" style={{ marginBottom: "14px" }}>
                  {lang === "en"
                    ? "Please let us know why you wish to delete your account to help us improve our services."
                    : "ನಮ್ಮ ಸೇವೆಗಳನ್ನು ಸುಧಾರಿಸಲು ನೀವು ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಏಕೆ ಅಳಿಸಲು ಬಯಸುತ್ತೀರಿ ಎಂದು ನಮಗೆ ತಿಳಿಸಿ."}
                </p>
                <div className="da-form">
                  <div className="form-group">
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={
                        lang === "en"
                          ? "Write your reason here (optional)..."
                          : "ನಿಮ್ಮ ಕಾರಣವನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ (ಐಚ್ಛಿಕ)..."
                      }
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons Row */}
            <div className="da-actions-row">
              <button type="button" onClick={handleReset} className="btn-secondary">
                <RefreshCw size={16} />
                <span>
                  {lang === "en" ? "Check Another Account" : "ಮತ್ತೊಂದು ಖಾತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ"}
                </span>
              </button>

              {!verifiedData.hasPendingRequest && (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="btn-danger"
                >
                  <Trash2 size={16} />
                  <span>
                    {lang === "en"
                      ? "Request Account Deletion"
                      : "ಖಾತೆ ಅಳಿಸುವಿಕೆಗೆ ವಿನಂತಿಸಿ"}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETED SUCCESS SCREEN */}
        {isCompleted && (
          <div className="da-success-card">
            <div className="success-icon-bubble">
              <CheckCircle2 size={44} />
            </div>
            <h2 className="success-heading">
              {lang === "en"
                ? "Account Deletion Request Submitted"
                : "ಖಾತೆ ಅಳಿಸುವಿಕೆಯ ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ"}
            </h2>
            <p className="success-desc">
              {lang === "en"
                ? "Your request has been successfully recorded. Our Super Admin team will review and permanently erase your account, lesion records, questionnaire responses, and uploaded data in accordance with institutional guidelines and Google Play developer policy."
                : "ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ದಾಖಲಿಸಲಾಗಿದೆ. ನಮ್ಮ ಸೂಪರ್ ಅಡ್ಮಿನ್ ತಂಡವು ಸಂಸ್ಥೆಯ ಮಾರ್ಗಸೂಚಿಗಳು ಮತ್ತು ಗೂಗಲ್ ಪ್ಲೇ ಡೆವಲಪರ್ ನೀತಿಯ ಪ್ರಕಾರ ನಿಮ್ಮ ಖಾತೆ, ದಾಖಲೆಗಳು ಮತ್ತು ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಡೇಟಾವನ್ನು ಪರಿಶೀಲಿಸಿ ಶಾಶ್ವತವಾಗಿ ಅಳಿಸುತ್ತದೆ."}
            </p>

            {submittedRequestId && (
              <div className="reference-box">
                <span className="ref-label">
                  {lang === "en" ? "Request Reference ID" : "ವಿನಂತಿ ಉಲ್ಲೇಖ ಐಡಿ"}
                </span>
                <span className="ref-id">#{submittedRequestId}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button type="button" onClick={handleReset} className="btn-primary-gradient">
                <span>
                  {lang === "en" ? "Submit Another Request" : "ಮತ್ತೊಂದು ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಿ"}
                </span>
              </button>
            </div>
          </div>
        )}

       
      </main>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="da-modal-overlay">
          <div className="da-modal-card">
            <div className="modal-icon-bubble">
              <AlertTriangle size={30} />
            </div>
            <h3 className="modal-title">
              {lang === "en"
                ? "Confirm Account Deletion Request"
                : "ಖಾತೆ ಅಳಿಸುವಿಕೆಯ ವಿನಂತಿಯನ್ನು ದೃಢೀಕರಿಸಿ"}
            </h3>
            <p className="modal-message">
              {lang === "en" ? (
                <>
                  Are you sure you want to request deletion of your account (
                  <strong>{verifiedData?.user.email}</strong>)? This will forward a permanent deletion
                  order to the Super Admin to remove your profile and all linked dental screening records.
                </>
              ) : (
                <>
                  ನಿಮ್ಮ ಖಾತೆಯನ್ನು (<strong>{verifiedData?.user.email}</strong>) ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ
                  ಬಯಸುವಿರಾ? ಇದು ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಎಲ್ಲಾ ಲಿಂಕ್ ಮಾಡಲಾದ ದಾಖಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಲು ಸೂಪರ್ ಅಡ್ಮಿನ್‌ಗೆ
                  ಶಾಶ್ವತ ಅಳಿಸುವಿಕೆ ಆದೇಶವನ್ನು ರವಾನಿಸುತ್ತದೆ.
                </>
              )}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary"
              >
                {lang === "en" ? "Cancel" : "ರದ್ದುಮಾಡಿ"}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitRequest}
                className="btn-danger"
              >
                {isSubmitting ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <OvalLoader height="16" width="16" color="#ffffff" ariaLabel="submitting" />
                    <span>{lang === "en" ? "Submitting..." : "ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ..."}</span>
                  </span>
                ) : lang === "en" ? (
                  "Yes, Submit Request"
                ) : (
                  "ಹೌದು, ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಿ"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
