"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults?: number;
  onPageChange: (page: number) => void;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  style = {},
}: AdminPaginationProps) {
  // Only display pagination if more than 1 page exists
  if (totalPages <= 1) {
    return null;
  }

  // Generate numbered pages with ellipsis
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Pagination"
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        marginTop: "24px",
        marginBottom: "16px",
        flexWrap: "wrap",
        ...style,
      }}
    >
      {/* First Button */}
      <button
        type="button"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        title="First Page"
        style={{
          ...btnBase,
          opacity: currentPage === 1 ? 0.45 : 1,
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
      >
        <ChevronsLeft size={14} />
        <span>First</span>
      </button>

      {/* Prev Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="Previous Page"
        style={{
          ...btnBase,
          opacity: currentPage === 1 ? 0.45 : 1,
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
      >
        <ChevronLeft size={14} />
        <span>Prev</span>
      </button>

      {/* Page Numbers */}
      {pages.map((p, idx) => {
        if (p === "...") {
          return (
            <span
              key={`ellipsis-${idx}`}
              style={{
                padding: "4px 8px",
                fontSize: "13px",
                color: "#9ca3af",
                userSelect: "none",
              }}
            >
              ...
            </span>
          );
        }

        const isCurrent = p === currentPage;
        return (
          <button
            key={`page-${p}`}
            type="button"
            onClick={() => onPageChange(Number(p))}
            style={{
              ...numBtnBase,
              backgroundColor: isCurrent ? "#56235E" : "#ffffff",
              color: isCurrent ? "#ffffff" : "#374151",
              borderColor: isCurrent ? "#56235E" : "#e5e7eb",
              fontWeight: isCurrent ? 700 : 500,
            }}
          >
            {p}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="Next Page"
        style={{
          ...btnBase,
          opacity: currentPage === totalPages ? 0.45 : 1,
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        }}
      >
        <span>Next</span>
        <ChevronRight size={14} />
      </button>

      {/* Last Button */}
      <button
        type="button"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        title="Last Page"
        style={{
          ...btnBase,
          opacity: currentPage === totalPages ? 0.45 : 1,
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        }}
      >
        <span>Last</span>
        <ChevronsRight size={14} />
      </button>
    </nav>
  );
}

const btnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "6px 12px",
  borderRadius: "6px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#e5e7eb",
  backgroundColor: "#ffffff",
  color: "#374151",
  fontSize: "12.5px",
  fontWeight: 600,
  transition: "all 0.15s ease",
};

const numBtnBase: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "34px",
  height: "34px",
  padding: "0 8px",
  borderRadius: "6px",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#e5e7eb",
  fontSize: "13px",
  cursor: "pointer",
  transition: "all 0.15s ease",
};

