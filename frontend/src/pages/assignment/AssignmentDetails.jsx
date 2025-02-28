import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AssignmentData } from "../../context/AssignmentContext";
import UpdateAssignmentModal from "./UpdateAssignmentModal";
import Submissions from "./Submissions";
import "./assignmentDetails.css";

const AssignmentDetails = ({ user }) => {
  const { assignmentId } = useParams();
  const { assignment, fetchAssignment, deleteAssignment } = AssignmentData();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignment(assignmentId);
  }, [assignmentId, fetchAssignment]);

  const handleUpdateClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      await deleteAssignment(assignmentId);
      navigate(`/course/study/${assignment.courseId}`);
    }
  };

  return (
    <div className="assignment-details">
      {assignment ? (
        <>
          <div className="assignment-info">
            <h2>{assignment.title}</h2>
            <p>{assignment.description}</p>
            <p>
              Start Date: {new Date(assignment.startDate).toLocaleString()}
            </p>
            <p>Due Date: {new Date(assignment.dueDate).toLocaleString()}</p>
            <p>Course ID: {assignment.courseId}</p>
            <p>Instructor: {assignment.instructor.name}</p>
            <div className="button-group">
              <a
                href={assignment.instructorFile}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="common_ass-btn"
              >
                Download File
              </a>
              {user && user.role === "lecturer" && (
                <>
                  <button onClick={handleUpdateClick} className="common_ass-btn">
                    Update Assignment
                  </button>
                  <button onClick={handleDelete} className="delete_ass-btn">
                    Delete Assignment
                  </button>
                </>
              )}
            </div>
          </div>
          <Submissions user={user} assignmentId={assignmentId} dueDate={assignment.dueDate} />
          {user && user.role === "lecturer" && assignment.submissions?.length === 0 && (
            <p>No submissions</p>
          )}
          {showModal && (
            <UpdateAssignmentModal
              assignment={assignment}
              assignmentId={assignmentId} // Truyền assignmentId vào modal
              onClose={handleCloseModal}
            />
          )}
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AssignmentDetails;
