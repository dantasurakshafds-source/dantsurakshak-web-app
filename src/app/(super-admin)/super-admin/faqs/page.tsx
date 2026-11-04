"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ReusableModal from "@/(common)/Model";
import { ReplacedFaqType } from "@/utils/Types";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { MdQuestionAnswer } from "react-icons/md";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import Loader from "@/(common)/Loader";
import AdminPagination from "@/(common)/AdminPagination";
import AdminSearchBar from "@/(common)/AdminSearchBar";
import { AdminEmptyState } from "@/(common)/AdminEmptyState";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { useDeletegetFaqMutation, useGetFaqsQuery } from "@/(store)/services/faqs/faqsApi";
import { toast } from "sonner";

const FaqsList = () => {
  const { setRightContent } = useBreadcrumb();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: faqsData, isLoading, refetch } = useGetFaqsQuery({ page: page, limit: PAGE_PER_ITEMS, lang: "en" });
  const [deleteFaq] = useDeletegetFaqMutation();
  const [showModal, setShowModal] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);

  const filteredFaqs = useMemo(() => {
    const list = faqsData?.result ?? [];
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((f: ReplacedFaqType) => {
      const titleEn = f.faqs_title?.en || "";
      const titleKn = f.faqs_title?.kn || "";
      const matchesRepeater = f.faqs_repeater?.some(
        (r) =>
          r.faqs_repeat_question?.en?.toLowerCase().includes(q) ||
          r.faqs_repeat_question?.kn?.toLowerCase().includes(q) ||
          r.faqs_repeat_answer?.en?.toLowerCase().includes(q) ||
          r.faqs_repeat_answer?.kn?.toLowerCase().includes(q)
      );
      return titleEn.toLowerCase().includes(q) || titleKn.toLowerCase().includes(q) || matchesRepeater;
    });
  }, [faqsData?.result, searchTerm]);

  const handleDelete = async (id: string) => {
    try {
      await deleteFaq(id).unwrap();
      toast.success("FAQ deleted successfully");
      refetch();
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Failed to delete FAQ");
      }
    }
  };

  useEffect(() => {
    setRightContent(
      <Link href="/super-admin/faqs/add-faq" className="list-header__action-btn">
        <FaPlus />
        Add New FAQ
      </Link>
    );
    return () => setRightContent(null);
  }, [setRightContent]);

  const confirmDelete = () => {
    if (selectedFaqId) {
      handleDelete(selectedFaqId);
      setShowModal(false);
      setSelectedFaqId(null);
    }
  };

  const totalResults = faqsData?.totalResults ?? 0;
  const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);

  if (isLoading) return <Loader />;

  return (
    <div className="list-container">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <AdminSearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          placeholder="Search FAQs by question or answer..."
        />
      </div>
      {faqsData?.result?.length === 0 ? (
        <div className="list-empty">
          <div className="list-empty-icon">
            <MdQuestionAnswer />
          </div>
          <h3>No FAQs Found</h3>
          <p>Get started by adding your first FAQ.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title (EN)</th>
                  <th>Title (KN)</th>
                  <th>Questions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaqs && filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq: ReplacedFaqType) => (
                    <tr key={faq._id}>
                      <td><span className="text-truncate">{faq?.faqs_title?.en || 'N/A'}</span></td>
                      <td><span className="text-truncate">{faq?.faqs_title?.kn || 'N/A'}</span></td>
                      <td><span className="text-truncate">{faq?.faqs_repeater?.length || 0} items</span></td>
                      <td>
                        <div className="table-actions">
                          <Link
                            href={`/super-admin/faqs/update-faq/${faq._id}`}
                            className="action-edit"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedFaqId(faq._id);
                              setShowModal(true);
                            }}
                            className="action-delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <AdminEmptyState
                    searchTerm={searchTerm}
                    defaultMessage="No FAQs found."
                    colSpan={4}
                  />
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            totalResults={totalResults}
            onPageChange={setPage}
            threshold={10}
          />
        </>
      )}

      <ReusableModal
        isOpen={showModal}
        message="Are you sure you want to delete this FAQ?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowModal(false);
          setSelectedFaqId(null);
        }}
      />
    </div>
  );
};

export default FaqsList;