import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { uploadFiles } from "../middlewares/multer.js";

// Import Assignment Controller
import {
  createAssignment,
  getStudentAssignments,
  getAssignmentDetails,
  updateAssignment,
  deleteAssignment,
} from "../controllers/assignment.js";

const router = express.Router();

//======= Assignment Routes =======

// Tạo assignment mới (giảng viên tải file lên)
router.post("/assignments", isAuth, uploadFiles, createAssignment);

// Lấy tất cả bài tập
router.get("/assignments/course/:courseId", isAuth, getStudentAssignments);

// Lấy thông tin chi tiết một bài tập
router.get("/assignments/:assignmentId", isAuth, getAssignmentDetails);

// Cập nhật bài tập
router.put("/assignments/:assignmentId", isAuth, updateAssignment);

// Xóa bài tập
router.delete("/assignments/:assignmentId", isAuth, deleteAssignment);

export default router;
