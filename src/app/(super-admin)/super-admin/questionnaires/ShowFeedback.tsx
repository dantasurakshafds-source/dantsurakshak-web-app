
import { Questionnaire } from '@/utils/Types';
import React, { useState } from 'react';
import { FaCommentAlt } from 'react-icons/fa';

export const FeedbackButton = ({ el }: { el: Questionnaire }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  return (
    <div className="feedback-container">
      <button
        className="feedback-btn"
        onClick={() => setShowFeedback(!showFeedback)}
      >
        <FaCommentAlt /> View Feedback
      </button>
      {showFeedback && (
        <div className="feedback-popup">
          <div className="popup-content">
            <button
              className="close-btn"
              onClick={() => setShowFeedback(false)}
            >
              ×
            </button>
            <div className="feedback_model_wrapper">
              <h1 className='feedback_heading_main'>{el.case_number ? el.case_number : 'Not Found'}<span>Questionary feedback given by {el.assignTo ? el.assignTo?.name : 'Not found'}</span></h1>
            </div>
            <div className="feed_wrapper">
              {el.questionary_type && (

                <div className="feed_outer">
                  <h4>Questionary Type:</h4>
                  <p>{el.questionary_type}</p>
                </div>

              )}
              {el.diagnosis_notes && (
                <div className="feed_outer">
                  <h4>Diagnosis Notes:</h4>
                  <p>{el.diagnosis_notes}</p>
                </div>
              )}
              {el.recomanded_actions && (
                <div className="feed_outer">
                  <h4> Recomanded Actions:</h4>
                  <p>{el.recomanded_actions}</p>
                </div>
              )}
              {el.comments_or_notes && (
                <div className="feed_outer">
                  <h4> Comments or Notes:</h4>
                  <p>{el.comments_or_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
