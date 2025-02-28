import express from "express";
import {
  createResource,
  getResourcesByCourse,
  getResourceDetails,
  updateResource,
  deleteResource,
} from "../controllers/resources.js";
import {isAuth} from "../middlewares/isAuth.js";
import { uploadFiles } from "../middlewares/multer.js";


const router = express.Router();

// Tạo tài nguyên mới
router.post("/resource", isAuth, uploadFiles, createResource);

// Lấy danh sách tài nguyên theo khóa học
router.get("/resource/:courseId", isAuth, getResourcesByCourse);

// Lấy chi tiết tài nguyên
router.get("/resource/details/:resourceId", isAuth, getResourceDetails);

// Cập nhật tài nguyên
router.put("/resource/:resourceId", isAuth, updateResource);

// Xóa tài nguyên
router.delete("/resource/:resourceId", isAuth, deleteResource);

export default router;
