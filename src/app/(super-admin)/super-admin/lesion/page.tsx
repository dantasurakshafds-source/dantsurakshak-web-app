'use client';

import Loader from '@/(common)/Loader';
import { useGetAllLesionsQuery } from '@/(store)/services/lesion/lesionApi';
import { useBreadcrumb } from '@/provider/BreadcrumbContext';
import React, { useEffect, useState, useMemo } from 'react';
import { FaBook } from 'react-icons/fa';
import AdminPagination from '@/(common)/AdminPagination';
import AdminSearchBar from '@/(common)/AdminSearchBar';
import { AdminEmptyState } from '@/(common)/AdminEmptyState';
import { PAGE_PER_ITEMS } from '@/utils/const';
import { Lesion } from '@/utils/Types';

export default function LesionList() {
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const { data, isLoading, isError } = useGetAllLesionsQuery({ page: 1, limit: 1000 });
    const { setRightContent } = useBreadcrumb();

    useEffect(() => {
        if (!data) return;

        setRightContent(
            <div className="total-count-wrapper">
                <i><FaBook size={18} color="#56235E" /></i>
                <span className="total-count"> {data.totalLesions} Lesions</span>
            </div>
        );

        return () => setRightContent(null);
    }, [data, setRightContent]);

    const filteredLesions = useMemo(() => {
        const list: Lesion[] = data?.lesions ?? [];
        if (!searchTerm.trim()) return list;
        const q = searchTerm.toLowerCase();
        return list.filter(
            (lesion: Lesion) =>
                lesion.fullname?.toLowerCase().includes(q) ||
                lesion.status?.toLowerCase().includes(q) ||
                lesion.submitted_by?.toLowerCase().includes(q)
        );
    }, [data?.lesions, searchTerm]);

    const totalResults = filteredLesions.length;
    const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);
    const paginatedLesions = filteredLesions.slice((page - 1) * PAGE_PER_ITEMS, page * PAGE_PER_ITEMS);

    if (isLoading) return <Loader />;
    if (isError) return <p className="lesion-status error">Failed to load lesions.</p>;

    return (
        <div className="lesion-wrapper">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <AdminSearchBar
                    value={searchTerm}
                    onChange={(val) => {
                        setSearchTerm(val);
                        setPage(1);
                    }}
                    placeholder="Search lesions by patient, status..."
                />
            </div>
            <div className="lesion-table-container">
                <table className="lesion-table">
                    <thead>
                        <tr>
                            <th>Patient Name</th>
                            <th>Age</th>
                            <th>Status</th>
                            <th>Submitted By</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLesions.length > 0 ? (
                            paginatedLesions.map((lesion) => (
                                <tr key={lesion._id}>
                                    <td>{lesion.fullname}</td>
                                    <td>{lesion.age}</td>
                                    <td>{lesion.status}</td>
                                    <td>{lesion.submitted_by}</td>
                                    <td>{new Date(lesion.createdAt).toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            <AdminEmptyState
                                searchTerm={searchTerm}
                                defaultMessage="No lesion records found."
                                colSpan={5}
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
        </div>
    );
}
