"use client";

import { useGetUsersQuery } from "@/(store)/services/user/userApi";
import { useEffect, useState } from "react";
import { Users } from "@/utils/Types";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import { FaUserTie } from "react-icons/fa";
import Loader from "@/(common)/Loader";
import { PAGE_PER_ITEMS } from "@/utils/const";



export default function ManageAmbassadors() {
  const [page, setPage] = useState(1)
  const { data: ambassadorData, isLoading: ambassadorLoading, refetch: refetchAmbassadors } = useGetUsersQuery({
    page: page,
    limit: PAGE_PER_ITEMS,
    role: 'dantasurakshaks'
  });
  const { setRightContent } = useBreadcrumb();
  useEffect(() => {
    if (!ambassadorData) return;

    setRightContent(
      <div className="total-count-wrapper">
        <i><FaUserTie size={18} color="#56235E" /></i>
        <span className="total-count">{ambassadorData.total} Ambassadors</span>
      </div>
    );

    return () => setRightContent(null);
  }, [ambassadorData, setRightContent, page]);

  const [actionLoading, setActionLoading] = useState(false);

  const updateUser = async (id: string, action: "approved" | "rejected", currentRole: string) => {
    setActionLoading(true);
    const body = {
      status: action,
      role: action === "approved"
        ? (currentRole === "admin" || currentRole === "dantasurakshaks" ? currentRole : "admin")
        : "user"
    };

    try {
      const res = await fetch(`/api/auth/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        refetchAmbassadors();
      } else {
        alert(data.error || "Failed to update user.");
      }
    } catch (err) {
      if (err instanceof Error) {

        alert(err.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (ambassadorLoading) return <Loader />;

  const totalResults = ambassadorData?.total ?? 0;
  const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);
  const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

  return (
    <div className="ambassa_outer outer_wrapper">
      <div className="ambassa_inner">
        <div className="ambassa_wrapper">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>S.N.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ambassadorData?.users.map((ele: Users, index: number) => (
                  <tr key={ele._id}>
                    <td>{index + 1}</td>
                    <td>{ele.name}</td>
                    <td>{ele.email}</td>
                    <td>{ele.phoneNumber}</td>
                    <td>{ele.role}</td>
                    <td>{ele.status}</td>
                    <td>
                      <div className="aprove-reject-buttons">
                        <button
                          disabled={actionLoading || ele.status !== 'pending'}
                          onClick={() => updateUser(ele._id, 'approved', ele.role)}
                          className={`approve-btn ${ele.status === 'approved' ? 'disabled' : ''}`}
                        >
                          Approved
                        </button>
                        <button
                          disabled={actionLoading || ele.status !== 'pending'}
                          onClick={() => updateUser(ele._id, 'rejected', ele.role)}
                          className={`reject-btn ${ele.status === 'rejected' ? 'disabled' : ''}`}
                        >
                          Rejected
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>

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
    </div>
  );
}

