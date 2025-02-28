// AddResourceModal.jsx

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const AddResourceModal = ({ courseId, onClose, onAddResource }) => {
  const [resourceData, setResourceData] = useState({
    title: "",
    file: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResourceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setResourceData((prev) => ({
      ...prev,
      file: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", resourceData.title);
    formData.append("courseId", courseId); 
    if (resourceData.file) {
      formData.append("file", resourceData.file);
    }

    
    try {
      await onAddResource(formData);
      alert("Added resource successfully!");  // Thông báo thêm resource thành công

      onClose();
      window.location.reload();  // Tự động load lại trang

    } catch (error) {
      console.error("Error uploading resource:", error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="btn">
        <button className="close-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        </div>
        <h3>Upload New Resource</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={resourceData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>File</label>
            <input
              type="file"
              name="file"
              onChange={handleFileChange}
              required
            />
          </div>
          <button type="upload-btn">Upload</button>
        </form>
      </div>
    </div>
  );
};

export default AddResourceModal;
