import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { Notification } from "../models/Notification.js";
import Enrollment from "../models/Enrollment.js";
import { rm } from "fs";
// import { promisify } from "util";
// import fs from "fs";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { handleUpload } from "../config/cloudinary2.js";
import { sendNotificationMail } from "../middlewares/sendMail.js";
import { getReceiverSocketId, io } from "../index.js";
import { Assignment } from "../models/Assignment.js";
import { Resources } from "../models/Resources.js";
import { Submission } from "../models/Submission.js";
import { Forum } from "../models/Forum.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/message.js";

export const createCourse = TryCatch(async (req, res) => {
  const { title, description, startDate, endDate, summary} = req.body;
  
  if (!title || !startDate || !endDate) {
    return res.status(400).json({ message: 'All fields except image, duration and category are required.' });
  }

  let cldRes;
  if(req.file){
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    cldRes = await handleUpload(dataURI, "courses");
  }
  const newCourse = new Courses({
    title,
    description,
    image: cldRes?.secure_url,
    startDate,
    endDate,
    summary,
    createdBy: req.user._id,
  });

  await newCourse.save();

  res.status(201).json({
    message: 'Course added successfully.',
    course: newCourse,
  });
});

// Add many courses
export const createManyCourses = TryCatch(async (req, res) => {
  const { courses } = req.body;

  if (!Array.isArray(courses) || courses.length === 0) {
    return res.status(400).json({ message: 'Please provide an array of courses.' });
  }

  const createdCourses = await Courses.insertMany(courses);

  res.status(201).json({
    message: 'Courses added successfully.',
    courses: createdCourses,
  });
});

// Modify course info
export const modifyCourse = TryCatch(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  let cldRes;
  if(req.file){
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
    cldRes = await handleUpload(dataURI, "courses");
  }

  updates.image = cldRes?.secure_url;
  updates.createdBy = req.user._id;
  const updatedCourse = await Courses.findByIdAndUpdate(id, updates, { new: true });

  if (!updatedCourse) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  res.json({
    message: 'Course updated successfully.',
    course: updatedCourse,
  });
});

export const createUser = TryCatch(async (req, res) => {
  if (req.user.role !== "superadmin")
    return res.status(403).json({
      message: "This endpoint is assign to superadmin",
    });

  // Ensure the required fields are provided
  const { name, email, dateOfBirth } = req.body;
  if (!name || !email ) {
    return res.status(400).json({message: "Name, email are required to create a user."});
  }


  // Check for duplicate email
  const existingUser = await User.findOne(
    {$or:[
     {email: email},
      {name: name}
    ]}
  );
  
  if (existingUser) {
    return res.status(400).json({message: "Email or name is already in use."});
  }

  const password = dateOfBirth? dateOfBirth.split("-").reverse().join("") : "123456789";
  const hashedPassword = await bcrypt.hash(password, 10);


  const userData = req.body;
  // Create and save the user
  const newUser = new User(
    {
      name,
      email,
      password: hashedPassword,
      "profile.firstName": userData.firstName,
      "profile.lastName": userData.lastName,
      "profile.phoneNumber": userData.phoneNumber,
      "profile.dateOfBirth": dateOfBirth,
      "profile.gender": userData.gender,
      "profile.address": userData.address,
      "profile.levelEducation": userData.levelEducation,
      "profile.typeEducation": userData.typeEducation,
      "profile.major": userData.major,
      "profile.faculty": userData.faculty,
      role : userData.role,
      mainrole: userData.mainrole,
    }
  );
  await newUser.save();
  return res.status(201).json({ message: "User created successfully", data: newUser });
});

export const modifyUser = TryCatch(async (req, res) => {
  if (req.user.role !== "superadmin")
    return res.status(403).json({
      message: "This endpoint is assign to superadmin",
    });

  const { id } = req.params;
  const {
    firstName,
    lastName,
    phoneNumber,
    dateOfBirth,
    gender,
    address,
    levelEducation,
    typeEducation,
    major,
    faculty,
    role,
    mainrole,
  } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        "profile.firstName": firstName,
        "profile.lastName": lastName,
        "profile.phoneNumber": phoneNumber,
        "profile.dateOfBirth": dateOfBirth,
        "profile.gender": gender,
        "profile.address": address,
        "profile.levelEducation": levelEducation,
        "profile.typeEducation": typeEducation,
        "profile.major": major,
        "profile.faculty": faculty,
        role : role,
        mainrole: mainrole,
      },
    },
    { new: true });

  if (!updatedUser) {
    return res.status(404).json({ message: 'User not found.' });
  }

  res.status(200).json({
    message: 'User updated successfully.',
    user: updatedUser,
  });
});

