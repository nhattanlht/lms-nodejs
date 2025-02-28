import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import "./coursestudy.css";
import {
  faEdit,
  faTrash,
  faDownload,
  faPencilAlt,
  faEye,
  faBell,
  faPlus,
  faComment,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddAssignmentModal from "../assignment/AddAssignmentModal";
import AddResourceModal from "../resource/AddResourceModal";

import { AssignmentData } from "../../context/AssignmentContext";
import axios from "axios";

import EnterGradeModal from "../assignment/EnterGradeModal";
import ViewGradeModal from "../assignment/ViewGradeModal";

const getDaysInMonth = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = new Array(42).fill(null);

  for (let i = 0; i < daysInMonth; i++) {
    days[i + firstDay] = i + 1;
  }

  return days;
};

const Calendar = ({ date, assignments }) => {
  // Create helper function to get assignment info for a day
  const getDueDatesInfo = (day) => {
    if (!day) return null;
    
    const dueAssignments = assignments.filter(assignment => {
      const dueDate = new Date(assignment.dueDate);
      return dueDate.getDate() === day &&
             dueDate.getMonth() === date.getMonth() &&
             dueDate.getFullYear() === date.getFullYear() &&
             dueDate >= new Date();
    });

    if (dueAssignments.length === 0) return null;

    // Create tooltip content
    const tooltipContent = dueAssignments.map(assignment => 
      `${assignment.title}\nDue: ${new Date(assignment.dueDate).toLocaleString()}`
    ).join('\n\n');

    return {
      hasDeadlines: true,
      count: dueAssignments.length,
      tooltip: tooltipContent
    };
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        {date.toLocaleString("default", { month: "long", year: "numeric" })}
      </div>
      <div className="calendar-weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      <div className="calendar-days">
        {getDaysInMonth(date.getFullYear(), date.getMonth()).map((day, index) => {
          const dateInfo = getDueDatesInfo(day);
          return (
            <div 
              key={index} 
              className={`day ${dateInfo?.hasDeadlines ? 'due-date' : ''}`}
              title={dateInfo?.tooltip || ''}
            >
              {day || ''}
              {dateInfo?.count > 1 && (
                <span className="deadline-count">{dateInfo.count}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CourseStudy = ({ user }) => {
  // const [role, setRole] = useState("A");
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const { fetchCourse, course } = CourseData();
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);

  const [showGradeModal, setShowGradeModal] = useState(false);
  const { assignments, fetchInstructorAssignments, fetchStudentAssignments } =
    AssignmentData();
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [showViewGradeModal, setShowViewGradeModal] = useState(false);
  const courseId = course._id;

  const [resources, setResources] = useState([]);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null); // Khai báo state cho tệp tin

  const [editingResource, setEditingResource] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  // Khi nhấn vào nút "Edit", lưu trữ ID của tài nguyên cần sửa

  const loadResources = async (courseID) => {
    try {
      const response = await axios.get(`${server}/api/resource/${params.id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setResources(response.data.resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const handleCreateResource = async (formData) => {
    try {
      const response = await axios.post(`${server}/api/resource`, formData, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setResources((prev) => [...prev, response.data.resource]);
      navigate(`/course/study/${params.id}`); // Chuyển hướng về trang chi tiết khóa học
      // Assuming response returns the created resource
    } catch (error) {
      console.error("Error creating resource:", error);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await axios.delete(`${server}/api/resource/${resourceId}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setResources((prev) => prev.filter((r) => r._id !== resourceId));
      alert("Deleted resource successfully!"); // Thông báo thêm resource thành công
      navigate(`/course/study/${params.id}`); // Chuyển hướng về trang chi tiết khóa học
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const handleEditResource = async (resourceId, updatedResource) => {
    if (!window.confirm("Are you sure you want to save changes?")) return;

    try {
      const response = await axios.put(
        `${server}/api/resource/${resourceId}`,
        updatedResource,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      setResources((prev) =>
        prev.map((r) => (r._id === resourceId ? response.data : r))
      );
      setEditingResource(null); // Đóng modal sau khi lưu
      alert("Resource updated successfully!"); // Thông báo chỉnh sửa resource thành công
      navigate(`/course/study/${params.id}`); // Chuyển hướng về trang chi tiết khóa học
    } catch (error) {
      console.error("Error editing resource:", error);
    }
  };

  const handleSendNotification = async () => {
    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("message", message);
    formData.append("courseId", course._id);
    if (file) {
      formData.append("file", file); // Gửi file nếu có
    }
    try {
      const response = await axios.post(
        `${server}/api/course/notification`,
        formData,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      alert("Notification sent successfully!");
      setShowNotificationModal(false);
    } catch (error) {
      console.error("Error sending notification:", error.data);

      alert("Failed to send notification");
    }
  };

  const handleGradeClick = () => {
    setShowGradeModal(true);
  };

  const handleCloseGradeModal = () => {
    setShowGradeModal(false);
  };

  const handleAssignmentChange = (e) => {
    setSelectedAssignment(e.target.value);
  };

  const handleViewGradeClick = () => {
    setShowViewGradeModal(true);
  };

  const handleCloseViewGradeModal = () => {
    setShowViewGradeModal(false);
  };

  // Mở modal chỉnh sửa khi nhấn "Edit"

  const handleEditClick = (resourceId) => {
    const resource = resources.find((r) => r._id === resourceId);
    setEditingResource(resource);
    setNewTitle(resource.title); // Hiển thị tiêu đề hiện tại để người dùng chỉnh sửa
  };

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        await fetchCourse(params.id);
        await loadResources(params.id);

        if (user.role === "lecturer") {
          await fetchInstructorAssignments(params.id);
        } else if (user.role === "student") {
          await fetchStudentAssignments(params.id);
        }
      } catch (error) {
        console.error("Error loading course data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [
    params.id,
    fetchCourse,
    fetchInstructorAssignments,
    fetchStudentAssignments,
    user.role,
  ]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        course && (
          <div className="course-description">
            <div className="course-title-bar">
              <h1>{course.title}</h1>
            </div>
            <div className="course-header">
              <img src={course.image} alt="Course" className="course-image" />

              <div className="course-info">
                <p>
                  Start:{" "}
                  {new Date(course.startDate).toLocaleDateString("en-GB", {
                    timeZone: "UTC",
                  })}
                </p>
                <p>
                  End:{" "}
                  {new Date(course.endDate).toLocaleDateString("en-GB", {
                    timeZone: "UTC",
                  })}
                </p>
                <p className="course-description-box">{course.description}</p>
                <h4>Lecturer: </h4>
                {course.lecturers && course.lecturers.length > 0 ? (
                  <ul>
                    {course.lecturers.map((lecturer, index) => (
                      <li key={index}>{lecturer}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No lecturer information available</p>
                )}
              </div>
            </div>
            {/*Nhập điểm, Gửi thông báo */}
            {user.role === "lecturer" && (
              <div className="course-button">
                <div className="course-links">
                  <button onClick={handleGradeClick} className="edit-btn">
                    <FontAwesomeIcon icon={faPencilAlt} /> <p>Enter Grade</p>
                  </button>

                  <button
                    className="edit-btn"
                    onClick={() => setShowNotificationModal(true)}
                  >
                    <FontAwesomeIcon icon={faBell} /> <p>Send Notification</p>
                  </button>
                </div>
              </div>
            )}
            {showGradeModal && (
              <EnterGradeModal
                courseId={courseId} // Truyền courseId vào modal
                assignments={assignments} // Truyền assignments vào modal
                selectedAssignment={selectedAssignment} // Truyền assignment được chọn vào modal
                onAssignmentChange={handleAssignmentChange} // Truyền hàm xử lý thay đổi assignment vào modal
                onClose={handleCloseGradeModal}
              />
            )}
            {/*Xem điểm */}
            {user.role === "student" && (
              <div className="course-button">
                <div className="course-links">
                  <button className="edit-btn" onClick={handleViewGradeClick}>
                    <FontAwesomeIcon icon={faEye} className="white-icon" />{" "}
                    <p>View Grade</p>
                  </button>
                </div>
              </div>
            )}

            {showViewGradeModal && (
              <ViewGradeModal
                courseId={courseId}
                user={user}
                onClose={handleCloseViewGradeModal}
              />
            )}

            <div className="container">
              <div className="content">
                <div className="course-columns">
                  {/*Forum*/}
                  <div className="col">
                    <div className="info">
                      <Link to={`/course/study/${params.id}/forums`}>
                        <FontAwesomeIcon icon={faComment} /> Discussion Forum{" "}
                      </Link>
                    </div>
                  </div>
                  {/* Resources Column */}

                  <div className="col">
                    <h3>Resources</h3>
                    <hr></hr>
                    {user.role === "lecturer" && (
                      <div className="course-links">
                        <button
                          className="upload-btn"
                          onClick={() => setShowAddResourceModal(true)}
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            className="white-icon"
                          />{" "}
                          <p>Upload New File</p>
                        </button>
                      </div>
                    )}
                    <ul>
                      {resources.length === 0 ? (
                        <p>No file.</p>
                      ) : (
                        resources.map((item) => (
                          <div className="file-item-container">
                            <li key={item._id} className="file-item">
                              <p>{item.title}</p>
                              <div className="file-item-icon">
                                <a
                                  href={item.file}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="edit-btn"
                                >
                                  <FontAwesomeIcon
                                    icon={faDownload}
                                    className="ricon"
                                  />
                                </a>
                                {user.role === "lecturer" && (
                                  <>
                                    <button
                                      className="edit-btn"
                                      onClick={() => handleEditClick(item._id)}
                                    >
                                      <FontAwesomeIcon
                                        icon={faEdit}
                                        className="ricon"
                                      />
                                    </button>

                                    <button
                                      className="edit-btn"
                                      onClick={() =>
                                        handleDeleteResource(item._id)
                                      }
                                    >
                                      <FontAwesomeIcon
                                        icon={faTrash}
                                        className="ricon"
                                      />
                                    </button>
                                  </>
                                )}
                              </div>
                            </li>
                            <div className="time">
                              Created at:{" "}
                              {new Date(item.createdAt).toLocaleString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </ul>
                  </div>
                  {/* Assignment Column */}
                  <div className="col">
                    <h3>Assignment</h3>
                    <hr></hr>
                    {user.role === "lecturer" && (
                      <div className="course-links">
                        <button
                          className="upload-btn"
                          onClick={() => setShowAddAssignmentModal(true)} // Hiển thị modal khi nhấn nút
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            className="white-icon"
                          />{" "}
                          <p>Add New Assignment</p>
                        </button>
                      </div>
                    )}
                    <ul>
                      {assignments.map((assignment) => (
                        <li key={assignment._id}>
                          <Link to={`/assignments/details/${assignment._id}`}>
                            <h4>{assignment.title}</h4>
                          </Link>
                          <p>{assignment.description}</p>
                          <p>
                            Due Date:{" "}
                            {new Date(assignment.dueDate).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Modal Add Assignment */}
                  {showAddAssignmentModal && (
                    <AddAssignmentModal
                      courseId={params.id}
                      onClose={() => setShowAddAssignmentModal(false)}
                    />
                  )}

                  {/* Test Column
                  <div className="col">
                    <h3>Test</h3>
                    <hr></hr>

                    {user.role === "lecturer" && (
                      <div className="course-links">
                        <button className="upload-btn">
                          <FontAwesomeIcon
                            icon={faPlus}
                            className="white-icon"
                          />{" "}
                          <p>Add New Test</p>
                        </button>
                      </div>
                    )}
                  </div> */}
                </div>
              </div>
              <div className="sidebar">
                <h2>Event</h2>
                <hr />
                {[0, 1, 2].map((monthOffset) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() + monthOffset);
                  return (
                    <Calendar
                      key={monthOffset}
                      date={date}
                      assignments={assignments}
                    />
                  );
                })}
                <hr />
              </div>
              {/* Modal Add Resource*/}
              {showAddResourceModal && (
                <AddResourceModal
                  courseId={params.id}
                  onClose={() => setShowAddResourceModal(false)}
                  onAddResource={handleCreateResource}
                />
              )}
              {/* Modal Edit Resource*/}
              {editingResource && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3>Edit Resource</h3>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Enter new title"
                    />
                    <button
                      onClick={() =>
                        handleEditResource(editingResource._id, {
                          ...editingResource,
                          title: newTitle,
                        })
                      }
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingResource(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {/* Modal Send Notification */}
              {showNotificationModal && (
                <div className="modal-overlay">
                  <div className="modal-content">
                    <h3>Send Notification</h3>
                    <p>Subject:</p>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter subject"
                    />
                    <p>Message:</p>

                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter message"
                    />

                    {/* Input for file upload */}
                    <p>File:</p>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])} // setFile is used to store the selected file
                    />
                    <button onClick={handleSendNotification}>Send</button>
                    <button onClick={() => setShowNotificationModal(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </>
  );
};

export default CourseStudy;
