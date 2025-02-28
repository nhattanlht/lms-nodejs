import express from "express";
import {
  getAllCourses,
  getSingleCourse,
  getCourseByName,
  fetchLectures,
  fetchLecture,
  getMyCourses,
  sendNotificationToCourseStudents,
  getParticipants,
} from "../controllers/course.js";
import { isAuth, isLecturer, isStudent } from "../middlewares/isAuth.js";
import { uploadFiles } from "../middlewares/multer2.js";

const router = express.Router();

router.get("/course/all", getAllCourses);
router.get("/course/one", getCourseByName);
router.get("/course/:id", getSingleCourse);
router.get("/course/:id/participants", getParticipants);
router.get("/lectures/:id", isAuth, fetchLectures);
router.get("/lecture/:id", isAuth, fetchLecture);
router.get("/mycourse", isAuth, getMyCourses);
router.post('/course/notification', isAuth, isLecturer, uploadFiles, sendNotificationToCourseStudents)
export default router;
