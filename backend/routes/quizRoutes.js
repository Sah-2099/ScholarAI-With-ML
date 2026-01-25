import express from 'express';
import {
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/quizzes/:documentId - Get all quizzes for a document
router.get('/:documentId', getQuizzes);

// GET /api/quizzes/:id - Get single quiz by ID (FIXED: removed '/quiz' prefix)
router.get('/:id', getQuizById);

// POST /api/quizzes/:id/submit - Submit quiz answers
router.post('/:id/submit', submitQuiz);

// GET /api/quizzes/:id/results - Get quiz results
router.get('/:id/results', getQuizResults);

// DELETE /api/quizzes/:id - Delete quiz
router.delete('/:id', deleteQuiz);

export default router;