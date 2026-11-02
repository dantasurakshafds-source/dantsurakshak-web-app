"use client";

import React, { useEffect, useState } from "react";
import Loader from "@/(common)/Loader";
import ReusableModal from "@/(common)/Model";
import {
  useGetAccountDeletionRequestsQuery,
  useDeleteUserAndRecordsMutation,
  useRejectAccountDeletionRequestMutation,
} from "@/(store)/services/account-deletion/accountDeletionApi";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { toast } from "sonner";
import {
  UserX,
  Trash2,
  Eye,
  XCircle,
  Clock,
  CheckCircle2,
  ClipboardList,
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  X,
} from "lucide-react";

interface RelationRecord {
  case_number?: string;
  fullname?: string;
  contact_number?: string;
  location?: string;
  status: string;
  createdAt: string;
}

interface RequestDetailModalData {
  requestId: string;
  name: string;
  email: string;
  phoneNumber: string;
  reason?: string;
  status: string;
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
  userExists: boolean;
  lesionCount: number;
  questionnaireCount: number;
  lesions: RelationRecord[];
  questionnaires: RelationRecord[];
  notificationsCount: number;
}

export default function AccountDeletionRequestsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  // Query requests
  const { data, isLoading, refetch } = useGetAccountDeletionRequestsQuery({
    page,
    limit: PAGE_PER_ITEMS,
    status: statusFilter,
  });

  // Mutations
  const [deleteUserAndRecords, { isLoading: isDeleting }] = useDeleteUserAndRecordsMutation();
  const [rejectRequest, { isLoading: isRejecting }] = useRejectAccountDeletionRequestMutation();

  // Modals state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [modalDetails, setModalDetails] = useState<RequestDetailModalData | null>(null);

  // Set Right Header content in Super Admin layout
  const { setRightContent } = useBreadcrumb();
  useEffect(() => {
    if (!data) return;
    setRightContent(
      <div className="total-count-wrapper">
        <i>
          <UserX size={18} color="#56235E" />
        </i>
        <span className="total-count">
          {data.counts.pending} Pending Deletions
        </span>
      </div>
    );
    return () => setRightContent(null);
  }, [data, setRightContent]);

  // Handle open delete confirm modal
  const handleOpenDeleteModal = (id: string, name: string) => {
    setSelectedRequestId(id);
    setSelectedUserName(name);
    setDeleteModalOpen(true);
  };

  // Execute cascade delete
  const handleConfirmDelete = async () => {
    if (!selectedRequestId) return;
    try {
      const res = await deleteUserAndRecords(selectedRequestId).unwrap();
      toast.success(res.message || "User and associated records deleted permanently!");
      setDeleteModalOpen(false);
      setSelectedRequestId(null);
      refetch();
    } catch (err: unknown) {
      console.error("Error deleting user:", err);
      const errorMsg =
        (err as { data?: { error?: string } })?.data?.error ||
        "Failed to delete user and records.";
      toast.error(errorMsg);
    }
  };

  // Handle open reject modal
  const handleOpenRejectModal = (id: string, name: string) => {
    setSelectedRequestId(id);
    setSelectedUserName(name);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  // Execute reject/cancel request
  const handleConfirmReject = async () => {
    if (!selectedRequestId) return;
    try {
      await rejectRequest({
        id: selectedRequestId,
        rejectionReason: rejectReason || "Request declined by super admin",
      }).unwrap();
      toast.success("Deletion request has been rejected/cancelled.");
      setRejectModalOpen(false);
      setSelectedRequestId(null);
      refetch();
    } catch (err: unknown) {
      console.error("Error rejecting request:", err);
      const errorMsg =
        (err as { data?: { error?: string } })?.data?.error ||
        "Failed to reject request.";
      toast.error(errorMsg);
    }
  };

  // Open Details Modal and fetch related records
  const handleOpenDetails = async (id: string) => {
    setDetailsLoading(true);
    setDetailsModalOpen(true);
    setModalDetails(null);

    try {
      const res = await fetch(`/api/account-deletion/admin/${id}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setModalDetails({
          requestId: json.request._id,
          name: json.request.name,
          email: json.request.email,
          phoneNumber: json.request.phoneNumber,
          reason: json.request.reason,
          status: json.request.status,
          requestedAt: json.request.requestedAt,
          processedAt: json.request.processedAt,
          rejectionReason: json.request.rejectionReason,
          userExists: json.userExists,
          lesionCount: json.relations.lesionCount,
          questionnaireCount: json.relations.questionnaireCount,
          lesions: json.relations.lesions || [],
          questionnaires: json.relations.questionnaires || [],
          notificationsCount: json.relations.notificationsCount || 0,
        });
      } else {
        toast.error(json.error || "Failed to load request details.");
        setDetailsModalOpen(false);
      }
    } catch (err) {
      console.error("Error fetching request details:", err);
      toast.error("Could not load details.");
      setDetailsModalOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  if (isLoading && !data) return <Loader />;

  const totalResults = data?.total ?? 0;
  const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);
  const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

  return (
    <div className="ambassa_outer outer_wrapper">
      <div className="ambassa_inner">
        {/* Header & Filter Tabs */}
        <div style={customStyles.topHeaderBar}>
          <div>
            <h2 style={customStyles.headingTitle}>User Account Deletion Requests</h2>
            <p style={customStyles.headingSubtitle}>
              Manage user deletion requests submitted via the Google Play compliance web portal.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={customStyles.filterPillsContainer}>
            <button
              onClick={() => {
                setStatusFilter("pending");
                setPage(1);
              }}
              style={{
                ...customStyles.filterPill,
                ...(statusFilter === "pending" ? customStyles.filterPillActive : {}),
              }}
            >
              <Clock size={14} />
              Pending ({data?.counts?.pending ?? 0})
            </button>
            <button
              onClick={() => {
                setStatusFilter("completed");
                setPage(1);
              }}
              style={{
                ...customStyles.filterPill,
                ...(statusFilter === "completed" ? customStyles.filterPillActive : {}),
              }}
            >
              <CheckCircle2 size={14} />
              Completed ({data?.counts?.completed ?? 0})
            </button>
            <button
              onClick={() => {
                setStatusFilter("rejected");
                setPage(1);
              }}
              style={{
                ...customStyles.filterPill,
                ...(statusFilter === "rejected" ? customStyles.filterPillActive : {}),
              }}
            >
              <XCircle size={14} />
              Rejected ({data?.counts?.rejected ?? 0})
            </button>
            <button
              onClick={() => {
                setStatusFilter("all");
                setPage(1);
              }}
              style={{
                ...customStyles.filterPill,
                ...(statusFilter === "all" ? customStyles.filterPillActive : {}),
              }}
            >
              All ({data?.counts?.total ?? 0})
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="ambassa_wrapper">
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>S.N.</th>
                  <th>User Details</th>
                  <th>Phone</th>
                  <th>Linked Records</th>
                  <th>Reason</th>
                  <th>Requested Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.requests && data.requests.length > 0 ? (
                  data.requests.map((ele, index) => {
                    const statusClass =
                      ele.status === "completed"
                        ? "approved"
                        : ele.status === "rejected"
                        ? "rejected"
                        : "pending";

                    return (
                      <tr key={ele._id}>
                        <td>{(page - 1) * PAGE_PER_ITEMS + index + 1}</td>
                        <td style={{ textAlign: "left", paddingLeft: "16px" }}>
                          <strong style={{ display: "block", color: "#1f2937" }}>
                            {ele.name}
                          </strong>
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            {ele.email}
                          </span>
                        </td>
                        <td>{ele.phoneNumber || "N/A"}</td>
                        <td>
                          <div style={customStyles.recordsBadges}>
                            <span style={customStyles.badgeLesion} title="Lesion screening cases">
                              <ClipboardList size={12} /> {ele.lesionCount} Lesions
                            </span>
                            <span style={customStyles.badgeQuest} title="Health questionnaires">
                              <FileText size={12} /> {ele.questionnaireCount} Questionnaires
                            </span>
                          </div>
                        </td>
                        <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ele.reason || "Google Play compliance request"}
                        </td>
                        <td>{new Date(ele.requestedAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-cell ${statusClass}`}>
                            {ele.status}
                          </span>
                        </td>
                        <td>
                          <div style={customStyles.actionButtonsWrapper}>
                            {/* View details */}
                            <button
                              onClick={() => handleOpenDetails(ele._id)}
                              style={customStyles.viewBtn}
                              title="View user relations & history"
                            >
                              <Eye size={15} />
                              <span>View</span>
                            </button>

                            {/* Delete User (active only if pending) */}
                            {ele.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleOpenDeleteModal(ele._id, ele.name)}
                                  style={customStyles.deleteBtn}
                                  title="Permanently cascade delete user and all records"
                                >
                                  <Trash2 size={15} />
                                  <span>Delete User</span>
                                </button>

                                <button
                                  onClick={() => handleOpenRejectModal(ele._id, ele.name)}
                                  style={customStyles.rejectBtn}
                                  title="Cancel/Reject deletion request"
                                >
                                  <XCircle size={15} />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>
                      No {statusFilter !== "all" ? statusFilter : ""} account deletion requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination_steps">
          {shouldShowPagination && (
            <div className="pagination-controls mt-4 flex items-center justify-center space-x-4">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`px-3 py-1 border rounded disabled:opacity-50 ${
                  page === 1 ? "disable_prev" : ""
                }`}
              >
                Prev
              </button>
              <span style={{ fontSize: "14px", color: "#56235E", fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className={`px-3 py-1 border rounded disabled:opacity-50 ${
                  page === totalPages ? "disable_next" : ""
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRM PERMANENT CASCADE DELETE MODAL */}
      <ReusableModal
        isOpen={deleteModalOpen}
        message={`Are you sure you want to permanently delete user "${selectedUserName}" and ALL their associated relations (Lesion reports, Health Questionnaires, and Notifications)? This action cannot be reversed.`}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedRequestId(null);
        }}
      />

      {/* REJECT/CANCEL REQUEST MODAL */}
      {rejectModalOpen && (
        <div style={customStyles.modalOverlay}>
          <div style={customStyles.modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#1f2937", fontWeight: 700 }}>
                Reject / Cancel Deletion Request
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "16px" }}>
              Provide an optional reason for declining this request for <strong>{selectedUserName}</strong>:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Request was submitted in error / User requested to cancel."
              rows={3}
              style={customStyles.modalTextarea}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setRejectModalOpen(false)}
                disabled={isRejecting}
                style={customStyles.modalSecondaryBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isRejecting}
                style={customStyles.modalDangerBtn}
              >
                {isRejecting ? "Declining..." : "Decline Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW USER RELATIONS MODAL */}
      {detailsModalOpen && (
        <div style={customStyles.modalOverlay}>
          <div style={customStyles.modalLargeContent}>
            <div style={customStyles.modalHeader}>
              <div>
                <h3 style={{ margin: 0, fontSize: "20px", color: "#56235E", fontWeight: 700 }}>
                  User Profile & Related Records
                </h3>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>
                  All records linked to this user in the database
                </span>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}
              >
                <X size={22} />
              </button>
            </div>

            {detailsLoading || !modalDetails ? (
              <div style={{ padding: "40px", textAlign: "center" }}>
                <Loader />
              </div>
            ) : (
              <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "4px" }}>
                {/* User Info Overview */}
                <div style={customStyles.detailInfoCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <div style={customStyles.detailAvatar}>
                      <User size={22} color="#56235E" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "17px", color: "#1f2937" }}>
                        {modalDetails.name}
                      </h4>
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>
                        Account Status: {modalDetails.userExists ? "Active in DB" : "Already Deleted"}
                      </span>
                    </div>
                  </div>

                  <div style={customStyles.detailGrid}>
                    <div>
                      <Mail size={14} style={{ marginRight: "6px", color: "#666" }} />
                      <strong>Email:</strong> {modalDetails.email}
                    </div>
                    <div>
                      <Phone size={14} style={{ marginRight: "6px", color: "#666" }} />
                      <strong>Phone:</strong> {modalDetails.phoneNumber}
                    </div>
                    <div>
                      <Calendar size={14} style={{ marginRight: "6px", color: "#666" }} />
                      <strong>Requested:</strong>{" "}
                      {new Date(modalDetails.requestedAt).toLocaleString()}
                    </div>
                  </div>

                  {modalDetails.reason && (
                    <div style={{ marginTop: "12px", padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "13px" }}>
                      <strong>User Reason:</strong> {modalDetails.reason}
                    </div>
                  )}
                </div>

                {/* Lesion Records Section */}
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={customStyles.sectionHeading}>
                    <ClipboardList size={18} color="#56235E" />
                    Dental Lesions Submitted ({modalDetails.lesionCount})
                  </h4>
                  {modalDetails.lesions && modalDetails.lesions.length > 0 ? (
                    <div style={customStyles.relationListWrapper}>
                      {modalDetails.lesions.map((lesion, idx) => (
                        <div key={idx} style={customStyles.relationItem}>
                          <div>
                            <strong>Case: #{lesion.case_number || "N/A"}</strong>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                              Patient: {lesion.fullname || "N/A"} | Location: {lesion.location || "N/A"}
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={customStyles.smallBadge}>{lesion.status}</span>
                            <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                              {new Date(lesion.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "6px 0" }}>
                      No dental lesion records submitted by this user.
                    </p>
                  )}
                </div>

                {/* Health Questionnaire Section */}
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={customStyles.sectionHeading}>
                    <FileText size={18} color="#56235E" />
                    Oral Health Questionnaires ({modalDetails.questionnaireCount})
                  </h4>
                  {modalDetails.questionnaires && modalDetails.questionnaires.length > 0 ? (
                    <div style={customStyles.relationListWrapper}>
                      {modalDetails.questionnaires.map((quest, idx) => (
                        <div key={idx} style={customStyles.relationItem}>
                          <div>
                            <strong>Questionnaire #{idx + 1}</strong>
                            <div style={{ fontSize: "12px", color: "#6b7280" }}>
                              Submitted on: {new Date(quest.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span style={customStyles.smallBadge}>{quest.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "6px 0" }}>
                      No health questionnaire records submitted.
                    </p>
                  )}
                </div>

                {/* Actions inside modal if pending */}
                {modalDetails.status === "pending" && (
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                    <button
                      onClick={() => {
                        setDetailsModalOpen(false);
                        handleOpenRejectModal(modalDetails.requestId, modalDetails.name);
                      }}
                      style={customStyles.modalSecondaryBtn}
                    >
                      Reject Request
                    </button>
                    <button
                      onClick={() => {
                        setDetailsModalOpen(false);
                        handleOpenDeleteModal(modalDetails.requestId, modalDetails.name);
                      }}
                      style={customStyles.modalDangerBtn}
                    >
                      <Trash2 size={16} style={{ marginRight: "6px" }} />
                      Delete User & All Records
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const customStyles: { [key: string]: React.CSSProperties } = {
  topHeaderBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "20px",
  },
  headingTitle: {
    margin: "0 0 4px 0",
    fontSize: "22px",
    fontWeight: 700,
    color: "#56235E",
  },
  headingSubtitle: {
    margin: 0,
    fontSize: "13.5px",
    color: "#6b7280",
  },
  filterPillsContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  filterPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
    border: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    color: "#4b5563",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  filterPillActive: {
    backgroundColor: "#56235E",
    borderColor: "#56235E",
    color: "#ffffff",
  },
  recordsBadges: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    alignItems: "center",
  },
  badgeLesion: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "6px",
    backgroundColor: "#f3e8ff",
    color: "#6b21a8",
  },
  badgeQuest: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "6px",
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
  },
  actionButtonsWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
  },
  viewBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  rejectBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 8px",
    backgroundColor: "#ffffff",
    color: "#6b7280",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    maxWidth: "460px",
    width: "100%",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  modalLargeContent: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    maxWidth: "680px",
    width: "100%",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "12px",
  },
  modalTextarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    fontFamily: "inherit",
    outline: "none",
  },
  modalSecondaryBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "13.5px",
    fontWeight: 600,
    cursor: "pointer",
  },
  modalDangerBtn: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontSize: "13.5px",
    fontWeight: 600,
    cursor: "pointer",
  },
  detailInfoCard: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "20px",
  },
  detailAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#eedcf0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "8px",
    fontSize: "13px",
    color: "#374151",
  },
  sectionHeading: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 10px 0",
  },
  relationListWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  relationItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "13px",
  },
  smallBadge: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "2px 8px",
    borderRadius: "10px",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    textTransform: "capitalize",
  },
};
