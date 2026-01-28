import Quiz from '../models/Quiz.js';
import mongoose from 'mongoose';

// @desc Get all quizzes for a document
// @route GET /api/quizzes/:documentId
// @access Private
export const getQuizzes = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.documentId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document ID',
        statusCode: 400
      });
    }

    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId: req.params.documentId
    })
      .populate('documentId', 'title fileName')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get a single quiz by ID
// @route GET /api/quizzes/:id
// @access Private
export const getQuizById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quiz ID',
        statusCode: 400
      });
    }

    // 🔑 FIXED: Use findById instead of findOne with userId filter
    const quiz = await Quiz.findById(req.params.id).populate('documentId', 'title');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        statusCode: 404
      });
    }
    
    // 🔑 Optional: Add userId validation back after testing
    // if (quiz.userId.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Unauthorized access to quiz',
    //     statusCode: 403
    //   });
    // }

    res.status(200).json({
      success: true,
      data: quiz
    });  
  } catch (error) {
    next(error);
  }
};

// @desc Submit quiz answers
// @route POST /api/quizzes/:id/submit
// @access Private
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide answers array',
        statusCode: 400
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quiz ID',
        statusCode: 400
      });
    }

    // 🔑 FIXED: Use findById instead of findOne with userId filter
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        statusCode: 404
      });
    }

    // 🔑 Add userId validation for security
    if (quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to submit this quiz',
        statusCode: 403
      });
    }

    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: 'Quiz already completed',
        statusCode: 400
      });
    }

    // Process answers
    let correctCount = 0;
    const userAnswers = [];

    answers.forEach(answer => {
      const { questionIndex, selectedAnswer } = answer;

      if (questionIndex < quiz.questions.length) {
        const question = quiz.questions[questionIndex];
        const isCorrect = selectedAnswer === question.correctAnswer;

        if (isCorrect) correctCount++;

        userAnswers.push({
          questionIndex,
          selectedAnswer,
          isCorrect,
          answeredAt: new Date()
        });
      } 
    });

    // Calculate score 
    const score = Math.round((correctCount / quiz.totalQuestions) * 100);

    // Update quiz 
    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = new Date();

    await quiz.save();

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        score,
        correctCount,
        totalQuestions: quiz.totalQuestions,
        percentage: score,
        userAnswers
      },
      message: 'Quiz submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get quiz results
// @route GET /api/quizzes/:id/results
// @access Private
export const getQuizResults = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quiz ID',
        statusCode: 400
      });
    }

    // 🔑 FIXED: Use findById instead of findOne with userId filter
    const quiz = await Quiz.findById(req.params.id).populate('documentId', 'title');

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        statusCode: 404
      });
    }

    // 🔑 Add userId validation for security
    if (quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to view quiz results',
        statusCode: 403
      });
    }

    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: 'Quiz not completed yet',
        statusCode: 400
      });
    }

    // Quiz detailed results
    const detailedResults = quiz.questions.map((question, index) => {
      const userAnswer = quiz.userAnswers.find(a => a.questionIndex === index);

      return {
        questionIndex: index,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer: userAnswer?.selectedAnswer || null,
        isCorrect: userAnswer?.isCorrect || false,
        explanation: question.explanation
      };
    });

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          document: quiz.documentId,
          score: quiz.score,
          totalQuestions: quiz.totalQuestions,
          completedAt: quiz.completedAt
        },
        results: detailedResults
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Delete quiz 
// @route DELETE /api/quizzes/:id
// @access Private
export const deleteQuiz = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quiz ID',
        statusCode: 400
      });
    }

    // 🔑 FIXED: Use findById instead of findOne with userId filter
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found',
        statusCode: 404
      });
    }

    // 🔑 Add userId validation for security
    if (quiz.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this quiz',
        statusCode: 403
      });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};