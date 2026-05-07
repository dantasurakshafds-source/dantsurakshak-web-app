'use client';

import Loader from '@/(common)/Loader';
import { useGetAllLesionsQuery } from '@/(store)/services/lesion/lesionApi';
import { useBreadcrumb } from '@/provider/BreadcrumbContext';
import React, { useEffect } from 'react';
import { FaBook } from 'react-icons/fa';

export default function LesionList() {
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

    if (isLoading) return <Loader />;
    if (isError) return <p className="lesion-status error">Failed to load lesions.</p>;

    const lesions = data?.lesions ?? [];

    return (
        <div className="lesion-wrapper">
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
                        {lesions.map((lesion) => (
                            <tr key={lesion._id}>
                                <td>{lesion.fullname}</td>
                                <td>{lesion.age}</td>
                                <td>{lesion.status}</td>
                                <td>{lesion.submitted_by}</td>
                                <td>{new Date(lesion.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