export const deleteUsers = TryCatch(async (req, res) => {
  const { ids } = req.body; // Array of user IDs to delete

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid user IDs" });
  }

  // Validate if users exist
  const users = await User.find({ _id: { $in: ids } });
  if (users.length === 0) {
    return res.status(404).json({ message: "No users found" });
  }

  // Remove users from assignments
  await Assignment.updateMany(
    { instructor: { $in: ids } },
    { $unset: { instructor: "" } }
  );

  // Delete submissions related to users
  await Submission.deleteMany({ student: { $in: ids } });

  // Remove users from conversations
  await Conversation.updateMany(
    { participants: { $in: ids } },
    { $pull: { participants: { $in: ids } } }
  );

  // Delete messages sent or received by users
  await Message.deleteMany({
    $or: [{ senderId: { $in: ids } }, { receiverId: { $in: ids } }],
  });

  // Remove users from forums and questions/answers
  await Forum.updateMany(
    { createdBy: { $in: ids } },
    { $unset: { createdBy: "" } }
  );

  await Forum.updateMany(
    { "questions.createdBy": { $in: ids } },
    { $pull: { questions: { createdBy: { $in: ids } } } }
  );

  // Remove users from notifications
  await Notification.updateMany(
    { $or: [{ sender: { $in: ids } }, { recipients: { $in: ids } }] },
    { $pull: { recipients: { $in: ids } } }
  );

  // Remove resources uploaded by users
  await Resources.deleteMany({ uploadedBy: { $in: ids } });

  // Remove users from enrollments
  await Enrollment.updateMany(
    { "participants.participant_id": { $in: ids } },
    { $pull: { participants: { participant_id: { $in: ids } } } }
  );

  // Delete the users themselves
  await User.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    message: "Users and related data deleted successfully",
    deletedUsers: ids,
  });
});

export const findUserByName = TryCatch(async (req, res) => {
  const {name} = req.query;

  const users = await User.find({
    $or: [
      { name: { $regex: name, $options: "i" } }, 
      { "profile.firstName": { $regex: name, $options: "i" } },
      { "profile.lastName": { $regex: name, $options: "i" } }, 
    ],
  });

  if (!users || users.length === 0) {
    return res.status(404).json({ message: "No users found matching the name." });
  }

  res.status(200).json({
    message: "Users found",
    users: users,
  });
});

export const addParticipantsToCourse = TryCatch(async (req, res) => {
  const { courseId, participantsId } = req.body;

  if (!courseId) {
    return res.status(400).json({ message: "Course ID is required" });
  }

  const course = await Courses.findById(courseId);
  if(!course){ 
    return res.status(404).json({ message: "Course not found" });
  }

  if (!participantsId || !Array.isArray(participantsId)) {
    return res.status(400).json({ message: "Participants must be an array." });
  }

  const validRoles = ["student", "lecturer"];

  // Normalize participants to an array
  const participantList = Array.isArray(participantsId) ? participantsId : [participantsId];
  let participants = [];
  // Validate participants
  for (const participant of participantList) {
    const existingParticipant = await User.findById(participant);
    if(!existingParticipant){
      return res.status(404).json({
        message: "User not found.",
      })
    }
    if(!validRoles.includes(existingParticipant.role)){
      return res.status(400).json({
        message: "Each participant must have a valid participant_id and role (student or lecturer).",
      });
    }
    participants.push({ participant_id: existingParticipant._id, role: existingParticipant.role });
  }

  const enrollment = await Enrollment.findOne({ course_id: courseId });

  if (!enrollment) {
    // If no enrollment exists, create a new one
    await Enrollment.create({
      course_id: courseId,
      participants: participants,
    });
  } else {
    // If enrollment exists, add participants to it
    const participantIds = enrollment.participants.map((p) => p.participant_id.toString());

    participants.forEach((participant) => {
      if (!participantIds.includes(participant.participant_id.toString())) {
        enrollment.participants.push(participant);
      }
    });

    await enrollment.save();
  }

   // Update subscription for each participant

   for (const participant of participantList) {
     const user = await User.findById(participant);
     if (user && !user.subscription.includes(courseId)) {
       user.subscription.push(courseId);
       await user.save();
     }
   }

  res.status(200).json({ message: "Participants successfully added to the course." });
});

export const addLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({
      message: "No Course with this id",
    });

  const { title, description } = req.body;

  const file = req.file;

  const lecture = await Lecture.create({
    title,
    description,
    video: file?.path,
    course: course._id,
  });

  res.status(201).json({
    message: "Lecture Added",
    lecture,
  });
});

export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  rm(lecture.video, () => {
    console.log("Video deleted");
  });

  await lecture.deleteOne();

  res.json({ message: "Lecture Deleted" });
});

