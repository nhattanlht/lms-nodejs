import React, { useEffect, useState, useRef } from "react";
import { SubmissionsData } from "../../context/SubmissionsContext";
import "./enterGradeModal.css";

const EnterGradeModal = ({ courseId, assignments, selectedAssignment, onAssignmentChange, onClose }) => {
  const { submissions, fetchSubmissions, updateSubmissionGrade } = SubmissionsData();
  const [grades, setGrades] = useState({});
  const isFirstLoad = useRef(true); // Sử dụng useRef để theo dõi lần load đầu tiên

  useEffect(() => {
    if (selectedAssignment) {
      fetchSubmissions(selectedAssignment);
    }
  }, [selectedAssignment, fetchSubmissions]);

  useEffect(() => {
    // Chỉ cập nhật grades khi lần đầu tiên nhận được submissions
    if (submissions.length > 0 && isFirstLoad.current) {
      const initialGrades = submissions.reduce((acc, submission) => {
        acc[submission._id] = {
          grade: submission.grade || "",
          comment: submission.comment || "",
        };
        return acc;
      }, {});
      setGrades(initialGrades);
      isFirstLoad.current = false; // Đánh dấu đã load xong lần đầu
    }
  }, [submissions]);

  const handleGradeChange = (submissionId, grade) => {
    setGrades(prevGrades => ({
      ...prevGrades,
      [submissionId]: { ...prevGrades[submissionId], grade }
    }));
  };

  const handleCommentChange = (submissionId, comment) => {
    setGrades(prevGrades => ({
      ...prevGrades,
      [submissionId]: { ...prevGrades[submissionId], comment }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const submissionId in grades) {
      await updateSubmissionGrade(submissionId, grades[submissionId]);
    }
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Enter Grades</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="assignment">Select Assignment</label>
            <select id="assignment" value={selectedAssignment} onChange={onAssignmentChange} required>
              <option value="">--Select Assignment--</option>
              {assignments.map((assignment) => (
                <option key={assignment._id} value={assignment._id}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>
          {selectedAssignment && (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>File</th>
                    <th>Grade</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission._id}>
                      <td>{submission.student.name}</td>
                      <td>
                        <a href={submission.fileUrl} download target="_blank" rel="noopener noreferrer">
                          Open file
                        </a>
                      </td>
                      <td>
                        <input
                          type="number"
                          value={grades[submission._id]?.grade || ""}
                          onChange={(e) => handleGradeChange(submission._id, e.target.value)}
                          min="0"
                          max="100"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={grades[submission._id]?.comment || ""}
                          onChange={(e) => handleCommentChange(submission._id, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="button-group">
                <button type="submit" className="common-btn">Save Grades</button>
                <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EnterGradeModal;