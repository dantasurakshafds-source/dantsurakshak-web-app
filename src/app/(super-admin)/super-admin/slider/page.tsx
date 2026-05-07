'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDeleteSliderMutation, useGetSlidersQuery } from '@/(store)/services/slider/sliderApi';
import ReusableModal from '@/(common)/Model';
import { Slide } from '@/utils/Types';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { useBreadcrumb } from '@/provider/BreadcrumbContext';
import Loader from '@/(common)/Loader';
import { PAGE_PER_ITEMS } from '@/utils/const';

const SliderList = () => {
  const { setRightContent } = useBreadcrumb();
      const [page, setPage] = useState(1) 
  const { data: sliders, isLoading, refetch } = useGetSlidersQuery({ page: page, limit: PAGE_PER_ITEMS });
  const [deleteSlider] = useDeleteSliderMutation();
  const [showModal, setShowModal] = useState(false);
  const [selectedSliderId, setSelectedSliderId] = useState<string | null>(null);

  useEffect(() => {
    setRightContent(
      <Link href="/super-admin/slider/add-slider" className="add-slider-btn">
        <span className="iconsss">
          <FaPlus />
          Add New Slider
        </span>
      </Link>
    );

    // Optional: Cleanup when leaving
    return () => setRightContent(null);
  }, [setRightContent]);

  const handleDelete = async (id: string) => {
    try {
      await deleteSlider(id).unwrap();
      refetch();
    } catch (err) {
      if (err instanceof Error) {
        alert('Failed to delete');

      }
    }
  };

  const confirmDelete = () => {
    if (selectedSliderId) {
      handleDelete(selectedSliderId);
      setShowModal(false);
      setSelectedSliderId(null);
    }
  };

 

  
 const totalResults = sliders?.totalResults ?? 0;
  const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);
  const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

  return (
    <div className="slider-main-outer">
      {isLoading ? (
        <Loader />
      ) : sliders?.result?.length === 0 ? (
        <p>No sliders found.</p>
      ) : (
        <div className="all-slider-container">
          {sliders?.result?.map((slider: Slide) => (
            <div key={slider._id} className="slider-card">
              <div className="slider-images">
                <img src={slider.sliderImage} alt="Slider" />
              </div>

              <div className="en-kn-container">
                <div className="en-inner">
                  <p><b>Text (EN):</b> {slider.text?.en}</p>
                  <p><b>Description (EN):</b> {slider.description?.en}</p>
                </div>
                <div className="kn-inner">
                  <p><b>Text (KN):</b> {slider.text?.kn}</p>
                  <p><b>Description (KN):</b> {slider.description?.kn}</p>
                </div>
              </div>

              <div className="edit-delete-b-container">
                <Link href={`/super-admin/slider/update-slider/${slider._id}`} className="edit-button">
                  <span className="iconsss">
                    <FaEdit /> Edit
                  </span>
                </Link>
                <button
                  onClick={() => {
                    setSelectedSliderId(slider._id);
                    setShowModal(true);
                  }}
                  className="delete-button"
                >
                  <span className="iconsss">
                    <FaTrash />Delete
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReusableModal
        isOpen={showModal}
        message="Are you sure you want to delete this slider?"
        id={selectedSliderId || undefined}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowModal(false);
          setSelectedSliderId(null);
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

export default SliderList;
