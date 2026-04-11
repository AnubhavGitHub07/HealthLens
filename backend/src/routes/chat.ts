import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import authMiddleware from "../middleware/auth";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Store conversation histories per user (in production, use a database)
const conversationHistories: Map<string, Array<{role: string; content: string}>> = new Map();

// GET /api/chat/history - Get conversation history for user
router.get("/history", authMiddleware, (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const history = conversationHistories.get(userId) || [];
    
    res.status(200).json({
      success: true,
      messages: history
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      message
    });
  }
});

// POST /api/chat/send - Send a chat message and get AI response
router.post("/send", authMiddleware, async (req: any, res: any) => {
  try {
    const { message, reportSummary } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty"
      });
    }

    console.log(`[CHAT] User: ${userId}, Message: ${message.substring(0, 50)}...`);

    // Get or initialize conversation history
    let history = conversationHistories.get(userId) || [];

    // Add user message to history
    history.push({
      role: "user",
      content: message
    });

    // Build the full conversation for the API
    const messages = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    console.log(`[CHAT] Total messages in history: ${history.length}`);

    // Create the model with the system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are HealthLens, a friendly and empathetic health assistant. Your role is to help users understand their medical reports and health information in simple, non-technical language.

PERSONALITY & TONE:
- Friendly, supportive, and encouraging
- Clear and accessible (explain medical terms in parentheses)
- Empathetic to health concerns
- Never replace professional medical advice
- Use simple everyday words, NOT medical jargon

RESPONSE FORMAT - ALWAYS USE:
✅ ALWAYS respond with BULLET POINTS (use • or - or emojis)
✅ KEEP each point SHORT and SIMPLE (1-2 lines max)
✅ Use simple words that a 10-year-old would understand
✅ Break complex ideas into multiple small points
✅ Use relevant emojis to make it visual and friendly
✅ NEVER write long paragraphs

EXAMPLE GOOD FORMAT:
• 💚 Your glucose is normal - this means your body is handling sugar well
• ⚠️ Your cholesterol is a bit high - eat more vegetables and less fried food
• 🎯 Next step: Walk 30 minutes daily to help your heart

EXAMPLE BAD FORMAT (DON'T DO THIS):
"Your glucose level indicates that your body is managing blood sugar appropriately. Your cholesterol levels suggest..."

GUIDELINES:
1. Always use bullet points with emojis
2. Keep each bullet point simple and short
3. Explain medical terms in simple parentheses like: sodium (salt)
4. Provide practical, actionable advice
5. Use positive language even for concerns
6. Add a friendly closing emoji

${reportSummary ? `\nUSER'S LATEST REPORT SUMMARY:\n${reportSummary}` : ''}

Remember: Simple, friendly, visual with emojis, and ALWAYS in bullet points!`
    });

    console.log(`[CHAT] Sending request to Gemini API...`);

    // Send request to Gemini API
    const response = await model.generateContent({
      contents: messages
    });

    const aiResponse = response.response.text();
    console.log(`[CHAT] Received response from Gemini: ${aiResponse.substring(0, 50)}...`);

    // Add AI response to history
    history.push({
      role: "model",
      content: aiResponse
    });

    // Save updated history
    conversationHistories.set(userId, history);

    res.status(200).json({
      success: true,
      message: aiResponse,
      messageCount: history.length
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[CHAT ERROR]", message);
    console.error("[CHAT ERROR] Full error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI response",
      error: process.env.NODE_ENV === 'development' ? message : undefined
    });
  }
});

// POST /api/chat/clear - Clear conversation history
router.post("/clear", authMiddleware, (req: any, res: any) => {
  try {
    const userId = req.user.id;
    conversationHistories.delete(userId);

    res.status(200).json({
      success: true,
      message: "Conversation cleared"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      success: false,
      message
    });
  }
});

export default router;
