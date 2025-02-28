import express from "express";
const router = express.Router();
import { isAuth } from "../middlewares/isAuth.js";
import {
    createForum,
    createQuestion,
    createAnswer,
    getForums,
    getQuestions,
    getAnswers,
} from "../controllers/forum.js";

router.post('/forums', isAuth, createForum);
router.post('/forums/:forumId/questions', isAuth, createQuestion);
router.post('/forums/:forumId/questions/:questionId/answers', isAuth, createAnswer);
router.get('/forums/:courseId', isAuth, getForums);
router.get('/forums/:forumId/questions', isAuth, getQuestions);
router.get('/forums/:forumId/questions/:questionId/answers', isAuth, getAnswers);
export default router;