import express from 'express';
import {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory
} from '../controllers/aiController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all AI routes
router.use(protect);

// POST routes for AI generation & interaction
router.post('/generate-flashcards', generateFlashcards);
router.post('/generate-quiz', generateQuiz);
router.post('/generate-summary', generateSummary);
router.post('/chat', chat);
router.post('/explain-concept', explainConcept);

// ✅ FIXED: GET route for chat history
// Matches frontend call: GET /api/ai/chat-hi_69565fea6b80905007cccdbc
router.get('/chat-hi_:documentId', getChatHistory);

export default router;