// backend/utils/aiService.js
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';

/**
 * Call Ollama with proper error handling and JSON parsing
 */
const callOllama = async (prompt, model = 'llama3.2:3b') => {
  try {
    const response = await axios.post(OLLAMA_URL, {
      model,
      prompt,
      stream: false,
      format: 'json'
    }, { timeout: 60000 });

    let cleanResponse = response.data.response.trim();
    
    // Handle markdown code blocks
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.substring(7, cleanResponse.lastIndexOf('```')).trim();
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.substring(3, cleanResponse.lastIndexOf('```')).trim();
    }
    
    // Try to parse as JSON
    try {
      const result = JSON.parse(cleanResponse);
      return result;
    } catch (parseError) {
      console.error('JSON parse failed, raw response:', cleanResponse);
      // If JSON parsing fails, return structured fallback
      return {
        title: "Generated Quiz",
        questions: []
      };
    }
  } catch (error) {
    console.error('Ollama call error:', error.message);
    if (error.response) {
      console.error('Ollama response:', error.response.data);
    }
    throw new Error('Failed to communicate with Ollama');
  }
};

/**
 * Generate flashcards from document text
 */
export const generateFlashcards = async (documentText, count = 10) => {
  const prompt = `
Generate ${count} flashcards from the following document as a JSON array.

Each card must be an object with:
- "question": string
- "answer": string  
- "difficulty": "easy" | "medium" | "hard"

Output ONLY a JSON array. No other text.

Document:
${documentText}
`;

  const result = await callOllama(prompt);
  
  // Handle case where result is already an array
  if (Array.isArray(result)) {
    return result.slice(0, count);
  }
  
  // Handle case where result has cards array
  if (result.cards && Array.isArray(result.cards)) {
    return result.cards.slice(0, count);
  }
  
  // Handle case where result is an object that should be treated as single card
  if (result.question && result.answer) {
    return [result];
  }
  
  throw new Error('Expected array of flashcards');
};

/**
 * Generate quiz from document text
 */
export const generateQuiz = async (documentText, numQuestions = 5) => {
  const prompt = `
You are an expert educator. Generate a quiz in STRICT JSON format with exactly ${numQuestions} multiple-choice questions based on the following document.

CRITICAL RULES:
- Output ONLY valid JSON, no explanations, no markdown, no extra text
- Use this exact structure:
{
  "title": "Short descriptive title about the document topic",
  "questions": [
    {
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact text of correct option"
    }
  ]
}
- All fields are required
- Exactly 4 options per question
- Correct answer must match one of the options exactly

Document:
${documentText}
`;

  const result = await callOllama(prompt);
  
  // Validate structure with fallbacks
  const quizData = {
    title: result.title || "Generated Quiz",
    questions: []
  };

  // Handle different possible response formats
  if (result.questions && Array.isArray(result.questions)) {
    quizData.questions = result.questions;
  } else if (Array.isArray(result)) {
    // If it returned just an array of questions
    quizData.questions = result;
  }

  // Ensure we have the right number of questions
  if (quizData.questions.length > numQuestions) {
    quizData.questions = quizData.questions.slice(0, numQuestions);
  } else if (quizData.questions.length < numQuestions) {
    // Add placeholder questions if needed
    while (quizData.questions.length < numQuestions) {
      quizData.questions.push({
        question: `Question ${quizData.questions.length + 1}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A"
      });
    }
  }

  // Validate each question
  quizData.questions = quizData.questions.map((q, index) => ({
    question: q.question || `Question ${index + 1}`,
    options: Array.isArray(q.options) && q.options.length >= 4 
      ? q.options.slice(0, 4) 
      : ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: q.correctAnswer || "Option A"
  }));

  return quizData;
};

/**
 * Generate summary from document text
 */
export const generateSummary = async (documentText) => {
  const prompt = `Summarize the following document in 3-5 sentences:\n\n${documentText}`;
  
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: 'llama3.2:3b',
      prompt,
      stream: false
    }, { timeout: 30000 });
    
    return response.data.response;
  } catch (error) {
    console.error('Summary generation error:', error.message);
    return "Summary could not be generated.";
  }
};

/**
 * Chat with context
 */
export const chatWithContext = async (question, relevantChunks) => {
  const context = relevantChunks.map(c => c.content).join('\n\n');
  const prompt = `Context:\n${context}\n\nQuestion: ${question}\nAnswer concisely:`;
  
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: 'llama3.2:3b',
      prompt,
      stream: false
    }, { timeout: 30000 });
    
    return response.data.response;
  } catch (error) {
    console.error('Chat generation error:', error.message);
    return "Sorry, I couldn't generate a response.";
  }
};

/**
 * Explain concept with context
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explain "${concept}" based on this context:\n\n${context}`;
  
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: 'llama3.2:3b',
      prompt,
      stream: false
    }, { timeout: 30000 });
    
    return response.data.response;
  } catch (error) {
    console.error('Explanation generation error:', error.message);
    return "Sorry, I couldn't generate an explanation.";
  }
};