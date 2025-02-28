import React, { useState } from "react";
import { AssignmentData } from "../../context/AssignmentContext";
import "./updateAssignmentModal.css";

const UpdateAssignmentModal = ({ assignment, assignmentId, onClose }) => {
  const { updateAssignment } = AssignmentData();

  // Chuyển đổi định dạng ngày giờ sang định dạng phù hợp với datetime-local
  const formatDateTimeLocal = (dateTime) => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const [title, setTitle] = useState(assignment.title);
  const [description, setDescription] = useState(assignment.description);
  const [startDate, setStartDate] = useState(formatDateTimeLocal(assignment.startDate));
  const [dueDate, setDueDate] = useState(formatDateTimeLocal(assignment.dueDate));
  const [type, setType] = useState(assignment.type);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedAssignment = {
      title,
      description,
      startDate,
      dueDate,
      type,
    };
    await updateAssignment(assignmentId, updatedAssignment); // Sử dụng assignmentId
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Update Assignment</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <label htmlFor="startDate">Start Date</label>
          <input
            type="datetime-local"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <label htmlFor="dueDate">Due Date</label>
          <input
            type="datetime-local"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <label htmlFor="type">Type</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="assignment">Assignment</option>
            <option value="quiz">Quiz</option>
          </select>

          <div className="button-group">
            <button type="submit" className="common-btn">
              Update
            </button>
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAssignmentModal;