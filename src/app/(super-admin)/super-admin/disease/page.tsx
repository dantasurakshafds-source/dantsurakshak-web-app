// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import { useGetDiseasesQuery, useDeleteDiseaseMutation } from "@/(store)/services/disease/diseaseApi";
// import ReusableModal from "@/(common)/Model"; // Adjust the import based on your folder structure
// import { DiseaseTypes } from "@/utils/Types";

// const DiseaseList = () => {
//   const { data: diseasesData, isLoading, refetch } = useGetDiseasesQuery({ page: 1, limit: 15, lang: "en" });
//   const [deleteDisease] = useDeleteDiseaseMutation();
//   const [showModal, setShowModal] = useState(false);
//   const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(null);

//   const handleDelete = async (id: string) => {
//     try {
//       await deleteDisease(id).unwrap();
//       refetch();
//     } catch (err) {
//       if(err instanceof Error){
//         alert("Failed to delete disease");
//       }
//     }
//   };


//   const confirmDelete = () => {
//     if (selectedDiseaseId) {
//       handleDelete(selectedDiseaseId);
//       setShowModal(false);
//       setSelectedDiseaseId(null);
//     }
//   };

//   return (
//     <div className="disease-main-container">
//       <div className="section-header">
//         <h2>All Diseases (Redux Query)</h2>
//         <Link href="/super-admin/disease/add-disease" className="add-slider-btn">
//           ➕ Add New Disease
//         </Link>
//       </div>

//       {isLoading ? (
//         <p>Loading diseases...</p>
//       ) : diseasesData?.result?.length === 0 ? (
//         <p>No diseases found.</p>
//       ) : (
//         <div className="disease-list-container">
//           {diseasesData?.result?.map((disease: DiseaseTypes) => (
//             <div key={disease._id} className="disease-card">
//               <div className="disease-image">
//                 <img src={disease.disease_main_image} alt={disease.disease_slug.en} />
//               </div>
//               <div className="disease-info">
//                 <p><b>Slug:</b> {disease.disease_slug.en}</p>
//                 <p><b>Main Title:</b> {disease.disease_main_title.en}</p>
//               </div>
//               <div className="disease-actions">
//                 <Link href={`/super-admin/disease/update-disease/${disease._id}`} className="edit-button">
//                   ✏️ Edit
//                 </Link>
//                 <button
//                   onClick={() => {
//                     setSelectedDiseaseId(disease._id);
//                     setShowModal(true);
//                   }}
//                   className="delete-button"
//                 >
//                   🗑 Delete
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <ReusableModal
//         isOpen={showModal}
//         message="Are you sure you want to delete this disease?"
//         id={selectedDiseaseId || undefined}
//         onConfirm={confirmDelete}
//         onCancel={() => {
//           setShowModal(false);
//           setSelectedDiseaseId(null);
//         }}
//       />
//     </div>
//   );
// };

// export default DiseaseList;




"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useGetDiseasesQuery, useDeleteDiseaseMutation } from "@/(store)/services/disease/diseaseApi";
import ReusableModal from "@/(common)/Model";
import { DiseaseTypes } from "@/utils/Types";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import Loader from "@/(common)/Loader";
import { PAGE_PER_ITEMS } from "@/utils/const";

const DiseaseList = () => {
  const { setRightContent } = useBreadcrumb();
  const [page, setPage] = useState(1)
  const { data: diseasesData, isLoading, refetch } = useGetDiseasesQuery({ page: page, limit: PAGE_PER_ITEMS, lang: "en" });
  const [deleteDisease] = useDeleteDiseaseMutation();
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

  useEffect(() => {
    setRightContent(
      <Link href="/super-admin/disease/add-disease" className="add-slider-btn">
        <span className="iconsss">
          <FaPlus /> Add New Disease
        </span>
      </Link>
    );

    // Optional: Cleanup when leaving
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

 

  return (
    <div className="disease-main-container">
      {isLoading ? (
        <Loader />
      ) : diseasesData?.result?.length === 0 ? (
        <p>No diseases found.</p>
      ) : (
        <div className="disease-list-container">
          {diseasesData?.result?.map((disease: DiseaseTypes) => (
            <div key={disease._id} className="disease-card">
              <div className="disease-image">
                <img src={disease.disease_main_image} alt={disease.disease_slug.en} />
              </div>
              <div className="disease-info">
        
                <p><b>Main Title:</b> {disease.disease_main_title.en}</p>
              </div>
              <div className="disease-actions">
                <Link href={`/super-admin/disease/update-disease/${disease._id}`} className="edit-button">
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

export default DiseaseList;
