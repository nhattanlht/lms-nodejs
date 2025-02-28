// Assignment Controller
import TryCatch from "../middlewares/TryCatch.js";
import cloudinary from "../config/cloudinary.js";
import { Assignment } from "../models/Assignment.js";

export const createAssignment = TryCatch(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    resource_type: "auto",
  });

  if (!req.body.courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  const validTypes = ["assignment", "quiz"];
  if (req.body.type && !validTypes.includes(req.body.type)) {
    return res.status(400).json({ message: "Invalid assignment type" });
  }

  const assignment = await Assignment.create({
    title: req.body.title,
    description: req.body.description,
    instructorFile: result.secure_url,
    startDate: req.body.startDate,
    dueDate: req.body.dueDate,
    courseId: req.body.courseId,
    instructor: req.user._id,
    type: req.body.type || "assignment",
  });

  res.status(201).json({ message: "Assignment created successfully", assignment });
});

export const getStudentAssignments = TryCatch(async (req, res) => {
  const { courseId } = req.params;

  const assignments = await Assignment.find({ courseId });

  res.status(200).json({
    message: "Student's assignments fetched successfully",
    assignments,
  });
});

export const getAssignmentDetails = TryCatch(async (req, res) => {
  const { assignmentId } = req.params;

  const assignment = await Assignment.findById(assignmentId)
    .populate("instructor", "name email")
    .populate({
      path: "_id",
      model: "Submission",
      populate: { path: "student", select: "name email" },
    });

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  res.status(200).json({
    message: "Assignment details fetched successfully",
    assignment,
  });
});

export const updateAssignment = TryCatch(async (req, res) => {
  const { assignmentId } = req.params;

  const updateData = {
    title: req.body.title,
    description: req.body.description,
    startDate: req.body.startDate,
    dueDate: req.body.dueDate,
    type: req.body.type,
  };

  const validTypes = ["assignment", "quiz"];
  if (updateData.type && !validTypes.includes(updateData.type)) {
    return res.status(400).json({ message: "Invalid assignment type" });
  }

  const assignment = await Assignment.findByIdAndUpdate(assignmentId, updateData, {
    new: true,
  });

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  res.status(200).json({
    message: "Assignment updated successfully",
    assignment,
  });
});

export const deleteAssignment = TryCatch(async (req, res) => {
  const { assignmentId } = req.params;

  const assignment = await Assignment.findByIdAndDelete(assignmentId);

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  res.status(200).json({ message: "Assignment deleted successfully" });
});