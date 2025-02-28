// import { instance } from "../index.js";
import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Progress } from "../models/Progress.js";
import Enrollment from "../models/Enrollment.js";
import { handleUpload } from "../config/cloudinary2.js";
import {Notification} from "../models/Notification.js";
import { sendNotificationMail } from "../middlewares/sendMail.js";
import { getReceiverSocketId, io } from "../index.js";

export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find();
  res.json({
    courses,
  });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  res.json({
    course,
  });
});

export const getCourseByName = TryCatch(async (req, res) => {
  const { name } = req.query;
  const courses = await Courses.find({
    $or: [
      { title: { $regex: name, $options: "i" } },
      { description: { $regex: name, $options: "i" } },
    ],
  });
  if (courses.length === 0) {
    return res.status(404).json({ message: "No courses found" });
  }

  res.status(200).json({ courses });
});

export const getParticipants = TryCatch(async (req, res) => {
  const participants = await Enrollment.findOne({ course_id: req.params.id }).populate("participants.participant_id", "name email _id");

  return res.status(200).json({
    participants: participants.participants,
  });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id });

  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lectures });
  }

  if (!user.subscription.includes(req.params.id))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lecture });
  }

  if (!user.subscription.includes(lecture.course))
    return res.status(400).json({
      message: "You have not subscribed to this course",
    });

  res.json({ lecture });
});

export const getMyCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find({ _id: req.user.subscription });

  res.status(200).json({ courses });
});

export const addProgress = TryCatch(async (req, res) => {
  const progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });

  const { lectureId } = req.query;

  if (progress.completedLectures.includes(lectureId)) {
    return res.json({
      message: "Progress recorded",
    });
  }

  progress.completedLectures.push(lectureId);

  await progress.save();

  res.status(201).json({
    message: "new Progress added",
  });
});

export const getYourProgress = TryCatch(async (req, res) => {
  const progress = await Progress.find({
    user: req.user._id,
    course: req.query.course,
  });

  if (!progress) return res.status(404).json({ message: "null" });

  const allLectures = (await Lecture.find({ course: req.query.course })).length;

  const completedLectures = progress[0].completedLectures.length;

  const courseProgressPercentage = (completedLectures * 100) / allLectures;

  res.json({
    courseProgressPercentage,
    completedLectures,
    allLectures,
    progress,
  });
});

export const sendNotificationToCourseStudents = TryCatch(async (req, res) => {
  const { courseId, subject, message } = req.body;
  const senderId = req.user._id;

  if (!courseId || !senderId || !subject || !message) {
    return res.status(400).json({
      message: "Course ID, sender ID, subject, and message are required.",
    });
  }

  let file = null;
  if(req.file){
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    const cldRes = await handleUpload(dataURI, "courses");
    file = {
      filename: req.file.originalname,
      path: cldRes.secure_url,
    };
  }

  // Find the course enrollment and populate participants
  const enrollment = await Enrollment.findOne({ course_id: courseId }).populate(
    "participants.participant_id course_id",
    "email _id title"
  );

  if (!enrollment) {
    return res.status(404).json({ message: "Course not found." });
  }

  // Filter students only
  const students = enrollment.participants.filter((p) => p.role === "student");

  if (students.length === 0) {
    return res.status(404).json({ message: "No students found in the course." });
  }

  // Notify students via email
  const recipientEmails = students.map((s) => s.participant_id.email);
  let data = {sender: senderId, recipientEmails, message, course: enrollment.course_id.title};
  if(file){
    data = {...data, file};
  }
  await sendNotificationMail(subject, data);

  
  // Create notification in the database
  const recipientIds = students.map((s) => s.participant_id._id);
  const notificationData = {
    sender: senderId,
    recipients: recipientIds,
    subject,
    message,
    file,
  };

  const notification = await Notification.create(notificationData);

  // Notify students via socket
  students.forEach((student) => {
    const studentSocketId = getReceiverSocketId(student.participant_id._id);
    if (studentSocketId) {
      io.to(studentSocketId).emit("newNotification", notification);
    }
  });

  res.status(200).json({ 
    message: "Notification sent successfully.",
    notification: notification,
   });
});