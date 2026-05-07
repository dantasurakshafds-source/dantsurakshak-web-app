
"use client";
import React, {  useState } from "react";
import Link from "next/link";
import ReusableModal from "@/(common)/Model";
import { FaEdit, FaTrash } from "react-icons/fa";
import Loader from "@/(common)/Loader";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { IMythFact } from "@/utils/Types";
import { useDeleteMythFactMutation, useGetMythFactsQuery } from "@/(store)/services/myth-facts/mythFactsApi";
const MythFactsList = () => {
    const [page, setPage] = useState(1)
    const { data: diseasesData, isLoading, refetch } = useGetMythFactsQuery({ page: page, limit: PAGE_PER_ITEMS, lang: "en" });
    const [deleteDisease] = useDeleteMythFactMutation();
    const [showModal, setShowModal] = useState(false);
    const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(null);
    const handleDelete = async (id: string) => {
        try {
            await deleteDisease(id).unwrap();
            refetch();
        } catch (err) {
            if (err instanceof Error) {
                alert("Failed to delete disease");
            }
        }
    };
    const confirmDelete = () => {
        if (selectedDiseaseId) {
            handleDelete(selectedDiseaseId);
            setShowModal(false);
            setSelectedDiseaseId(null);
        }
    };


    const totalResults = diseasesData?.totalResults ?? 0;
    const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);
    const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

 


    return (
        <div className="disease-main-container">
            {isLoading ? (
                <Loader />
            ) : diseasesData?.result?.length === 0 ? (
                <p>No diseases found.</p>
            ) : (
                <div className="disease-list-container">
                    {diseasesData?.result?.map((disease: IMythFact) => (
                        <div key={disease._id} className="disease-card">
                            <div className="disease-image">
                                <img src={disease.myth_fact_image} alt={disease.myth_fact_title.en} />
                            </div>
                            <div className="disease-info">
                                <p><b>Main Title:</b> {disease.myth_fact_title.en}</p>
                            </div>
                            <div className="disease-actions">
                                <Link href={`/super-admin/myth-and-facts/update-myth-facts/${disease._id}`} className="edit-button">
                                    <span className="iconsss">
                                        <FaEdit /> Edit
                                    </span>
                                </Link>
                                <button
                                    onClick={() => {
                                        setSelectedDiseaseId(disease._id);
                                        setShowModal(true);
                                    }}
                                    className="delete-button"
                                >
                                    <span className="iconsss">
                                        <FaTrash /> Delete
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ReusableModal
                isOpen={showModal}
                message="Are you sure you want to delete this disease?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setShowModal(false);
                    setSelectedDiseaseId(null);
                }}
            />
            <div className="pagination_steps">
                {shouldShowPagination && (
                    <div className="pagination-controls mt-4 flex items-center justify-center space-x-4">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className={`px-3 py-1 border rounded disabled:opacity-50 ${page === 1 ? 'disable_prev' : ''}`}
                        >
                            Prev
                        </button>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className={`px-3 py-1 border rounded disabled:opacity-50 ${page === totalPages ? 'disable_next' : ''}`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MythFactsList;
