"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import ReusableModal from "@/(common)/Model";
import { FaEdit, FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdCampaign } from "react-icons/md";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import Loader from "@/(common)/Loader";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { useDeleteTextMutation, useGetTextsQuery } from "@/(store)/services/text-slider/textSliderApi";
import { AppTextSlider } from "@/utils/Types";
import { toast } from "sonner";

const AnnouncementList = () => {

    const [page, setPage] = useState(1);
    const { setRightContent } = useBreadcrumb();
    const { data: announcementsData, isLoading, refetch } = useGetTextsQuery({ page: page, limit: PAGE_PER_ITEMS, lang: "en" });
    const [deleteAnnouncement] = useDeleteTextMutation();
    const [showModal, setShowModal] = useState(false);
    const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteAnnouncement(id).unwrap();
            toast.success("Announcement deleted successfully");
            refetch();
        } catch (err) {
            if (err instanceof Error) {
                toast.error("Failed to delete announcement");
            }
        }
    };

    const confirmDelete = () => {
        if (selectedAnnouncementId) {
            handleDelete(selectedAnnouncementId);
            setShowModal(false);
            setSelectedAnnouncementId(null);
        }
    };

    const totalResults = announcementsData?.totalResults ?? 0;
    const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);
    const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

    useEffect(() => {
        setRightContent(
            <Link href="/super-admin/announcements/add-announcement" className="list-header__action-btn">
                <FaPlus />
                Add Announcement
            </Link>
        );
        return () => setRightContent(null);
    }, [setRightContent]);

    useEffect(() => {
        refetch();
    }, [page, refetch]);

    if (isLoading) return <Loader />;

    return (
        <div className="list-container">
            {announcementsData?.result?.length === 0 ? (
                <div className="list-empty">
                    <div className="list-empty-icon">
                        <MdCampaign />
                    </div>
                    <h3>No Announcements Found</h3>
                    <p>Get started by adding your first announcement.</p>
                </div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Text (EN)</th>
                                    <th>Text (KN)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcementsData?.result?.map((announcement: AppTextSlider) => (
                                    <tr key={announcement._id}>
                                        <td><span className="text-truncate">{announcement.slider_text?.en || 'N/A'}</span></td>
                                        <td><span className="text-truncate">{announcement.slider_text?.kn || 'N/A'}</span></td>
                                        <td>
                                            <div className="table-actions">
                                                <Link
                                                    href={`/super-admin/announcements/update-announcement/${announcement._id}`}
                                                    className="action-edit"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setSelectedAnnouncementId(announcement._id);
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
                message="Are you sure you want to delete this announcement?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setShowModal(false);
                    setSelectedAnnouncementId(null);
                }}
            />
        </div>
    );
};

export default AnnouncementList;