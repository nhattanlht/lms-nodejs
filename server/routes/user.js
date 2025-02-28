import express from "express";
import {
  forgotPassword,
  getNotification,
  loginUser,
  markAsRead,
  myProfile,
  //register,
  resetPassword,
  sendNotification,
  updateProfile,
  //verifyUser,
  searchUserByEmail,
} from "../controllers/user.js";
import { isAuth, isLecturer } from "../middlewares/isAuth.js";
import { addProgress, getYourProgress } from "../controllers/course.js";

const router = express.Router();

// router.post("/user/register", register);
// router.post("/user/verify", verifyUser);
router.post("/user/login", loginUser);
router.get("/user/me", isAuth, myProfile);

// Forgot and reset password
router.put("/user/me", isAuth, updateProfile);
router.post("/user/forgot", forgotPassword);
router.post("/user/reset", resetPassword);

// Add and get progress
router.post("/user/progress", isAuth, addProgress);
router.get("/user/progress", isAuth, getYourProgress);
router.post("/lecturer/notification", isAuth, isLecturer, sendNotification);
router.get("/notification/me", isAuth, getNotification);
router.post('/notification/mark-as-read', isAuth, markAsRead);
router.get("/user/search", isAuth, searchUserByEmail);

export default router;