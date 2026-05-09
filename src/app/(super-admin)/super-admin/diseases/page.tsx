"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGetDiseasesQuery, useDeleteDiseaseMutation } from "@/(store)/services/disease/diseaseApi";
import ReusableModal from "@/(common)/Model";
import { DiseaseTypes } from "@/utils/Types";
import { FaEdit, FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { MdLocalHospital } from "react-icons/md";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import Loader from "@/(common)/Loader";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { toast } from "sonner";

const DiseaseList = () => {
  const { setRightContent } = useBreadcrumb();
  const [page, setPage] = useState(1);
  const { data: diseasesData, isLoading, refetch } = useGetDiseasesQuery({ page: page, limit: PAGE_PER_ITEMS, lang: "en" });
  const [deleteDisease] = useDeleteDiseaseMutation();
  const [showModal, setShowModal] = useState(false);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteDisease(id).unwrap();
      toast.success("Disease deleted successfully");
      refetch();
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Failed to delete disease");
      }
    }
  };

  useEffect(() => {
    setRightContent(
      <Link href="/super-admin/diseases/add-disease" className="list-header__action-btn">
        <FaPlus />
        Add Disease
      </Link>
    );

    return () => setRightContent(null);
  }, [setRightContent]);

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

  if (isLoading) return <Loader />;

  return (
    <div className="list-container">
      {diseasesData?.result?.length === 0 ? (
        <div className="list-empty">
          <div className="list-empty-icon">
            <MdLocalHospital />
          </div>
          <h3>No Diseases Found</h3>
          <p>Get started by adding your first disease.</p>
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
                  <th>Slug (EN)</th>
                  <th>Slug (KN)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {diseasesData?.result?.map((disease: DiseaseTypes) => (
                  <tr key={disease._id}>
                    <td>
                      <div className="table-img">
                        <Image
                          src={disease.disease_main_image}
                          alt={disease.disease_slug?.en || "Disease"}
                          width={80}
                          height={50}
                        />
                      </div>
                    </td>
                    <td><span className="text-truncate">{disease.disease_main_title?.en || 'N/A'}</span></td>
                    <td><span className="text-truncate">{disease.disease_main_title?.kn || 'N/A'}</span></td>
                    <td><span className="text-truncate">{disease.disease_description?.en || 'N/A'}</span></td>
                    <td><span className="text-truncate">{disease.disease_description?.kn || 'N/A'}</span></td>
                    <td>
                      <div className="table-actions">
                        <Link
                          href={`/super-admin/diseases/update-disease/${disease._id}`}
                          className="action-edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedDiseaseId(disease._id);
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
        message="Are you sure you want to delete this disease?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowModal(false);
          setSelectedDiseaseId(null);
        }}
      />
    </div>
  );
};

export default DiseaseList;