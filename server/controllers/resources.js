import TryCatch from "../middlewares/TryCatch.js";
import { Resources } from "../models/Resources.js";
import cloudinary from "../config/cloudinary.js";

// Tạo tài nguyên mới
export const createResource = TryCatch(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Upload file lên Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    resource_type: "auto",
  });

  const resource = await Resources.create({
    title: req.body.title,
    description: req.body.description,
    file: result.secure_url,
    uploadedBy: req.user._id,
    course: req.body.courseId,
  });

  res.status(201).json({ message: "Resource created successfully", resource });
});

// Lấy danh sách tài nguyên theo khóa học
export const getResourcesByCourse = TryCatch(async (req, res) => {
  const { courseId } = req.params;

  const resources = await Resources.find({ course: courseId }).populate("uploadedBy", "name email");

  res.status(200).json({ message: "Resources fetched successfully", resources });
});

// Lấy chi tiết tài nguyên
export const getResourceDetails = TryCatch(async (req, res) => {
  const { resourceId } = req.params;

  const resource = await Resources.findById(resourceId)
    .populate("uploadedBy", "name email")
    .populate("course", "name description");

  if (!resource) {
    return res.status(404).json({ message: "Resource not found" });
  }

  res.status(200).json({ message: "Resource details fetched successfully", resource });
});

// Cập nhật tài nguyên
export const updateResource = TryCatch(async (req, res) => {
  const { resourceId } = req.params;

  const updateData = {
    title: req.body.title,
    description: req.body.description,
  };

  const resource = await Resources.findByIdAndUpdate(resourceId, updateData, {
    new: true,
  });

  if (!resource) {
    return res.status(404).json({ message: "Resource not found" });
  }

  res.status(200).json({ message: "Resource updated successfully", resource });
});

// Xóa tài nguyên
export const deleteResource = TryCatch(async (req, res) => {
  const { resourceId } = req.params;

  const resource = await Resources.findByIdAndDelete(resourceId);

  if (!resource) {
    return res.status(404).json({ message: "Resource not found" });
  }

  res.status(200).json({ message: "Resource deleted successfully" });
});
