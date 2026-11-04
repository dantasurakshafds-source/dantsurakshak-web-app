import React from "react";

interface AdminEmptyStateProps {
  searchTerm?: string;
  defaultMessage?: string;
  colSpan?: number;
  isTableRow?: boolean;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  searchTerm = "",
  defaultMessage = "No records found.",
  colSpan = 9,
  isTableRow = true,
}) => {
  const isSearching = Boolean(searchTerm && searchTerm.trim().length > 0);

  const message = isSearching ? (
    <span>
      No record found matching &ldquo;{searchTerm}&rdquo;.
    </span>
  ) : (
    <span>{defaultMessage}</span>
  );

  if (isTableRow) {
    return (
      <tr>
        <td
          colSpan={colSpan}
          style={{
            textAlign: "center",
            padding: "32px 16px",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          {message}
        </td>
      </tr>
    );
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 16px",
        color: "#6b7280",
        fontSize: "14px",
      }}
    >
      {message}
    </div>
  );
};
