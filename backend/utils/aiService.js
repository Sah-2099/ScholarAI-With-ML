// utils/aiService.js
import ollama from 'ollama';

const MODEL = 'llama3.2:3b';

export const generateContent = async (prompt) => {
  try {
    const response = await ollama.generate({
      model: MODEL,
      prompt: prompt,
      stream: false,
      // Optional: slightly more creative responses
      options: {
        temperature: 0.7,
        num_predict: 512
      }
    });
    return response.response.trim();
  } catch (error) {
    console.error("Local LLM Error:", error);
    throw new Error("AI service temporarily unavailable. Please try again.");
  }
};

// Keep your existing functions — they’ll work the same!
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `
You are an AI tutor creating study flashcards.
Generate exactly ${count} educational flashcards from the text below.

Instructions:
- Each flashcard must test understanding, not just recall.
- Use clear, concise questions.
- Answers should be factual and directly from the text.
- Assign difficulty honestly: easy (basic), medium (requires thought), hard (complex).

Format:
Q: Question
A: Answer
D: Difficulty (easy | medium | hard)

Separate each flashcard using ---
Text:
${text.substring(0, 15000)}
`;

  try {
    const generatedText = await generateContent(prompt);
    const cards = generatedText.split("---").filter(Boolean);

    return cards
      .map(card => {
        const lines = card.split("\n");
        let question = "",
          answer = "",
          difficulty = "medium";

        for (const line of lines) {
          if (line.startsWith("Q:")) question = line.slice(2).trim();
          if (line.startsWith("A:")) answer = line.slice(2).trim();
          if (line.startsWith("D:")) {
            const d = line.slice(2).trim().toLowerCase();
            if (["easy", "medium", "hard"].includes(d)) difficulty = d;
          }
        }

        return question && answer
          ? { question, answer, difficulty }
          : null;
      })
      .filter(Boolean)
      .slice(0, count);
  } catch (error) {
    console.error("Flashcards generation failed:", error);
    throw new Error("Failed to generate flashcards");
  }
};

export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `
You are an AI exam designer.
Generate exactly ${numQuestions} multiple-choice questions based on the text below.

Instructions:
- Questions must be clear and unambiguous.
- Only one correct answer per question.
- Distractors (wrong options) should be plausible.
- Provide a short explanation for the correct answer.
- Assign difficulty: easy, medium, or hard.

Format:
Q: Question
O1: Option 1
O2: Option 2
O3: Option 3
O4: Option 4
C: Correct option (e.g., O2)
E: Explanation
D: Difficulty (easy | medium | hard)

Separate each question using ---
Text:
${text.substring(0, 15000)}
`;

  try {
    const generatedText = await generateContent(prompt);
    const blocks = generatedText.split("---").filter(Boolean);

    return blocks
      .map(block => {
        const lines = block.split("\n");
        let question = "",
          options = [],
          correctAnswer = "",
          explanation = "",
          difficulty = "medium";

        for (const line of lines) {
          const l = line.trim();
          if (l.startsWith("Q:")) question = l.slice(2).trim();
          if (/^O[1-4]:/.test(l)) options.push(l.slice(3).trim());
          if (l.startsWith("C:")) correctAnswer = l.slice(2).trim();
          if (l.startsWith("E:")) explanation = l.slice(2).trim();
          if (l.startsWith("D:")) {
            const d = l.slice(2).trim().toLowerCase();
            if (["easy", "medium", "hard"].includes(d)) difficulty = d;
          }
        }

        return question && options.length === 4 && correctAnswer
          ? { question, options, correctAnswer, explanation, difficulty }
          : null;
      })
      .filter(Boolean)
      .slice(0, numQuestions);
  } catch (error) {
    console.error("Quiz generation failed:", error);
    throw new Error("Failed to generate quiz");
  }
};

export const generateSummary = async text => {
  const prompt = `
You are an AI study assistant.
Provide a clear, concise, and educational summary of the following text.
- Highlight key ideas, definitions, and important concepts.
- Use complete sentences.
- Keep it under 200 words.

Text:
${text.substring(0, 20000)}
`;

  try {
    return await generateContent(prompt);
  } catch (error) {
    console.error("Summary generation failed:", error);
    throw new Error("Failed to generate summary");
  }
};

export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join("\n\n");

  const prompt = `
You are an AI Learning Assistant helping a student understand their study material.

Answer the question using ONLY the context below.
If the answer is not in the context, say: "I cannot answer that based on the provided document."

Instructions:
- Explain concepts clearly and simply.
- Use 2–5 complete sentences.
- If helpful, include a short example.
- Do NOT invent information.

Context:
${context}

Question: ${question}

Answer:
`;

  try {
    return await generateContent(prompt);
  } catch (error) {
    console.error("Chat generation failed:", error);
    throw new Error("Failed to process chat request");
  }
};

export const explainConcept = async (concept, context) => {
  const prompt = `
You are an AI tutor explaining concepts to a student.

Explain the concept "${concept}" clearly and simply.
- Use 3–5 complete sentences.
- Include a real-world example if possible.
- Base your explanation ONLY on the context below.
- If the concept isn't covered, say: "I cannot explain that based on the provided material."

Context:
${context.substring(0, 10000)}
`;

  try {
    return await generateContent(prompt);
  } catch (error) {
    console.error("Concept explanation failed:", error);
    throw new Error("Failed to explain concept");
  }
};