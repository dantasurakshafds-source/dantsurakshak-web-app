"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface AdminSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  width?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdminSearchBar({
  value,
  onChange,
  placeholder = "Search...",
  width = "450px",
  className = "",
  style = {},
}: AdminSearchBarProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "rgb(255, 255, 255)",
        padding: "14px 12px",
        borderRadius: "6px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "rgb(229, 231, 235)",
        width,
        maxWidth: "100%",
        boxSizing: "border-box",
        transition: "border-color 0.2s, box-shadow 0.2s",
        ...style,
      }}
    >
      <Search size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: "none",
          outline: "none",
          backgroundColor: "transparent",
          fontSize: "13px",
          color: "#1f2937",
          width: "100%",
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            display: "flex",
            alignItems: "center",
            color: "#9ca3af",
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

