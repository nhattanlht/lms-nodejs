import { createContext, useContext, useState } from "react";
import axios from "axios";
import { server } from "../main";
import toast from "react-hot-toast";

const AssignmentContext = createContext();

export const AssignmentContextProvider = ({ children }) => {
  const [assignments, setAssignments] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [courses, setCourses] = useState([]);

  const fetchInstructorAssignments = async (courseId) => {
    try {
      const { data } = await axios.get(`${server}/api/assignments/course/${courseId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setAssignments(data.assignments);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStudentAssignments = async (courseId) => {
    try {
      const { data } = await axios.get(`${server}/api/assignments/course/${courseId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setAssignments(data.assignments);
      return data.assignments;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchAssignment = async (assignmentId) => {
    try {
      const { data } = await axios.get(`${server}/api/assignments/${assignmentId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setAssignment(data.assignment);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${server}/api/courses`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setCourses(data.courses);
    } catch (error) {
      console.log(error);
    }
  };

  const addAssignment = async (formData, onClose) => {
    try {
      const { data } = await axios.post(`${server}/api/assignments`, formData, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      toast.success(data.message);
      setAssignments((prevAssignments) => [...prevAssignments, data.assignment]);
      onClose();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const updateAssignment = async (assignmentId, updatedAssignment) => {
    try {
      const { data } = await axios.put(`${server}/api/assignments/${assignmentId}`, updatedAssignment, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      toast.success(data.message);
      setAssignment(data.assignment);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const deleteAssignment = async (assignmentId) => {
    try {
      const { data } = await axios.delete(`${server}/api/assignments/${assignmentId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      toast.success(data.message);
      setAssignments(assignments.filter((assignment) => assignment._id !== assignmentId));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // const submitAssignment = async (formData) => {
  //   try {
  //     const { data } = await axios.post(`${server}/api/assignment/submit`, formData, {
  //       headers: {
  //         token: localStorage.getItem("token"),
  //       },
  //     });
  //     toast.success(data.message);
  //     setAssignment((prevAssignment) => ({
  //       ...prevAssignment,
  //       submissions: [...prevAssignment.submissions, data.submission],
  //     }));
  //   } catch (error) {
  //     toast.error(error.response.data.message);
  //   }
  // };

  return (
    <AssignmentContext.Provider
      value={{
        assignments,
        assignment,
        courses,
        fetchInstructorAssignments,
        fetchStudentAssignments,
        fetchAssignment,
        fetchCourses,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        //submitAssignment,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};

export const AssignmentData = () => useContext(AssignmentContext);