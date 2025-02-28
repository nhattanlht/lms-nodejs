import mongoose from 'mongoose';
import { Courses } from '../models/Courses.js';
import { User } from '../models/User.js';
import { Lecture } from '../models/Lecture.js';
import {Forum} from '../models/Forum.js';
import {Assignment} from '../models/Assignment.js';
import {Notification} from '../models/Notification.js';
import {Resources} from '../models/Resources.js';
import { connectDb } from "./db.js";

(async () => {
  try {
    await connectDb();
    // Clear existing data
    // await Promise.all([
    //   Courses.deleteMany({}),
    //   User.deleteMany({}),
    //   Lecture.deleteMany({}),
    //   Forum.deleteMany({}),
    //   Assignment.deleteMany({}),
    //   Notification.deleteMany({}),
    //   Resources.deleteMany({})
    // ]);

    // Create users
    const users = await User.insertMany([
      { username: 'john_doe', email: 'john@example.com', password: '12345', role: 'student', profile: { firstName: 'John', lastName: 'Doe' } },
      { username: 'jane_doe', email: 'jane@example.com', password: '12345', role: 'lecturer', profile: { firstName: 'Jane', lastName: 'Doe' } },
      { username: 'admin', email: 'admin@example.com', password: 'admin', role: 'admin' }
    ]);

    // Create courses
    const courses = await Courses.insertMany([
      { title: 'Math 101', description: 'Basic Math Course', image: 'math.jpg', duration: 40, category: 'Mathematics', createdBy: 'jane_doe' },
      { title: 'Physics 101', description: 'Basic Physics Course', image: 'physics.jpg', duration: 45, category: 'Physics', createdBy: 'jane_doe' }
    ]);

    // Create resources
    const resources = await Resources.insertMany([
      { title: 'Math Resource 1', description: 'Basic Math Resource', file: 'math1.pdf', uploadedBy: users[1]._id, course: courses[0]._id },
      { title: 'Physics Resource 1', description: 'Basic Physics Resource', file: 'physics1.pdf', uploadedBy: users[1]._id, course: courses[1]._id }
    ]);

    // Add resources to courses
    await Courses.findByIdAndUpdate(courses[0]._id, { resources: [resources[0]._id] });
    await Courses.findByIdAndUpdate(courses[1]._id, { resources: [resources[1]._id] });

    // Create lectures
    const lectures = await Lecture.insertMany([
      { title: 'Introduction to Math', description: 'Math Basics', video: 'math_intro.mp4', course: courses[0]._id },
      { title: 'Introduction to Physics', description: 'Physics Basics', video: 'physics_intro.mp4', course: courses[1]._id }
    ]);

    // Create assignments
    const assignments = await Assignment.insertMany([
      { title: 'Math Assignment 1', description: 'Solve equations', type: 'assignment', openAt: new Date(), endAt: new Date(), course: courses[0]._id },
      { title: 'Physics Assignment 1', description: 'Laws of Motion', type: 'assignment', openAt: new Date(), endAt: new Date(), course: courses[1]._id }
    ]);

    // Create forums
    const forums = await Forum.insertMany([
      { course: courses[0]._id, question: 'What is algebra?', createdBy: users[0]._id, answers: [] },
      { course: courses[1]._id, question: 'Explain Newton’s laws.', createdBy: users[0]._id, answers: [] }
    ]);

    // Create notifications
    const notifications = await Notification.insertMany([
      { sender: users[2]._id, recipient: users[0]._id, subject: 'Welcome', message: 'Welcome to LMS!', file: null },
      { sender: users[2]._id, recipient: users[1]._id, subject: 'Course Update', message: 'A new course has been added.', file: null }
    ]);

    console.log('Sample data inserted successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
