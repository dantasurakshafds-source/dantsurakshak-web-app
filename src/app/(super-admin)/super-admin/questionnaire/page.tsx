'use client';

import React, { useEffect, useState } from 'react';
import Loader from '@/(common)/Loader';
import { useGetQuestionnaireQuery } from '@/(store)/services/questionnaire/questionnaireApi';
import { useBreadcrumb } from '@/provider/BreadcrumbContext';
import { PAGE_PER_ITEMS } from '@/utils/const';
import { FaBook } from 'react-icons/fa';
import { FeedbackButton } from './ShowFeedback';
import { Questionnaire } from '@/utils/Types';

export default function QuestionnaireList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetQuestionnaireQuery({ page, limit: PAGE_PER_ITEMS });
  const { setRightContent } = useBreadcrumb();

  const allQuestionnaires: Questionnaire[] = data?.data || [];
  
  //@ts-expect-error ignore this message
  const submittedList = allQuestionnaires.filter(q => q.status === 'submit');
  const showSubmitPanel = submittedList.length > 0;
  

  useEffect(() => {
    if (!data) return;

    setRightContent(
      <div className="total-count-wrapper">
        <i><FaBook size={18} color="#56235E" /></i>
        {showSubmitPanel && (
          <span className="total-count">{submittedList.length} Questionnaire</span>
        )}
      </div>
    );

    return () => setRightContent(null);
  }, [data, setRightContent, showSubmitPanel, submittedList.length]);

  if (isLoading) return <Loader />;
  if (isError) return <p className="lesion-status error">Failed to load questionnaire.</p>;

  const totalResults = data.totalResults;
  const totalPages = Math.ceil(totalResults / PAGE_PER_ITEMS);
  const shouldShowPagination = totalResults > PAGE_PER_ITEMS;

  return (
    <div className="lesion-wrapper">
      {showSubmitPanel && (
        <>
          <div className="lesion-table-container">
            <table className="lesion-table">
              <thead>
                <tr>
                  <th>Submitted By (Dantasurakshaks)</th>
                  <th>Assign To (Admin)</th>
                  <th>Feedback By (Admin)</th>
                  <th>Patient Name</th>
                  <th>Patient Number</th>
                  <th>Age</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {submittedList.map(el => (
                  <tr key={el._id}>
                    <td>
                      {el.submitted_by ? el.submitted_by.name : 'Not found'}
                      {' ('}{el.submitted_by ? el.submitted_by.phoneNumber : 'Not found'}{')'}
                    </td>
                    <td>
                      {el.assignTo ? el.assignTo.name : 'Not found'}
                      {' ('}{el.assignTo ? el.assignTo.phoneNumber : 'Not found'}{')'}
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
                    <td>{new Date(el.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {shouldShowPagination && (
            <div className="pagination_steps">
              <div className="pagination-controls mt-4 flex items-center justify-center space-x-4">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 border rounded ${page === 1 ? 'disable_prev opacity-50' : ''}`}
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`px-3 py-1 border rounded ${page === totalPages ? 'disable_next opacity-50' : ''}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
