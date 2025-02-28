import TryCatch from "../middlewares/TryCatch.js";
import cloudinary from "../config/cloudinary.js";
import { Assignment } from "../models/Assignment.js";
import { Submission } from "../models/Submission.js";

export const submitAssignment = TryCatch(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    resource_type: "auto",
  });

  const assignment = await Assignment.findById(req.body.assignmentId);

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  // Check if the current date is after the due date
  const currentDate = new Date();
  if (currentDate > assignment.dueDate) {
    return res.status(400).json({ message: "The due date for this assignment has passed" });
  }

  const existingSubmission = await Submission.findOne({
    assignmentId: assignment._id,
    student: req.user._id,
  });

  if (existingSubmission) {
    return res.status(400).json({ message: "You have already submitted this assignment" });
  }

  const submission = await Submission.create({
    assignmentId: assignment._id,
    student: req.user._id,
    fileUrl: result.secure_url,
  });

  res.status(200).json({ message: "Assignment submitted successfully", submission });
});

export const updateSubmissionGrade = TryCatch(async (req, res) => {
  const { submissionId } = req.params;
  const { grade, comment } = req.body;

  if (grade < 0 || grade > 100) {
    return res.status(400).json({ message: "Grade must be between 0 and 100" });
  }

  const submission = await Submission.findById(submissionId);

  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  if (grade !== undefined) submission.grade = grade;
  if (comment !== undefined) submission.comment = comment;

  await submission.save();

  res.status(200).json({
    message: "Submission updated successfully",
    submission,
  });
});

export const getSubmissionDetails = TryCatch(async (req, res) => {
  const { submissionId } = req.params;

  const submission = await Submission.findById(submissionId).populate(
    "student",
    "name email"
  );

  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  res.status(200).json({
    message: "Submission details fetched successfully",
    submission,
  });
});

export const getAllSubmissions = TryCatch(async (req, res) => {
  const { assignmentId } = req.params;

  const submissions = await Submission.find({ assignmentId }).populate(
    "student",
    "name email"
  );

  if (!submissions) {
    return res.status(404).json({ message: "No submissions found" });
  }

  res.status(200).json({
    message: "All submissions fetched successfully",
    submissions,
  });
});
