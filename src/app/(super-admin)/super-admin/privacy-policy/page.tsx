"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ReusableModal from "@/(common)/Model";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { MdPolicy } from "react-icons/md";
import Loader from "@/(common)/Loader";
import AdminPagination from "@/(common)/AdminPagination";
import AdminSearchBar from "@/(common)/AdminSearchBar";
import { AdminEmptyState } from "@/(common)/AdminEmptyState";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { PrivacyPolicyType } from "@/utils/Types";
import { useDeletePrivacyPolicyMutation, useGetPrivacyPolicesQuery } from "@/(store)/services/privacy-policy/privacyPolicyApi";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import { toast } from "sonner";

const PrivacyPolicy = () => {
    const { setRightContent } = useBreadcrumb();
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const { data: policiesData, isLoading, refetch } = useGetPrivacyPolicesQuery({ page: page, limit: PAGE_PER_ITEMS, lang: "en" });
    const [deletePolicy] = useDeletePrivacyPolicyMutation();
    const [showModal, setShowModal] = useState(false);
    const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

    const filteredPolicies = useMemo(() => {
        const list = policiesData?.result ?? [];
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter((p: PrivacyPolicyType) =>
            p.privacy_policy_repeater?.some(
                (r) =>
                    r.privacy_heading?.en?.toLowerCase().includes(q) ||
                    r.privacy_heading?.kn?.toLowerCase().includes(q) ||
                    r.privacy_description?.en?.toLowerCase().includes(q) ||
                    r.privacy_description?.kn?.toLowerCase().includes(q)
            )
        );
    }, [policiesData?.result, searchTerm]);

    const handleDelete = async (id: string) => {
        try {
            await deletePolicy(id).unwrap();
            toast.success("Policy deleted successfully");
            refetch();
        } catch (err) {
            if (err instanceof Error) {
                toast.error("Failed to delete policy");
            }
        }
    };

    const confirmDelete = () => {
        if (selectedPolicyId) {
            handleDelete(selectedPolicyId);
            setShowModal(false);
            setSelectedPolicyId(null);
        }
    };

    useEffect(() => {
        setRightContent(
            <Link href="/super-admin/privacy-policy/add-policy" className="list-header__action-btn">
                <FaPlus />
                Add Policy
            </Link>
        );

        return () => setRightContent(null);
    }, [setRightContent]);

    const totalResults = policiesData?.totalResults ?? 0;
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
                    placeholder="Search privacy policies..."
                />
            </div>
            {policiesData?.result?.length === 0 ? (
                <div className="list-empty">
                    <div className="list-empty-icon">
                        <MdPolicy />
                    </div>
                    <h3>No Privacy Policies Found</h3>
                    <p>Get started by adding your first privacy policy.</p>
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
                                {filteredPolicies && filteredPolicies.length > 0 ? (
                                    filteredPolicies.map((policy: PrivacyPolicyType) => (
                                        <tr key={policy._id}>
                                            <td>{policy?.privacy_policy_repeater?.length || 0} sections</td>
                                            <td>
                                                <span className="text-truncate">
                                                    {policy?.privacy_policy_repeater?.[0]?.privacy_heading?.en || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-truncate">
                                                    {policy?.privacy_policy_repeater?.[0]?.privacy_heading?.kn || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <Link
                                                        href={`/super-admin/privacy-policy/update-policy/${policy._id}`}
                                                        className="action-edit"
                                                    >
                                                        <FaEdit />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            if (policy._id) {
                                                                setSelectedPolicyId(policy._id);
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
                                    ))
                                ) : (
                                    <AdminEmptyState
                                        searchTerm={searchTerm}
                                        defaultMessage="No privacy policies found."
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
                message="Are you sure you want to delete this privacy policy?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setShowModal(false);
                    setSelectedPolicyId(null);
                }}
            />
        </div>
    );
};

export default PrivacyPolicy;