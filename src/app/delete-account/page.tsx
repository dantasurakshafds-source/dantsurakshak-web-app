"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import sidebarLogo from '@/images/danta-suraksha-logo.png';
import {
  ShieldAlert,
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
} from 'lucide-react';
import OvalLoader from '@/(common)/OvalLoader';

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
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [reason, setReason] = useState('');

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [verifiedData, setVerifiedData] = useState<VerifiedData | null>(null);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Step 1: Match Email and Phone in DB
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !phoneNumber.trim()) {
      setErrorMessage('Please enter both registered Email and Phone Number.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/account-deletion/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phoneNumber: phoneNumber.trim() }),
      });

      const result = await res.json();
      if (!res.ok) {
        setErrorMessage(result.error || 'Failed to match account. Please check your credentials.');
        return;
      }

      setVerifiedData(result.data);
      if (result.data.hasPendingRequest) {
        setSubmittedRequestId(result.data.pendingRequestId || null);
      }
    } catch (err) {
      console.error('Error during verification:', err);
      setErrorMessage('Network error occurred. Please try again.');
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
      const res = await fetch('/api/account-deletion/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verifiedData.user.email,
          phoneNumber: verifiedData.user.phoneNumber,
          reason,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setErrorMessage(result.error || 'Failed to submit deletion request.');
        setShowConfirmModal(false);
        return;
      }

      setSubmittedRequestId(result.requestId);
      setIsCompleted(true);
      setShowConfirmModal(false);
    } catch (err) {
      console.error('Error submitting deletion request:', err);
      setErrorMessage('Network error. Could not submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setEmail('');
    setPhoneNumber('');
    setReason('');
    setVerifiedData(null);
    setSubmittedRequestId(null);
    setIsCompleted(false);
    setErrorMessage(null);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.brandGroup}>
            <Image
              src={sidebarLogo.src}
              alt="Danta Surakshak Logo"
              width={180}
              height={50}
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <span style={styles.policyBadge}>
            <ShieldAlert size={14} style={{ marginRight: '6px' }} />
            Google Play Account Deletion Policy
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main style={styles.mainWrapper}>
        <div style={styles.card}>
          {/* Card Title & Policy Notice */}
          <div style={styles.cardHeader}>
            <h1 style={styles.pageTitle}>Account & Data Deletion Request</h1>
            <p style={styles.subtitle}>
              In compliance with Google Play Store developer policy, users of the <strong>Danta Surakshak</strong> mobile app may request permanent deletion of their account and all associated personal health data.
            </p>
          </div>

          {errorMessage && (
            <div style={styles.errorBox}>
              <AlertTriangle size={20} color="#b91c1c" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '14px', color: '#991b1b', lineHeight: '1.4' }}>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: VERIFICATION FORM */}
          {!verifiedData && !isCompleted && (
            <div>
              <div style={styles.noticeBox}>
                <Info size={18} color="#56235e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '13.5px', color: '#4b1e52', lineHeight: '1.5' }}>
                  <strong>How it works:</strong> Enter your registered email address and phone number used during registration in the Danta Surakshak app. Our system will locate your account and show you all associated records before you confirm deletion.
                </div>
              </div>

              <form onSubmit={handleVerify} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Mail size={16} style={{ marginRight: '8px', color: '#56235E' }} />
                    Registered Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@example.com"
                    required
                    style={styles.input}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>
                    <Phone size={16} style={{ marginRight: '8px', color: '#56235E' }} />
                    Registered Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    required
                    style={styles.input}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  style={{
                    ...styles.primaryButton,
                    opacity: isVerifying ? 0.7 : 1,
                  }}
                >
                  {isVerifying ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <OvalLoader height="18" width="18" color="#ffffff" ariaLabel="verifying" />
                      <span>Checking Records...</span>
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <Search size={18} />
                      <span>Verify & Find My Account</span>
                    </span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: ACCOUNT FOUND & SHOW ASSOCIATED HISTORY */}
          {verifiedData && !isCompleted && (
            <div>
              {/* If request is already pending */}
              {verifiedData.hasPendingRequest && (
                <div style={styles.warningPendingBox}>
                  <Clock size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ display: 'block', color: '#92400e', marginBottom: '4px' }}>
                      Deletion Request Already Pending
                    </strong>
                    <span style={{ fontSize: '13.5px', color: '#78350f' }}>
                      A deletion request for this account has already been submitted and is currently in the Super Admin review queue.
                      {submittedRequestId && ` (Request Reference: #${submittedRequestId.slice(-8)})`}
                    </span>
                  </div>
                </div>
              )}

              {/* User Profile Summary */}
              <div style={styles.profileCard}>
                <div style={styles.profileHeader}>
                  <div style={styles.avatar}>
                    <User size={24} color="#56235E" />
                  </div>
                  <div>
                    <h3 style={styles.profileName}>{verifiedData.user.name}</h3>
                    <span style={styles.profileBadge}>{verifiedData.user.role.toUpperCase()}</span>
                  </div>
                </div>

                <div style={styles.profileGrid}>
                  <div style={styles.profileItem}>
                    <Mail size={15} color="#666" />
                    <span>{verifiedData.user.email}</span>
                  </div>
                  <div style={styles.profileItem}>
                    <Phone size={15} color="#666" />
                    <span>{verifiedData.user.phoneNumber || 'Not provided'}</span>
                  </div>
                  <div style={styles.profileItem}>
                    <Calendar size={15} color="#666" />
                    <span>Member since: {new Date(verifiedData.user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Related Activities & Records to be Deleted */}
              <div style={styles.activitySection}>
                <h3 style={styles.sectionTitle}>
                  Associated Data That Will Be Permanently Deleted
                </h3>
                <p style={styles.sectionSubtitle}>
                  The following records are linked to your profile and will be deleted upon admin approval:
                </p>

                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <div style={styles.statIconWrapper}>
                      <ClipboardList size={22} color="#56235E" />
                    </div>
                    <div>
                      <div style={styles.statNumber}>{verifiedData.lesionCount}</div>
                      <div style={styles.statLabel}>Dental Lesion Screening Records</div>
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={styles.statIconWrapper}>
                      <FileText size={22} color="#56235E" />
                    </div>
                    <div>
                      <div style={styles.statNumber}>{verifiedData.questionnaireCount}</div>
                      <div style={styles.statLabel}>Oral Health Questionnaires</div>
                    </div>
                  </div>
                </div>

                {/* Recent Lesion Cases Preview */}
                {verifiedData.recentLesions && verifiedData.recentLesions.length > 0 && (
                  <div style={styles.recordsPreview}>
                    <div style={styles.previewTitle}>Recent Dental Lesion Submissions:</div>
                    <ul style={styles.recordsList}>
                      {verifiedData.recentLesions.map((item) => (
                        <li key={item._id} style={styles.recordItem}>
                          <span>Case #{item.case_number || item._id.slice(-6)}</span>
                          <span style={styles.recordStatusBadge}>{item.status}</span>
                          <span style={styles.recordDate}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Optional Reason */}
              {!verifiedData.hasPendingRequest && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Reason for Deletion (Optional):</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Let us know why you wish to delete your account (optional)..."
                    rows={3}
                    style={styles.textarea}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div style={styles.actionButtonsRow}>
                <button
                  type="button"
                  onClick={handleReset}
                  style={styles.secondaryButton}
                >
                  <RefreshCw size={16} />
                  Check Another Account
                </button>

                {!verifiedData.hasPendingRequest && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    style={styles.dangerButton}
                  >
                    <Trash2 size={16} />
                    Request Account Deletion
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: COMPLETED CONFIRMATION */}
          {isCompleted && (
            <div style={styles.successWrapper}>
              <div style={styles.successIconWrapper}>
                <CheckCircle2 size={54} color="#16a34a" />
              </div>
              <h2 style={styles.successTitle}>Account Deletion Request Submitted</h2>
              <p style={styles.successText}>
                Your request has been successfully recorded. Our Super Admin team will review and permanently delete your account, screening records, and all associated personal data in accordance with our data retention guidelines.
              </p>

              {submittedRequestId && (
                <div style={styles.requestIdBox}>
                  <span style={{ fontSize: '13px', color: '#666' }}>Request Reference ID:</span>
                  <strong style={{ fontSize: '16px', color: '#1f2937', fontFamily: 'monospace' }}>
                    {submittedRequestId}
                  </strong>
                </div>
              )}

              <div style={styles.actionButtonsRow}>
                <button type="button" onClick={handleReset} style={styles.primaryButton}>
                  Submit Another Request
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Retention & Privacy Policy Accordion Note */}
        <div style={styles.policyFooterNote}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#374151' }}>
            Data Deletion Policy Details
          </h4>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#6b7280', lineHeight: '1.6' }}>
            Upon Super Admin execution of the deletion request, the following records are permanently erased:
            user account credentials, name, email, phone number, submitted lesion cases, clinical photos uploaded to cloud storage, oral health risk questionnaires, and push notification tokens. If you have questions, please contact our support team.
          </p>
        </div>
      </main>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalIcon}>
              <AlertTriangle size={32} color="#dc2626" />
            </div>
            <h3 style={styles.modalTitle}>Confirm Account Deletion Request</h3>
            <p style={styles.modalText}>
              Are you sure you want to request deletion of your account (<strong>{verifiedData?.user.email}</strong>)?
              This will forward a permanent deletion order to the Super Admin to remove your profile and all linked dental records.
            </p>
            <div style={styles.modalActions}>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmModal(false)}
                style={styles.modalCancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitRequest}
                style={styles.modalConfirmBtn}
              >
                {isSubmitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <OvalLoader height="16" width="16" color="#ffffff" ariaLabel="submitting" />
                    <span>Submitting...</span>
                  </span>
                ) : (
                  'Yes, Submit Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: '"Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#1f2937',
    paddingBottom: '40px',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
    maxWidth: '850px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  policyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 600,
    backgroundColor: '#f3e8ff',
    color: '#6b21a8',
    padding: '6px 12px',
    borderRadius: '20px',
  },
  mainWrapper: {
    maxWidth: '750px',
    margin: '36px auto 0 auto',
    padding: '0 20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '36px 32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
    border: '1px solid #f0f0f0',
  },
  cardHeader: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#56235E',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    margin: 0,
  },
  noticeBox: {
    display: 'flex',
    gap: '12px',
    backgroundColor: '#faf5ff',
    border: '1px solid #e9d5ff',
    borderRadius: '10px',
    padding: '14px 16px',
    marginBottom: '24px',
  },
  warningPendingBox: {
    display: 'flex',
    gap: '12px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '10px',
    padding: '14px 16px',
    marginBottom: '20px',
  },
  errorBox: {
    display: 'flex',
    gap: '12px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '14px 16px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14.5px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  primaryButton: {
    backgroundColor: '#56235E',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    padding: '12px 18px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  profileCard: {
    backgroundColor: '#fbf7fc',
    border: '1px solid #ecd9ee',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
  },
  avatar: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: '#eedcf0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: 700,
    color: '#1f2937',
  },
  profileBadge: {
    fontSize: '11px',
    fontWeight: 700,
    backgroundColor: '#56235E',
    color: '#ffffff',
    padding: '3px 8px',
    borderRadius: '12px',
    letterSpacing: '0.5px',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '10px',
    fontSize: '13.5px',
    color: '#4b5563',
  },
  profileItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  activitySection: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1f2937',
    margin: '0 0 6px 0',
  },
  sectionSubtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 14px 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    marginBottom: '18px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
  },
  statIconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '8px',
    backgroundColor: '#f3e8ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statNumber: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#56235E',
  },
  statLabel: {
    fontSize: '12.5px',
    color: '#6b7280',
  },
  recordsPreview: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px 16px',
  },
  previewTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '8px',
  },
  recordsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  recordItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '13px',
  },
  recordStatusBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '10px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    textTransform: 'capitalize',
  },
  recordDate: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  actionButtonsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '20px',
  },
  successWrapper: {
    textAlign: 'center',
    padding: '20px 10px',
  },
  successIconWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#dcfce7',
    marginBottom: '16px',
  },
  successTitle: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#15803d',
    margin: '0 0 10px 0',
  },
  successText: {
    fontSize: '14.5px',
    color: '#4b5563',
    lineHeight: '1.6',
    maxWidth: '540px',
    margin: '0 auto 20px auto',
  },
  requestIdBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '12px 18px',
    display: 'inline-flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '24px',
  },
  policyFooterNote: {
    marginTop: '24px',
    padding: '18px 20px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    maxWidth: '480px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 10px 0',
  },
  modalText: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.5',
    margin: '0 0 24px 0',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
  },
  modalCancelBtn: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: '#374151',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
  },
  modalConfirmBtn: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
  },
};
