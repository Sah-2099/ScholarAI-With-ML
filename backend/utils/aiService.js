// backend/utils/aiService.js
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';

/**
 * Call Ollama with proper error handling and JSON parsing
 */
const callOllama = async (prompt, model = 'llama3.2:3b', customTimeout = 180000) => {
  try {
    const response = await axios.post(OLLAMA_URL, {
      model,
      prompt,
      stream: false,
      format: 'json'
    }, { timeout: customTimeout });

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
  // Simplify the prompt for better reliability
  const prompt = `
Generate exactly ${count} flashcards as a JSON array.
Each card: {"question": "string", "answer": "string", "difficulty": "easy"|"medium"|"hard"}
Document: ${documentText.substring(0, 2000)}...`;
  
  const result = await callOllama(prompt, 'llama3.2:3b', 120000);
  
  if (Array.isArray(result)) {
    return result.slice(0, count);
  }
  
  if (result.cards && Array.isArray(result.cards)) {
    return result.cards.slice(0, count);
  }
  
  if (result.question && result.answer) {
    return [result];
  }
  
  throw new Error('Expected array of flashcards');
};

/**
 * Generate quiz from document text
 */
export const generateQuiz = async (documentText, numQuestions = 5) => {
  // Use a much simpler, more reliable prompt
  const prompt = `
Create a quiz with exactly ${numQuestions} multiple-choice questions in JSON format.
Format: {"title": "Quiz Title", "questions": [{"question": "Q?", "options": ["A","B","C","D"], "correctAnswer": "A"}]}
Rules: Only JSON, no explanations, exactly ${numQuestions} questions, 4 options each.
Content: ${documentText.substring(0, 1500)}...`;

  const result = await callOllama(prompt, 'llama3.2:3b', 180000);
  
  const quizData = {
    title: result.title || "Generated Quiz",
    questions: []
  };

  if (result.questions && Array.isArray(result.questions)) {
    quizData.questions = result.questions;
  } else if (Array.isArray(result)) {
    quizData.questions = result;
  }

  // Ensure correct number of questions
  if (quizData.questions.length < numQuestions) {
    while (quizData.questions.length < numQuestions) {
      quizData.questions.push({
        question: `Question ${quizData.questions.length + 1}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A"
      });
    }
  }
  
  if (quizData.questions.length > numQuestions) {
    quizData.questions = quizData.questions.slice(0, numQuestions);
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
  const prompt = `Summarize in 3-5 sentences: ${documentText.substring(0, 2000)}...`;
  
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: 'llama3.2:3b',
      prompt,
      stream: false
    }, { timeout: 60000 }); // Increased to 60 seconds
    
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
  const context = relevantChunks.map(c => c.content).join('\n\n').substring(0, 1500);
  const prompt = `Answer based on context: ${context}\n\nQuestion: ${question}`;
  
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: 'llama3.2:3b',
      prompt,
      stream: false
    }, { timeout: 60000 }); // Increased to 60 seconds
    
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
  const prompt = `Explain "${concept}" using: ${context.substring(0, 1500)}...`;
  
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: 'llama3.2:3b',
      prompt,
      stream: false
    }, { timeout: 60000 }); // Increased to 60 seconds
    
    return response.data.response;
  } catch (error) {
    console.error('Explanation generation error:', error.message);
    return "Sorry, I couldn't generate an explanation.";
  }
};