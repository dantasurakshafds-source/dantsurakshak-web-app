"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ReusableModal from "@/(common)/Model";
import { FaEdit, FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdGavel } from "react-icons/md";
import Loader from "@/(common)/Loader";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { TermsAndConditionsType } from "@/utils/Types";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import { useDeleteTermMutation, useGetTermsQuery } from "@/(store)/services/terms/termAndConditionsApi";
import { toast } from "sonner";

const TermAndConditions = () => {
    const { setRightContent } = useBreadcrumb();
    const [page, setPage] = useState(1);
    const { data: termsData, isLoading, refetch } = useGetTermsQuery({ page: page, limit: PAGE_PER_ITEMS, lang: "en" });
    const [deleteTerm] = useDeleteTermMutation();
    const [showModal, setShowModal] = useState(false);
    const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteTerm(id).unwrap();
            toast.success("Term deleted successfully");
            refetch();
        } catch (err) {
            if (err instanceof Error) {
                toast.error("Failed to delete term");
            }
        }
    };

    const confirmDelete = () => {
        if (selectedTermId) {
            handleDelete(selectedTermId);
            setShowModal(false);
            setSelectedTermId(null);
        }
    };

    useEffect(() => {
        setRightContent(
            <Link href="/super-admin/terms-conditions/add-term" className="add-slider-btn">
                <FaPlus />
                Add Term
            </Link>
        );

        return () => setRightContent(null);
    }, [setRightContent]);

    const totalResults = termsData?.totalResults ?? 0;
    const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);
    const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

    if (isLoading) return <Loader />;

    return (
        <div className="list-container">
            {termsData?.result?.length === 0 ? (
                <div className="list-empty">
                    <div className="list-empty-icon">
                        <MdGavel />
                    </div>
                    <h3>No Terms Found</h3>
                    <p>Get started by adding your first term.</p>
                </div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Sections</th>
                                    <th>First Heading (EN)</th>
                                    <th>First Heading (KN)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {termsData?.result?.map((term: TermsAndConditionsType) => (
                                    <tr key={term._id}>
                                        <td>{term?.terms_repeater?.length || 0} sections</td>
                                        <td>
                                            <span className="text-truncate">
                                                {term?.terms_repeater?.[0]?.term_heading?.en || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="text-truncate">
                                                {term?.terms_repeater?.[0]?.term_heading?.kn || 'N/A'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <Link
                                                    href={`/super-admin/terms-conditions/update-term/${term._id}`}
                                                    className="action-edit"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (term._id) {
                                                            setSelectedTermId(term._id);
                                                        }
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
                message="Are you sure you want to delete this term?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setShowModal(false);
                    setSelectedTermId(null);
                }}
            />
        </div>
    );
};

export default TermAndConditions;