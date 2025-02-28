import React from "react";
import "./courseCard.css";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { user, isAuth } = UserData();

  const handleCourseClick = () => {
    if (!isAuth) {
      navigate("/login");
    } else if (user.mainrole === "admin") {
      navigate(`/course/study/${course._id}`);
    }else if (!user.subscription.includes(course._id)) {
      navigate(`/course/${course._id}/not-subscribed`);
    } else {
      navigate(`/course/study/${course._id}`);
    }
  };

  return (
    <div className="course-card" onClick={handleCourseClick}>
      <img src={course.image} alt={course.title} className="course-image" />
      <h3>{course.title}</h3>
      <p>Start: {new Date(course.startDate).toLocaleDateString("en-GB", { timeZone: "UTC" })}</p>
      <p>End: {new Date(course.endDate).toLocaleDateString("en-GB", { timeZone: "UTC" })}</p>
    </div>
  );
};

export default CourseCard;
