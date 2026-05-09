"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ReusableModal from "@/(common)/Model";
import { ReplacedFaqType } from "@/utils/Types";
import { FaEdit, FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdQuestionAnswer } from "react-icons/md";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import Loader from "@/(common)/Loader";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { useDeletegetFaqMutation, useGetFaqsQuery } from "@/(store)/services/faqs/faqsApi";
import { toast } from "sonner";

const FaqsList = () => {
  const { setRightContent } = useBreadcrumb();
  const [page, setPage] = useState(1);
  const { data: faqsData, isLoading, refetch } = useGetFaqsQuery({ page: page, limit: PAGE_PER_ITEMS, lang: "en" });
  const [deleteFaq] = useDeletegetFaqMutation();
  const [showModal, setShowModal] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);

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
  const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

  if (isLoading) return <Loader />;

  return (
    <div className="list-container">
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
                {faqsData?.result?.map((faq: ReplacedFaqType) => (
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
                ))}
              </tbody>
            </table>
          </div>

          {shouldShowPagination && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="pagination-btn"
              >
                <FaChevronLeft /> Prev
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="pagination-btn"
              >
                Next <FaChevronRight />
              </button>
            </div>
          )}
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