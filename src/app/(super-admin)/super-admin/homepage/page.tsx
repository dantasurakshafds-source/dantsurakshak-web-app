"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import OvalLoader from "@/(common)/OvalLoader";
import AdminPagination from "@/(common)/AdminPagination";
import AdminSearchBar from "@/(common)/AdminSearchBar";
import { AdminEmptyState } from "@/(common)/AdminEmptyState";
import { PAGE_PER_ITEMS } from "@/utils/const";

interface SectionItem {
  title?: string;
  subtitle?: string;
  description?: string;
  tags?: string[];
  link?: string;
}

interface HomePageSectionType {
  _id: string;
  sectionKey: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  image?: string;
  items?: SectionItem[];
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SuperAdminHomePageManager() {
  const [sections, setSections] = useState<HomePageSectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Partial<HomePageSectionType> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch sections
  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/homepage-sections?all=true", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSections(data.data);
      } else {
        toast.error(data.message || "Failed to load sections");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching sections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Open Create
  const handleOpenCreate = () => {
    setEditingSection({
      sectionKey: "",
      title: "",
      subtitle: "",
      description: "",
      badge: "",
      order: sections.length + 1,
      isActive: true,
      items: [],
    });
    setIsEditModalOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (sec: HomePageSectionType) => {
    setEditingSection({ ...sec });
    setIsEditModalOpen(true);
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection?.title || !editingSection?.sectionKey) {
      toast.error("Section Key and Title are required");
      return;
    }

    setSubmitting(true);
    try {
      const isUpdating = Boolean(editingSection._id);
      const url = isUpdating
        ? `/api/homepage-sections/${editingSection._id}`
        : `/api/homepage-sections/create`;
      const method = isUpdating ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSection),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(result.message || (isUpdating ? "Section updated" : "Section created"));
        setIsEditModalOpen(false);
        setEditingSection(null);
        fetchSections();
      } else {
        toast.error(result.message || "Failed to save section");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error occurred while saving");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (sec: HomePageSectionType) => {
    try {
      const res = await fetch(`/api/homepage-sections/${sec._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !sec.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Section ${!sec.isActive ? "activated" : "deactivated"}`);
        setSections((prev) =>
          prev.map((item) => (item._id === sec._id ? { ...item, isActive: !sec.isActive } : item))
        );
      } else {
        toast.error(data.message || "Failed to toggle status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  // Delete Section
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/homepage-sections/${deletingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Section deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        fetchSections();
      } else {
        toast.error(data.message || "Failed to delete section");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error while deleting");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSections = useMemo(() => {
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.sectionKey.toLowerCase().includes(search.toLowerCase()) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(search.toLowerCase()))
    );
  }, [sections, search]);

  const totalPages = Math.ceil(filteredSections.length / PAGE_PER_ITEMS);
  const paginatedSections = filteredSections.slice(
    (page - 1) * PAGE_PER_ITEMS,
    page * PAGE_PER_ITEMS
  );

  return (
    <div style={styles.container}>
      {/* Top Banner / Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTitleRow}>
            <Layers size={24} color="#56235E" />
            <h1 style={styles.headerTitle}>Home Page Sections</h1>
          </div>
          <p style={styles.headerSubtitle}>
            Manage dynamic sections, titles, and content displayed on the public Home page (<code>/</code>).
          </p>
        </div>

        <div style={styles.headerActions}>
          <button style={styles.refreshBtn} onClick={fetchSections} title="Refresh list">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button style={styles.createBtn} onClick={handleOpenCreate}>
            <Plus size={16} />
            <span>Add New Section</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div style={styles.filterBar}>
        <AdminSearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search by title or section key..."
        />

        <div style={styles.statsPill}>
          <span>Total Sections: <strong>{sections.length}</strong></span>
          <span style={{ color: "#d1d5db" }}>|</span>
          <span style={{ color: "#16a34a" }}>Active: <strong>{sections.filter((s) => s.isActive).length}</strong></span>
        </div>
      </div>

      {/* Content Table */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <OvalLoader height="40" width="40" color="#56235E" ariaLabel="loading-sections" />
          <p style={{ marginTop: "12px", color: "#6b7280", fontSize: "14px" }}>Loading homepage sections...</p>
        </div>
      ) : filteredSections.length === 0 ? (
        <div style={styles.emptyContainer}>
          <AdminEmptyState
            searchTerm={search}
            defaultMessage="No homepage sections found."
            isTableRow={false}
          />
        </div>
      ) : (
        <>
          <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Order</th>
                <th style={styles.th}>Section Key</th>
                <th style={styles.th}>Title &amp; Subtitle</th>
                <th style={styles.th}>Items Count</th>
                <th style={styles.th}>Status</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSections.map((sec) => (
                <tr key={sec._id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <span style={styles.orderBadge}>#{sec.order}</span>
                  </td>
                  <td style={styles.td}>
                    <code style={styles.keyTag}>{sec.sectionKey}</code>
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 600, color: "#111827", fontSize: "14px" }}>{sec.title}</div>
                    {sec.subtitle && (
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                        {sec.subtitle}
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.itemsCountBadge}>
                      {sec.items?.length || 0} items
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleToggleActive(sec)}
                      style={{
                        ...styles.statusBtn,
                        backgroundColor: sec.isActive ? "#dcfce7" : "#fee2e2",
                        color: sec.isActive ? "#15803d" : "#b91c1c",
                      }}
                      title="Click to toggle status"
                    >
                      {sec.isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      <span>{sec.isActive ? "Active" : "Inactive"}</span>
                    </button>
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    <div style={styles.actionBtns}>
                      <button
                        onClick={() => handleOpenEdit(sec)}
                        style={styles.editBtn}
                        title="Edit Section"
                      >
                        <Pencil size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(sec._id);
                          setIsDeleteModalOpen(true);
                        }}
                        style={styles.deleteBtn}
                        title="Delete Section"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalResults={filteredSections.length}
          onPageChange={setPage}
          threshold={10}
        />
        </>
      )}

      {/* Edit / Create Modal */}
      {isEditModalOpen && editingSection && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingSection._id ? "Edit Homepage Section" : "Add New Homepage Section"}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} style={styles.modalForm}>
              <div style={styles.formRow2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Section Key (unique identifier)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hero, about, services, workflow"
                    value={editingSection.sectionKey || ""}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, sectionKey: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Display Order</label>
                  <input
                    type="number"
                    value={editingSection.order ?? 0}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, order: Number(e.target.value) })
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Section Title</label>
                <input
                  type="text"
                  required
                  placeholder="Main heading of the section"
                  value={editingSection.title || ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, title: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.formRow2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Subtitle / Kicker</label>
                  <input
                    type="text"
                    placeholder="e.g. THE 4-ROLE CONTINUUM"
                    value={editingSection.subtitle || ""}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, subtitle: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Badge / Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Official Initiative"
                    value={editingSection.badge || ""}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, badge: e.target.value })
                    }
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description / Body Text</label>
                <textarea
                  rows={4}
                  placeholder="Comprehensive description or explanatory paragraph..."
                  value={editingSection.description || ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, description: e.target.value })
                  }
                  style={styles.textarea}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={{ ...styles.label, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editingSection.isActive ?? true}
                    onChange={(e) =>
                      setEditingSection({ ...editingSection, isActive: e.target.checked })
                    }
                    style={{ width: "16px", height: "16px", accentColor: "#56235E" }}
                  />
                  <span>Active &amp; Visible on Public Home Page</span>
                </label>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={styles.cancelBtn}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn} disabled={submitting}>
                  {submitting ? "Saving..." : editingSection._id ? "Update Section" : "Create Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: "420px" }}>
            <div style={styles.modalHeader}>
              <h2 style={{ ...styles.modalTitle, color: "#b91c1c" }}>Delete Section?</h2>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                style={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>
            <p style={{ color: "#4b5563", fontSize: "14px", margin: "16px 0 24px" }}>
              Are you sure you want to delete this section? This will remove it from the database and the public Home page.
            </p>
            <div style={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                style={styles.cancelBtn}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{ ...styles.saveBtn, backgroundColor: "#dc2626" }}
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "24px 32px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    fontFamily: "inherit",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
  },
  headerTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  },
  headerSubtitle: {
    fontSize: "13.5px",
    color: "#6b7280",
    marginTop: "6px",
    margin: 0,
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  refreshBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    color: "#374151",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  createBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "8px",
    borderWidth: "0px",
    backgroundColor: "#56235E",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(86, 35, 94, 0.2)",
  },
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#ffffff",
    padding: "8px 14px",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    width: "320px",
    maxWidth: "100%",
  },
  searchInput: {
    borderWidth: "0px",
    outline: "none",
    fontSize: "13px",
    width: "100%",
    backgroundColor: "transparent",
    color: "#1f2937",
  },
  statsPill: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#ffffff",
    padding: "8px 14px",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    fontSize: "13px",
    color: "#4b5563",
  },
  loadingContainer: {
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
  },
  emptyContainer: {
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    textAlign: "center",
  },
  tableCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tableHeaderRow: {
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  th: {
    padding: "12px 16px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
  },
  td: {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#374151",
    verticalAlign: "middle",
  },
  orderBadge: {
    display: "inline-block",
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "11px",
  },
  keyTag: {
    backgroundColor: "#f3e8ff",
    color: "#6b21a8",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "12px",
    fontFamily: "monospace",
  },
  itemsCountBadge: {
    display: "inline-block",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: 500,
  },
  statusBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "12px",
    borderWidth: "0px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  actionBtns: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "flex-end",
  },
  editBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    borderRadius: "6px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    color: "#56235E",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },
  deleteBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 8px",
    borderRadius: "6px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#fee2e2",
    backgroundColor: "#fff5f5",
    color: "#dc2626",
    fontSize: "12px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    width: "560px",
    maxWidth: "100%",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f3f4f6",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  modalCloseBtn: {
    backgroundColor: "transparent",
    borderWidth: "0px",
    fontSize: "16px",
    color: "#9ca3af",
    cursor: "pointer",
  },
  modalForm: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  formRow2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12.5px",
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "8px 12px",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#d1d5db",
    fontSize: "13px",
    outline: "none",
    color: "#111827",
  },
  textarea: {
    padding: "8px 12px",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#d1d5db",
    fontSize: "13px",
    outline: "none",
    color: "#111827",
    resize: "vertical",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "8px",
    paddingTop: "14px",
    borderTop: "1px solid #f3f4f6",
  },
  cancelBtn: {
    padding: "8px 14px",
    borderRadius: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    color: "#4b5563",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  saveBtn: {
    padding: "8px 18px",
    borderRadius: "8px",
    borderWidth: "0px",
    backgroundColor: "#56235E",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
};
