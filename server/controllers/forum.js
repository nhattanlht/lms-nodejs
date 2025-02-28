import { Forum } from "../models/Forum.js";
import TryCatch from "../middlewares/TryCatch.js";
import Enrollment from "../models/Enrollment.js";
import { User } from "../models/User.js";

export const createForum = TryCatch(async (req, res) => {
  const { courseId, title } = req.body;
  const createdBy = req.user._id;

  const user = await User.findById(req.user._id).lean().select('_id');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const enroll = await Enrollment.findOne({ 
    course_id: courseId, 
    'participants.participant_id': user._id, 
  }).lean().select('_id');

  if (!enroll) {
    return res.status(403).json({
      message: 'You are not enrolled in this course',
    });
  }

  const forum = await Forum.create({
    courseId,
    title,
    createdBy,
  });

  res.status(201).json({
    message: 'Forum created successfully',
    data: forum,
  });
});

export const createQuestion = TryCatch(async (req, res) => {
  const { forumId } = req.params;
  const { title, content } = req.body;
  const createdBy = req.user._id;

  const user = await User.findById(req.user._id).lean().select('_id');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const forum = await Forum.findById(forumId).populate('courseId').lean();
  if (!forum) {
    return res.status(404).json({
      message: 'Forum not found',
    });
  }

  const enroll = await Enrollment.findOne({ 
    course_id: forum.courseId._id, 
    'participants.participant_id': user._id,
  }).lean().select('_id');

  if (!enroll) {
    return res.status(403).json({
      message: 'You are not enrolled in this course',
    });
  }

  const question = {
    title,
    content,
    createdBy,
  };

  await Forum.findByIdAndUpdate(forumId, {
    $push: { questions: question },
  });

  res.status(201).json({
    message: 'Question added successfully',
    data: question,
  });
});

export const createAnswer = TryCatch(async (req, res) => {
  const { forumId, questionId } = req.params
  const { content } = req.body;
  const createdBy = req.user._id;

  const user = await User.findById(req.user._id).lean().select('_id');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const forum = await Forum.findById(forumId).populate('courseId').lean();
  if (!forum) {
    return res.status(404).json({
      message: 'Forum not found',
    });
  }
  
  const question = forum.questions.find(q => q._id == questionId);
  if (!question) {
    return res.status(404).json({
      message: 'Question not found',
    });
  }

  const enroll = await Enrollment.findOne({ 
    course_id: forum.courseId._id, 
    'participants.participant_id': user._id,
  }).lean().select('_id');

  if (!enroll) {
    return res.status(403).json({
      message: 'You are not enrolled in this course',
    });
  }

  const answer = {
    content,
    createdBy,
  };

  question.answers.push(answer);
  await Forum.findByIdAndUpdate(forumId, { questions: forum.questions });

  res.status(201).json({
    message: 'Answer added successfully',
    data: answer,
  });
});

export const getForums = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const forumsExist = await Forum.find({ courseId: courseId }).populate('courseId').lean();

  if (!forumsExist || forumsExist.length === 0) {
    return res.status(404).json({
      message: 'No forums found for this course',
    });
  }
  const user = await User.findById(req.user._id).lean().select('_id');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const enroll = await Enrollment.findOne({ 
    course_id: courseId, 
    'participants.participant_id': user._id, 
  }).lean().select('_id');

  if (!enroll) {
    return res.status(403).json({
      message: 'You are not enrolled in this course',
    });
  }

  const forumsWithoutQuestions = forumsExist.map(forum => {
    const { questions, ...forumWithoutQuestions } = forum;
    return forumWithoutQuestions;
  });

  res.status(200).json({
    message: 'Forums retrieved successfully',
    data: forumsWithoutQuestions,
  });
});

export const getQuestions = TryCatch(async (req, res) => {
  const { forumId } = req.params;

  const forum = await Forum.findById(forumId).populate('courseId').lean();
  if (!forum) {
    return res.status(404).json({
      message: 'Forum not found',
    });
  }

  const user = await User.findById(req.user._id).lean().select('_id');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const enroll = await Enrollment.findOne({ 
    course_id: forum.courseId._id, 
    'participants.participant_id': user._id, 
  }).lean().select('_id');

  if (!enroll) {
    return res.status(403).json({
      message: 'You are not enrolled in this course',
    });
  }

  const questionsWithoutAnswers = forum.questions.map(question => {
    const { answers, ...questionWithoutAnswers } = question;
    return questionWithoutAnswers;
  });

  res.status(200).json({
    message: 'Questions retrieved successfully',
    data: questionsWithoutAnswers,
  });
});

export const getAnswers = TryCatch(async (req, res) => {
  const { forumId, questionId } = req.params;

  const forum = await Forum.findById(forumId).populate('courseId').lean();
  if (!forum) {
    return res.status(404).json({
      message: 'Forum not found',
    });
  }

  const user = await User.findById(req.user._id).lean().select('_id');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const enroll = await Enrollment.findOne({ 
    course_id: forum.courseId._id, 
    'participants.participant_id': user._id, 
  }).lean().select('_id');

  if (!enroll) {
    return res.status(403).json({
      message: 'You are not enrolled in this course',
    });
  }

  const question = forum.questions.find(q => q._id == questionId);
  if (!question) {
    return res.status(404).json({
      message: 'Question not found',
    });
  }

  res.status(200).json({
    message: 'Answers retrieved successfully',
    data: question.answers,
  });
});
