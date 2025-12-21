import express from 'express';
import {
    getFlashcards,
    getAllFlashcasrdSets,
    reviewFlashcard,
    toggleStarFlashcard,
    deleteFlashcardSet,
} from '../controllers/flashcardController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllFlashcasrdSets);
router.get('/:documentId', getFlashcards);
router.post('/:cardId/review', reviewFlashcard);
router.patch('/:cardId/star', toggleStarFlashcard); // ✅ corrected here
router.delete('/:id', deleteFlashcardSet);

export default router;
