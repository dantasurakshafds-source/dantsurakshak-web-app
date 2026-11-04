"use client";

import { useGetUsersQuery } from "@/(store)/services/user/userApi";
import { useEffect, useState, useMemo } from "react";
import { Users } from "@/utils/Types";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import { FaUserTie } from "react-icons/fa";
import Loader from "@/(common)/Loader";
import AdminPagination from "@/(common)/AdminPagination";
import AdminSearchBar from "@/(common)/AdminSearchBar";
import { AdminEmptyState } from "@/(common)/AdminEmptyState";
import { PAGE_PER_ITEMS } from "@/utils/const";



export default function ManageAmbassadors() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: ambassadorData, isLoading: ambassadorLoading, refetch: refetchAmbassadors } = useGetUsersQuery({
    page: page,
    limit: PAGE_PER_ITEMS,
    role: 'dantasurakshaks'
  });

  const filteredAmbassadors = useMemo(() => {
    const list: Users[] = ambassadorData?.users ?? [];
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (a: Users) =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        String(a.phoneNumber || "").toLowerCase().includes(q)
    );
  }, [ambassadorData?.users, searchTerm]);
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

  return (
    <div className="ambassa_outer outer_wrapper">
      <div className="ambassa_inner">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <AdminSearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
            placeholder="Search ambassadors by name, email, phone..."
          />
        </div>
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
                {filteredAmbassadors.length > 0 ? (
                  filteredAmbassadors.map((ele: Users, index: number) => (
                    <tr key={ele._id}>
                      <td>{(page - 1) * PAGE_PER_ITEMS + index + 1}</td>
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
                  ))
                ) : (
                  <AdminEmptyState
                    searchTerm={searchTerm}
                    defaultMessage="No dental experts found."
                    colSpan={7}
                  />
                )}
              </tbody>
            </table>

          </div>
        </div>

        <AdminPagination
          currentPage={page}
          totalPages={totalPages}
          totalResults={totalResults}
          onPageChange={setPage}
          threshold={10}
        />
      </div>
    </div>
  );
}

