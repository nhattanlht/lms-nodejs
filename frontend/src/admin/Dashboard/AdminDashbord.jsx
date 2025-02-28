import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Utils/Layout";
import axios from "axios";
import { server } from "../../main";
import "./dashboard.css";
import { FaBell } from "react-icons/fa"; 
import toast from "react-hot-toast";

const AdminDashbord = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.mainrole !== "admin") return navigate("/");

  const [stats, setStats] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("allUsers");
  const [specificRecipients, setSpecificRecipients] = useState("");
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 

  async function fetchStats() {
    try {
      const { data } = await axios.get(`${server}/api/stats`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setStats(data.stats);
    } catch (error) {}
  }

  const handleSendNotification = async () => {
    try {
      const formData = new FormData();
      formData.append("recipientType", recipientType);
      formData.append("subject", subject);
      formData.append("message", message);
      if (recipientType === "specific") {
        formData.append("specificRecipients", specificRecipients);
      }
      if (file) {
        formData.append("file", file);
      }

      const { data } = await axios.post(`${server}/api/notification`, formData, {
        headers: {
          token: localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(data);
      toast.success("Notification sent successfully!");
      setIsModalOpen(false); 
    } catch (error) {
      console.error("Error sending notification:", error.response?.data || error.message);
      toast.error("Failed to send notification!");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); 
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
  <div>
    <Layout>
      <div className="dashboard-main-content">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <div className="dashboard-stats">
          <div className="dashboard-box">
            <p className="stat-title">Total Courses</p>
            <p className="stat-value">{stats.totalCourses}</p>
          </div>

          <div className="dashboard-box">
            <p className="stat-title">Total Users</p>
            <p className="stat-value">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Nút mở modal */}
        <div className="main-content">
          <button onClick={openModal} className="open-modal-button">
          <div className ="ic">
            <FaBell />
          Send Notification 
          
          </div>

          </button>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>Send Notification</h3>
              <div>
                <label>Subject:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter notification subject"
                />
              </div>
              <div>
                <label>Message:</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message"
                />
              </div>
              <div>
                <label>Recipient Type:</label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                >
                  <option value="allUsers">All Users</option>
                  <option value="allLecturers">All Lecturers</option>
                  <option value="allStudents">All Students</option>
                  <option value="specific">Specific Emails</option>
                </select>
              </div>
              {recipientType === "specific" && (
                <div>
                  <label>Specific Recipients (comma separated emails):</label>
                  <input
                    type="text"
                    value={specificRecipients}
                    onChange={(e) => setSpecificRecipients(e.target.value)}
                    placeholder="Enter emails"
                  />
                </div>
              )}
              <div>
                <label>File (optional):</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <div className="modal-buttons">
                <button onClick={handleSendNotification}>Send</button>
                <button onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        </div>
    </Layout>
  </div>
  );
};

export default AdminDashbord;
