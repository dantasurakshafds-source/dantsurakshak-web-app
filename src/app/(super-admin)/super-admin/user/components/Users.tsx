"use client";

import Loader from "@/(common)/Loader";
import { useGetUsersQuery } from "@/(store)/services/user/userApi";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { Users } from "@/utils/Types";
import { useEffect, useState, useMemo } from "react";
import { FaUsers } from "react-icons/fa";
import AdminPagination from "@/(common)/AdminPagination";
import AdminSearchBar from "@/(common)/AdminSearchBar";
import { AdminEmptyState } from "@/(common)/AdminEmptyState";



export default function UserLists() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: userData, isLoading: ambassadorLoading } = useGetUsersQuery({
    page: page,
    limit: PAGE_PER_ITEMS,
    role: 'user'
  });

  const filteredUsers = useMemo(() => {
    const list: Users[] = userData?.users ?? [];
    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(
      (u: Users) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        String(u.phoneNumber || "").toLowerCase().includes(q)
    );
  }, [userData?.users, searchTerm]);


  const { setRightContent } = useBreadcrumb();
  useEffect(() => {
    if (!userData) return;

    setRightContent(
      <div className="total-count-wrapper">
        <i><FaUsers size={18} color="#56235E" /></i>
        <span className="total-count">{userData.total} Users</span>
      </div>
    );

    return () => setRightContent(null);
  }, [userData, setRightContent]);


  if (ambassadorLoading) return <Loader />;
 
   const totalResults = userData?.total ?? 0;
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
            placeholder="Search users by name, email, phone..."
          />
        </div>
        <div className="ambassa_wrapper">
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>S.N.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((ele: Users, index: number) => (
                    <tr key={ele._id}>
                      <td>{(page - 1) * PAGE_PER_ITEMS + index + 1}</td>
                      <td>{ele.name}</td>
                      <td>{ele.email}</td>
                      <td>{ele.phoneNumber}</td>
                      <td className={`role-cell ${ele.role}`}>{ele.role}</td>
                    </tr>
                  ))
                ) : (
                  <AdminEmptyState
                    searchTerm={searchTerm}
                    defaultMessage="No users found."
                    colSpan={5}
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


