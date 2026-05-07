"use client";

import Loader from "@/(common)/Loader";
import { useGetUsersQuery } from "@/(store)/services/user/userApi";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import { PAGE_PER_ITEMS } from "@/utils/const";
import { Users } from "@/utils/Types";
import { useEffect, useState } from "react";
import { FaUsers } from "react-icons/fa";



export default function UserLists() {
      const [page, setPage] = useState(1) 
  const { data: userData, isLoading: ambassadorLoading } = useGetUsersQuery({
    page: page,
    limit: PAGE_PER_ITEMS,
    role: 'user'
  });


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
  const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

  return (
    <div className="ambassa_outer outer_wrapper">
      <div className="ambassa_inner">
        <div className="ambassa_wrapper">
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {userData?.users.map((ele: Users, index: number) => (
                  <tr key={ele._id}>
                    <td>{index + 1}</td>
                    <td>{ele.name}</td>
                    <td>{ele.email}</td>
                    <td>{ele.phoneNumber}</td>
                    <td className={`role-cell ${ele.role}`}>{ele.role}</td>
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


