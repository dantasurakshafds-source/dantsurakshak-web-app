"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ReusableModal from "@/(common)/Model";
import { FaEdit, FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdEmergency } from "react-icons/md";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import Loader from "@/(common)/Loader";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { useDeleteDentalEmergencyMutation, useGetDentalEmergenciesQuery } from "@/(store)/services/dental-emergency/dentalEmergencyApi";
import { DentalEmergencyTypes } from "@/utils/Types";
import { toast } from "sonner";

const DentalEmergencyList = () => {
  const { setRightContent } = useBreadcrumb();
  const [page, setPage] = useState(1);
  const { data: emergenciesData, isLoading, refetch } = useGetDentalEmergenciesQuery({ page: page, limit: PAGE_PER_ITEMS, lang: "en" });
  const [deleteEmergency] = useDeleteDentalEmergencyMutation();
  const [showModal, setShowModal] = useState(false);
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteEmergency(id).unwrap();
      toast.success("Dental emergency deleted successfully");
      refetch();
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Failed to delete dental emergency");
      }
    }
  };

  useEffect(() => {
    setRightContent(
      <Link href="/super-admin/dental-emergencies/add-dental-emergency" className="list-header__action-btn">
        <FaPlus />
        Add Dental Emergency
      </Link>
    );
    return () => setRightContent(null);
  }, [setRightContent]);

  const confirmDelete = () => {
    if (selectedEmergencyId) {
      handleDelete(selectedEmergencyId);
      setShowModal(false);
      setSelectedEmergencyId(null);
    }
  };

  const totalResults = emergenciesData?.totalResults ?? 0;
  const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);
  const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

  if (isLoading) return <Loader />;

  return (
    <div className="list-container">
      {emergenciesData?.result?.length === 0 ? (
        <div className="list-empty">
          <div className="list-empty-icon">
            <MdEmergency />
          </div>
          <h3>No Dental Emergencies Found</h3>
          <p>Get started by adding your first dental emergency.</p>
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
                {emergenciesData?.result?.map((emergency: DentalEmergencyTypes) => (
                  <tr key={emergency._id}>
                    <td>
                      <div className="table-img">
                        <Image
                          src={emergency.dental_emergency_image}
                          alt={emergency.dental_emergency_title?.en || "Emergency"}
                          width={80}
                          height={50}
                        />
                      </div>
                    </td>
                    <td><span className="text-truncate">{emergency.dental_emergency_title?.en || 'N/A'}</span></td>
                    <td><span className="text-truncate">{emergency.dental_emergency_title?.kn || 'N/A'}</span></td>
                    <td><span className="text-truncate">{emergency.dental_emergency_heading?.en || 'N/A'}</span></td>
                    <td><span className="text-truncate">{emergency.dental_emergency_heading?.kn || 'N/A'}</span></td>
                    <td>
                      <div className="table-actions">
                        <Link
                          href={`/super-admin/dental-emergencies/update-dental-emergency/${emergency._id}`}
                          className="action-edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedEmergencyId(emergency._id);
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
        message="Are you sure you want to delete this dental emergency?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowModal(false);
          setSelectedEmergencyId(null);
        }}
      />
    </div>
  );
};

export default DentalEmergencyList;