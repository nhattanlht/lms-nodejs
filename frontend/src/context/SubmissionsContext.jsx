import { createContext, useContext, useState } from "react";
import axios from "axios";
import { server } from "../main";
import toast from "react-hot-toast";

const SubmissionsContext = createContext();

export const SubmissionsContextProvider = ({ children }) => {
  const [submissions, setSubmissions] = useState([]);

  const fetchSubmissions = async (assignmentId) => {
    try {
      const { data } = await axios.get(`${server}/api/submissions/assignment/${assignmentId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setSubmissions(data.submissions);
      return data.submissions; // Trả về dữ liệu submissions
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  };

  const updateSubmissionGrade = async (submissionId, { grade, comment }) => {
    try {
      const { data } = await axios.patch(`${server}/api/submissions/${submissionId}`, { grade, comment }, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      toast.success(data.message);
      fetchSubmissions(data.submission.assignmentId); // Fetch submissions again after updating
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const getSubmissionDetails = async (submissionId) => {
    try {
      const { data } = await axios.get(`${server}/api/submissions/${submissionId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      return data.submission; // Trả về chi tiết submission
    } catch (error) {
      console.error("Error fetching submission details:", error);
    }
  };

  const submitAssignment = async (formData) => {
    try {
      const { data } = await axios.post(`${server}/api/submissions`, formData, {
        headers: {
          token: localStorage.getItem("token"),
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(data.message);
      fetchSubmissions(formData.get("assignmentId")); // Fetch submissions again after submitting
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <SubmissionsContext.Provider
      value={{
        submissions,
        fetchSubmissions,
        submitAssignment,
        getSubmissionDetails,
        updateSubmissionGrade,
      }}
    >
      {children}
    </SubmissionsContext.Provider>
  );
};

export const SubmissionsData = () => useContext(SubmissionsContext);