// const unlinkAsync = promisify(fs.unlink);


export const deleteCourse = TryCatch(async (req, res) => {
  const { id } = req.params;

  // Find the course
  const course = await Courses.findById(id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // Remove the course from users' subscriptions
  await User.updateMany(
    { subscription: id },
    { $pull: { subscription: id } }
  );

  // Delete related forums
  await Forum.deleteMany({ id });

  // Delete related assignments and their submissions
  const assignments = await Assignment.find({ id });
  const assignmentIds = assignments.map((a) => a._id);

  // Delete assignments
  await Assignment.deleteMany({ id });

  // Delete submissions related to assignments
  await Submission.deleteMany({ assignmentId: { $in: assignmentIds } });

  // Delete related resources
  await Resources.deleteMany({ course: id });

  // Delete enrollments for the course
  await Enrollment.deleteMany({ course_id: id });

  // Delete the course itself
  await Courses.findByIdAndDelete(id);

  res.status(200).json({ message: "Course and related data deleted successfully" });
});

// Delete many courses
export const deleteManyCourses = TryCatch(async (req, res) => {
  const { ids } = req.body; // Array of course IDs to delete

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid course IDs" });
  }

  // Find the courses
  const courses = await Courses.find({ _id: { $in: ids } });
  if (courses.length === 0) {
    return res.status(404).json({ message: "No courses found" });
  }

  // Remove the courses from users' subscriptions
  await User.updateMany(
    { subscription: { $in: ids } },
    { $pull: { subscription: { $in: ids } } }
  );

  // Delete related forums
  await Forum.deleteMany({ courseId: { $in: ids } });

  // Delete related assignments and their submissions
  const assignments = await Assignment.find({ courseId: { $in: ids } });
  const assignmentIds = assignments.map((a) => a._id);

  await Assignment.deleteMany({ courseId: { $in: ids } });
  await Submission.deleteMany({ assignmentId: { $in: assignmentIds } });

  // Delete related resources
  await Resources.deleteMany({ course: { $in: ids } });

  // Delete enrollments for the courses
  await Enrollment.deleteMany({ course_id: { $in: ids } });

  // Delete the courses
  await Courses.deleteMany({ _id: { $in: ids } });

  return res.status(200).json({
    message: "Courses and related data deleted successfully",
    deletedCourses: ids,
  });
});

export const getAllStats = TryCatch(async (req, res) => {
  const totalCourses = (await Courses.find()).length;
  const totalUsers = (await User.find()).length;

  const stats = {
    totalCourses,
    totalUsers,
  };

  res.json({
    stats,
  });
});

export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password"
  );

  res.json({ users });
});

export const updateRole = TryCatch(async (req, res) => {
  if (req.user.role !== "superadmin")
    return res.status(403).json({
      message: "This endpoint is assign to superadmin",
    });
  const user = await User.findById(req.params.id);

  if (user.role === "user") {
    user.role = "admin";
    user.mainrole = "admin";
    await user.save();

    return res.status(200).json({
      message: "Role updated to admin",
    });
  }

  if (user.role === "admin") {
    user.role = "lecturer";
    user.mainrole = "user";
    await user.save();

    return res.status(200).json({
      message: "Role updated",
    });
  }
});

export const sendNotification = TryCatch(async (req, res) => {
  const {recipientType, specificRecipients, subject, message } = req.body;
  const sender = req.user._id;

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

  console.log(req.body);
  if (!subject || !message || !recipientType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  let recipientIds = [];

  if (recipientType === 'allUsers') {
    recipientIds = await User.find().select('_id');
  } else if (recipientType === 'allLecturers') {
    recipientIds = await User.find({ mainrole: 'lecturer' }).select('_id');
  } else if (recipientType === 'allStudents') {
    recipientIds = await User.find({ mainrole: 'student' }).select('_id');
  } else if (recipientType === 'specific') {
    const recipientsEmail = specificRecipients.split(',');
    const users = await User.find({ email: { $in: recipientsEmail } }).select('_id');
    recipientIds = users.map((user) => user._id);
  }
  
  
  const users = await User.find({ _id: { $in: recipientIds } });
  const recipientEmails = users.map(user => user.email);

  let data;
  if(file){
    data = {sender, recipientEmails, message, file};
  }else{
    data = {sender, recipientEmails, message};
  }
  await sendNotificationMail(subject, data);
  
  const notification = await Notification.create({
    sender: sender,
    recipients: recipientIds,
    subject,
    message,
    file: file,
  });


  // Notify users via socket
  recipientIds.forEach((recipientId) => {
    const recipientSocketId = getReceiverSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newNotification", notification);
    }
  });

  res.status(201).json({
    message: 'Notification created successfully.',
    notification: notification,
  });
});

