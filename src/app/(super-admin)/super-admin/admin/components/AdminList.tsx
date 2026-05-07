// "use client";

// import { useGetUsersQuery } from "@/(store)/services/user/userApi";
// import { useState } from "react";
// import { UserCheck } from "lucide-react";
// import { Users } from "@/utils/Types";



// export default function AdminLists() {
//   const { data: adminData, isLoading: ambassadorLoading, refetch: refetchAmbassadors } = useGetUsersQuery({
//     page: 1,
//     limit: 15,
//     role: 'admin'
//   });

//   const [actionLoading, setActionLoading] = useState(false);

//   const updateUser = async (id: string, action: "approved" | "rejected", currentRole: string) => {
//     setActionLoading(true);
//     const body = {
//       status: action,
//       role: action === "approved"
//         ? (currentRole === "admin" || currentRole === "ambassador" ? currentRole : "admin")
//         : "user"
//     };

//     try {
//       const res = await fetch(`/api/auth/users/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         refetchAmbassadors();
//       } else {
//         alert(data.error || "Failed to update user.");
//       }
//     } catch (err) {
//       if(err instanceof Error){

//         alert(err.message);
//       }
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   if (ambassadorLoading) return <p>Loading...</p>;

//   return (
//     <div className="ambassa_outer outer_wrapper">
//       <div className="ambassa_inner">
//         <div className="ambassa_wrapper">
//           <h2 className="flex items-center gap-2 text-lg font-bold">
//             <UserCheck size={20} /> Admins
//           </h2>

//           <div className="ambass_wrapper">
//             {adminData?.users.map((ele: Users) => (
//               <div key={ele._id} className="s_ambassa border p-3 mb-4 rounded shadow">
//                 <ul className="ambass_list u_lists">
//                   <li><strong>Name:</strong> {ele.name}</li>
//                   <li><strong>Email:</strong> {ele.email}</li>
//                   <li><strong>Phone:</strong> {ele.phoneNumber}</li>
//                   <li><strong>Role:</strong> {ele.role}</li>
//                   <li><strong>Status:</strong> {ele.status}</li>
//                 </ul>

//                 <div className="actions mt-2">
//                   <button
//                     disabled={actionLoading || ele.status !== 'pending'}
//                     onClick={() => updateUser(ele._id, 'approved', ele.role)}
//                     style={{
//                       marginRight: '10px',
//                       backgroundColor: ele.status === 'approved' ? 'gray' : 'green',
//                       color: '#fff',
//                       padding: '5px 10px',
//                       cursor: ele.status === 'pending' ? 'pointer' : 'not-allowed'
//                     }}
//                   >
//                     Approve
//                   </button>

//                   <button
//                     disabled={actionLoading || ele.status !== 'pending'}
//                     onClick={() => updateUser(ele._id, 'rejected', ele.role)}
//                     style={{
//                       backgroundColor: ele.status === 'rejected' ? 'gray' : 'red',
//                       color: '#fff',
//                       padding: '5px 10px',
//                       cursor: ele.status === 'pending' ? 'pointer' : 'not-allowed'
//                     }}
//                   >
//                     Reject
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }







"use client";

import { useGetUsersQuery } from "@/(store)/services/user/userApi";
import { useEffect, useState } from "react";
import { useBreadcrumb } from "@/provider/BreadcrumbContext";
import { FaUserShield } from "react-icons/fa";
import Loader from "@/(common)/Loader";
import { PAGE_PER_ITEMS } from "@/utils/const";



export default function AdminLists() {
  const [page, setPage] = useState(1)
  const { data: adminData, isLoading: ambassadorLoading, refetch: refetchAmbassadors } = useGetUsersQuery({
    page: page,
    limit: PAGE_PER_ITEMS,
    role: 'admin'
  });
  const { setRightContent } = useBreadcrumb();
  useEffect(() => {
    if (!adminData) return;

    setRightContent(
      <div className="total-count-wrapper">
        <i><FaUserShield size={18} color="#56235E" /></i>
        <span className="total-count">{adminData.total} Admins</span>
      </div>
    );

    return () => setRightContent(null);
  }, [adminData, setRightContent, page]);

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
 
  const totalResults = adminData?.total ?? 0;
  const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);
  const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

  return (
    <div className="ambassa_outer outer_wrapper">
      <div className="ambassa_inner">
        <div className="ambassa_wrapper">
          <div className="admin-table-outer" style={{ overflowX: "auto" }}>
            <table className="admin_table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminData?.users.map((ele) => (
                  <tr key={ele._id}>
                    <td>{ele.name}</td>
                    <td>{ele.email}</td>
                    <td>{ele.phoneNumber}</td>
                    <td className={`role-cell ${ele.role}`}>{ele.role}</td>
                    <td className={`status-cell ${ele.status}`}>{ele.status}</td>

                    <td>
                      <div className="aprove-reject-buttons">
                        <button
                          disabled={actionLoading || ele.status !== 'pending'}
                          onClick={() => updateUser(ele._id, 'approved', ele.role)}
                          className={`approve_btn ${ele.status !== 'pending' ? 'disabled' : ''}`}
                        >
                          Approved
                        </button>
                        <button
                          disabled={actionLoading || ele.status !== 'pending'}
                          onClick={() => updateUser(ele._id, 'rejected', ele.role)}
                          className={`reject_btn ${ele.status !== 'pending' ? 'disabled' : ''}`}
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
