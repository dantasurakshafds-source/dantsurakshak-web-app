"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ReusableModal from "@/(common)/Model";
import { FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdFactCheck } from "react-icons/md";
import Loader from "@/(common)/Loader";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { IMythFact } from "@/utils/Types";
import { useDeleteMythFactMutation, useGetMythFactsQuery } from "@/(store)/services/myth-facts/mythFactsApi";
import { toast } from "sonner";

const MythFactsList = () => {
    const [page, setPage] = useState(1);
    const { data: mythsData, isLoading, refetch } = useGetMythFactsQuery({ page: page, limit: PAGE_PER_ITEMS, lang: "en" });
    const [deleteMyth] = useDeleteMythFactMutation();
    const [showModal, setShowModal] = useState(false);
    const [selectedMythId, setSelectedMythId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteMyth(id).unwrap();
            toast.success("Myth & Fact deleted successfully");
            refetch();
        } catch (err) {
            if (err instanceof Error) {
                toast.error("Failed to delete myth & fact");
            }
        }
    };

    const confirmDelete = () => {
        if (selectedMythId) {
            handleDelete(selectedMythId);
            setShowModal(false);
            setSelectedMythId(null);
        }
    };

    const totalResults = mythsData?.totalResults ?? 0;
    const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);
    const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

    if (isLoading) return <Loader />;

    return (
        <div className="list-container">
            {mythsData?.result?.length === 0 ? (
                <div className="list-empty">
                    <div className="list-empty-icon">
                        <MdFactCheck />
                    </div>
                    <h3>No Myths & Facts Found</h3>
                    <p>Get started by adding your first myth & fact.</p>
                </div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Title (EN)</th>
                                    <th>Title (KN)</th>
                                    <th>Heading (EN)</th>
                                    <th>Heading (KN)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mythsData?.result?.map((myth: IMythFact) => (
                                    <tr key={myth._id}>
                                        <td>
                                            <div className="table-img">
                                                <Image
                                                    src={myth.myth_fact_image}
                                                    alt={myth.myth_fact_title?.en || "Myth Fact"}
                                                    width={80}
                                                    height={50}
                                                />
                                            </div>
                                        </td>
                                        <td><span className="text-truncate">{myth.myth_fact_title?.en || 'N/A'}</span></td>
                                        <td><span className="text-truncate">{myth.myth_fact_title?.kn || 'N/A'}</span></td>
                                        <td><span className="text-truncate">{myth.myth_fact_heading?.en || 'N/A'}</span></td>
                                        <td><span className="text-truncate">{myth.myth_fact_heading?.kn || 'N/A'}</span></td>
                                        <td>
                                            <div className="table-actions">
                                                <Link
                                                    href={`/super-admin/myths-facts/${myth._id}`}
                                                    className="action-edit"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setSelectedMythId(myth._id);
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
                message="Are you sure you want to delete this myth & fact?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setShowModal(false);
                    setSelectedMythId(null);
                }}
            />
        </div>
    );
};

export default MythFactsList;