'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Loader from '@/(common)/Loader';
import { useGetQuestionnaireQuery } from '@/(store)/services/questionnaire/questionnaireApi';
import { useBreadcrumb } from '@/provider/BreadcrumbContext';
import { PAGE_PER_ITEMS } from '@/utils/const';
import { FaBook } from 'react-icons/fa';
import { FeedbackButton } from './ShowFeedback';
import { Questionnaire } from '@/utils/Types';
import AdminPagination from '@/(common)/AdminPagination';
import AdminSearchBar from '@/(common)/AdminSearchBar';
import { AdminEmptyState } from '@/(common)/AdminEmptyState';

export default function QuestionnaireList() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, isError } = useGetQuestionnaireQuery({ page, limit: PAGE_PER_ITEMS });
  const { setRightContent } = useBreadcrumb();

  const allQuestionnaires: Questionnaire[] = useMemo(() => data?.data || [], [data?.data]);

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return allQuestionnaires;
    const q = searchTerm.toLowerCase();
    return allQuestionnaires.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.phoneNumber?.toLowerCase().includes(q) ||
        item.submitted_by?.name?.toLowerCase().includes(q) ||
        item.assignTo?.name?.toLowerCase().includes(q)
    );
  }, [allQuestionnaires, searchTerm]);

  useEffect(() => {
    if (!data) return;

    setRightContent(
      <div className="total-count-wrapper">
        <i><FaBook size={18} color="#56235E" /></i>
        <span className="total-count">{data.totalResults || allQuestionnaires.length} Questionnaire</span>
      </div>
    );

    return () => setRightContent(null);
  }, [data, setRightContent, allQuestionnaires.length]);

  if (isLoading) return <Loader />;
  if (isError) return <p className="lesion-status error">Failed to load questionnaire.</p>;

  const totalResults = data?.totalResults ?? allQuestionnaires.length;
  const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);

  return (
    <div className="lesion-wrapper">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <AdminSearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setPage(1);
          }}
          placeholder="Search questionnaires by patient, phone..."
        />
      </div>

      <div className="lesion-table-container">
        <table className="lesion-table">
          <thead>
            <tr>
              <th>S.N.</th>
              <th>Submitted By (Dantasurakshaks)</th>
              <th>Assign To (Admin)</th>
              <th>Feedback By (Admin)</th>
              <th>Patient Name</th>
              <th>Patient Number</th>
              <th>Age</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredList && filteredList.length > 0 ? (
              filteredList.map((el, idx) => (
                <tr key={el._id}>
                  <td>{(page - 1) * PAGE_PER_ITEMS + idx + 1}</td>
                  <td>
                    {el.submitted_by ? (
                      <div>
                        <div style={{ fontWeight: 600, color: "#1f2937" }}>{el.submitted_by.name || "N/A"}</div>
                        {el.submitted_by.phoneNumber && (
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>{el.submitted_by.phoneNumber}</div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>N/A</span>
                    )}
                  </td>
                  <td>
                    {el.assignTo ? (
                      <div>
                        <div style={{ fontWeight: 600, color: "#1f2937" }}>{el.assignTo.name || "Admin"}</div>
                        {el.assignTo.phoneNumber ? (
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>{el.assignTo.phoneNumber}</div>
                        ) : (
                          <div style={{ fontSize: "11.5px", color: "#9ca3af" }}>No phone</div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#9ca3af", fontStyle: "italic", fontSize: "12.5px" }}>
                        Not Assigned
                      </span>
                    )}
                  </td>
                  <td>
                    {el.send_email_to_dantasurakshaks ? (
                      <FeedbackButton el={el} />
                    ) : (
                      'No Feedback Found'
                    )}
                  </td>
                  <td>{el.name}</td>
                  <td>{el.phoneNumber}</td>
                  <td>{el.age}</td>
                  <td>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        backgroundColor: el.status === "submit" ? "#dcfce7" : "#fef3c7",
                        color: el.status === "submit" ? "#166534" : "#92400e",
                        textTransform: "capitalize",
                      }}
                    >
                      {el.status || "unsubmit"}
                    </span>
                  </td>
                  <td>{new Date(el.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <AdminEmptyState
                searchTerm={searchTerm}
                defaultMessage="No questionnaires found."
                colSpan={9}
              />
            )}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
