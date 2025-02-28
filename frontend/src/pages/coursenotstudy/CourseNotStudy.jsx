import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";  // Thêm useNavigate
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import "./coursenotstudy.css";

const CourseNotStudy = () => {
  const params = useParams();
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const [loading, setLoading] = useState(true);
  const { fetchCourse, course } = CourseData();

  useEffect(() => {
    const loadCourseData = async () => {
      await fetchCourse(params.id);
      setLoading(false);
    };
    loadCourseData();
  }, [params.id, fetchCourse]);

  const handleContinue = () => {
    navigate("/courses");  // Điều hướng về trang /courses
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        course && (
          <div className="course-study">
            <div className="course-title-bar">
              <h1>Title: </h1>
              <h1>{course.title}</h1>
            </div>
            <div className="course-header">
              <img
                src={course.image}
                alt="Course"
                className="course-image"
              />
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
                <h4>Description: </h4>
                <p>{course.description}</p>
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
            <div className="course-columns">
              <div className="column">
                <p>You have not applied for a course!</p>
                <button className="continue-btn" onClick={handleContinue}>
                  Tiếp tục
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default CourseNotStudy;
