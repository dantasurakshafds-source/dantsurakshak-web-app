'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDeleteSliderMutation, useGetSlidersQuery } from '@/(store)/services/slider/sliderApi';
import ReusableModal from '@/(common)/Model';
import { Slide } from '@/utils/Types';
import { FaEdit, FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdImage } from 'react-icons/md';
import { useBreadcrumb } from '@/provider/BreadcrumbContext';
import Loader from '@/(common)/Loader';
import { PAGE_PER_ITEMS } from '@/utils/const';
import { toast } from 'sonner';

const BannersList = () => {
  const { setRightContent } = useBreadcrumb();
  const [page, setPage] = useState(1);
  const { data: sliders, isLoading, refetch } = useGetSlidersQuery({ page: page, limit: PAGE_PER_ITEMS });
  const [deleteSlider] = useDeleteSliderMutation();
  const [showModal, setShowModal] = useState(false);
  const [selectedSliderId, setSelectedSliderId] = useState<string | null>(null);

  useEffect(() => {
    setRightContent(
      <Link href="/super-admin/banners/add-banner" className="list-header__action-btn">
        <FaPlus />
        Add Banner
      </Link>
    );

    return () => setRightContent(null);
  }, [setRightContent]);

  const handleDelete = async (id: string) => {
    try {
      await deleteSlider(id).unwrap();
      toast.success('Banner deleted successfully');
      refetch();
    } catch (err) {
      if (err instanceof Error) {
        toast.error('Failed to delete banner');
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

  if (isLoading) return <Loader />;

  return (
    <div className="list-container">
      {sliders?.result?.length === 0 ? (
        <div className="list-empty">
          <div className="list-empty-icon">
            <MdImage />
          </div>
          <h3>No Banners Found</h3>
          <p>Get started by creating your first banner.</p>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Text (EN)</th>
                  <th>Text (KN)</th>
                  <th>Description (EN)</th>
                  <th>Description (KN)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sliders?.result?.map((slider: Slide) => (
                  <tr key={slider._id}>
                    <td>
                      <div className="table-img">
                        <Image
                          src={slider.sliderImage}
                          alt="Banner"
                          width={80}
                          height={50}
                        />
                      </div>
                    </td>
                    <td><span className="text-truncate">{slider.text?.en || 'N/A'}</span></td>
                    <td><span className="text-truncate">{slider.text?.kn || 'N/A'}</span></td>
                    <td><span className="text-truncate">{slider.description?.en || 'N/A'}</span></td>
                    <td><span className="text-truncate">{slider.description?.kn || 'N/A'}</span></td>
                    <td>
                      <div className="table-actions">
                        <Link
                          href={`/super-admin/banners/update-banner/${slider._id}`}
                          className="action-edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedSliderId(slider._id);
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
        message="Are you sure you want to delete this slider?"
        id={selectedSliderId || undefined}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowModal(false);
          setSelectedSliderId(null);
        }}
      />
    </div>
  );
};

export default BannersList;