import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { uploadFiles } from "../middlewares/multer.js";

// Import Submission Controller
import {
    submitAssignment,
    updateSubmissionGrade,
    getAllSubmissions,
    getSubmissionDetails,
  } from "../controllers/submission.js";
  
  const router = express.Router();


//======= Submission Routes =======

// Nộp bài tập (student)
router.post("/submissions", isAuth, uploadFiles, submitAssignment);

// Cập nhật điểm và lời phê cho bài nộp (giảng viên)
router.patch("/submissions/:submissionId", isAuth, updateSubmissionGrade);

// Lấy thông tin tất cả submissions của một bài tập
router.get("/submissions/assignment/:assignmentId", isAuth, getAllSubmissions);

// Lấy thông tin chi tiết một submission
router.get("/submissions/:submissionId", isAuth, getSubmissionDetails);

export default router;