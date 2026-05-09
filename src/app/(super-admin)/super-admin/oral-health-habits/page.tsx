"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ReusableModal from "@/(common)/Model";
import { FaEdit, FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import Loader from "@/(common)/Loader";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { useDeleteHabitHealthMutation, useGetHabitHealthQuery } from "@/(store)/services/habit-health/habitHealthApi";
import { HabitsHealthType } from "@/utils/Types";
import { toast } from "sonner";

const HabitHealthList = () => {
    const { setRightContent } = useBreadcrumb();
    const [page, setPage] = useState(1);
    const { data: habitsData, isLoading, refetch } = useGetHabitHealthQuery({ page: page, limit: PAGE_PER_ITEMS, lang: "en" });
    const [deleteHabit] = useDeleteHabitHealthMutation();
    const [showModal, setShowModal] = useState(false);
    const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        try {
            await deleteHabit(id).unwrap();
            toast.success("Habit deleted successfully");
            refetch();
        } catch (err) {
            if (err instanceof Error) {
                toast.error("Failed to delete habit");
            }
        }
    };

    useEffect(() => {
        setRightContent(
            <Link href="/super-admin/oral-health-habits/add-habit" className="list-header__action-btn">
                <FaPlus />
                Add Oral Health Habit
            </Link>
        );

        return () => setRightContent(null);
    }, [setRightContent]);

    const confirmDelete = () => {
        if (selectedHabitId) {
            handleDelete(selectedHabitId);
            setShowModal(false);
            setSelectedHabitId(null);
        }
    };

    const totalResults = habitsData?.totalResults ?? 0;
    const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);
    const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

    if (isLoading) return <Loader />;

    return (
        <div className="list-container">
            {habitsData?.result?.length === 0 ? (
                <div className="list-empty">
                    <div className="list-empty-icon">
                        <MdHealthAndSafety />
                    </div>
                    <h3>No Oral Health Habits Found</h3>
                    <p>Get started by adding your first habit.</p>
                </div>
            ) : (
                <>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Main Title (EN)</th>
                                    <th>Main Title (KN)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {habitsData?.result?.map((habit: HabitsHealthType) => (
                                    <tr key={habit._id}>
                                        <td>
                                            <div className="table-img">
                                                <Image
                                                    src={habit.habit_health_main_image}
                                                    alt={habit.habit_health_main_title?.en || "Habit"}
                                                    width={80}
                                                    height={50}
                                                />
                                            </div>
                                        </td>
                                        <td><span className="text-truncate">{habit.habit_health_main_title?.en || 'N/A'}</span></td>
                                        <td><span className="text-truncate">{habit.habit_health_main_title?.kn || 'N/A'}</span></td>
                                        <td>
                                            <div className="table-actions">
                                                <Link
                                                    href={`/super-admin/oral-health-habits/update-habit/${habit._id}`}
                                                    className="action-edit"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (habit._id) {
                                                            setSelectedHabitId(habit._id);
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
                message="Are you sure you want to delete this habit?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setShowModal(false);
                    setSelectedHabitId(null);
                }}
            />
        </div>
    );
};

export default HabitHealthList;