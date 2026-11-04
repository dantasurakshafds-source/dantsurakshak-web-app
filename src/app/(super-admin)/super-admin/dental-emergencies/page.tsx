"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import ReusableModal from "@/(common)/Model";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { MdEmergency } from "react-icons/md";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import Loader from "@/(common)/Loader";
import AdminPagination from "@/(common)/AdminPagination";
import AdminSearchBar from "@/(common)/AdminSearchBar";
import { AdminEmptyState } from "@/(common)/AdminEmptyState";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { useDeleteDentalEmergencyMutation, useGetDentalEmergenciesQuery } from "@/(store)/services/dental-emergency/dentalEmergencyApi";
import { DentalEmergencyTypes } from "@/utils/Types";
import { toast } from "sonner";

const DentalEmergencyList = () => {
  const { setRightContent } = useBreadcrumb();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: emergenciesData, isLoading, refetch } = useGetDentalEmergenciesQuery({ page: page, limit: PAGE_PER_ITEMS, lang: "en" });
  const [deleteEmergency] = useDeleteDentalEmergencyMutation();
  const [showModal, setShowModal] = useState(false);
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);

  const filteredEmergencies = useMemo(() => {
    const list = emergenciesData?.result ?? [];
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter((e: DentalEmergencyTypes) => {
      const titleEn = e.dental_emergency_title?.en || "";
      const titleKn = e.dental_emergency_title?.kn || "";
      const headingEn = e.dental_emergency_heading?.en || "";
      const headingKn = e.dental_emergency_heading?.kn || "";
      return (
        titleEn.toLowerCase().includes(q) ||
        titleKn.toLowerCase().includes(q) ||
        headingEn.toLowerCase().includes(q) ||
        headingKn.toLowerCase().includes(q)
      );
    });
  }, [emergenciesData?.result, searchTerm]);

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
          placeholder="Search dental emergencies..."
        />
      </div>
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
                {filteredEmergencies && filteredEmergencies.length > 0 ? (
                  filteredEmergencies.map((emergency: DentalEmergencyTypes) => (
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
                  ))
                ) : (
                  <AdminEmptyState
                    searchTerm={searchTerm}
                    defaultMessage="No dental emergencies found."
                    colSpan={6}
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