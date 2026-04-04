import { Response } from 'express';
import axios from 'axios';
import { ChatMessage, HealthReport } from '../models';
import { AuthRequest } from '../middleware/errorHandler';
import { validationResult } from 'express-validator';

// Gemini AI API integration
const generateAIResponse = async (userMessage: string): Promise<string> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured, using fallback response');
      return getFallbackResponse(userMessage);
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a helpful health information assistant. A user is asking about their health metrics or medical report. Provide clear, accurate, and compassionate responses. Always remind them to consult with healthcare professionals for medical advice.\n\nUser question: ${userMessage}`
              }
            ]
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (content) {
      return content;
    }

    return getFallbackResponse(userMessage);
  } catch (error) {
    console.error('Error calling Gemini API:', error instanceof Error ? error.message : error);
    return getFallbackResponse(userMessage);
  }
};

// Fallback responses when API is unavailable
const getFallbackResponse = (userMessage: string): string => {
  const responses: Record<string, string> = {
    'blood pressure': 'Normal blood pressure is typically below 120/80 mmHg. Elevated readings may require medical attention.',
    'heart rate': 'A normal resting heart rate for adults is 60-100 bpm. Regular exercise can help optimize your heart rate.',
    'blood glucose': 'Normal fasting blood glucose is 70-100 mg/dL. If you have elevated levels, consult with your doctor.',
    'cholesterol': 'Healthy cholesterol levels include LDL below 100 mg/dL and HDL above 60 mg/dL.',
    'weight': 'Maintaining a healthy weight reduces risks of various health conditions. Consult a healthcare provider for personalized advice.',
    'sleep': 'Most adults need 7-9 hours of quality sleep per night for optimal health.',
    'stress': 'Regular exercise, meditation, and proper sleep can help manage stress levels effectively.'
  };

  const lowerMessage = userMessage.toLowerCase();
  for (const [key, value] of Object.entries(responses)) {
    if (lowerMessage.includes(key)) {
      return value;
    }
  }

  return 'Thank you for your question. I\'m analyzing your health data to provide a personalized response. Please consult with a healthcare professional for medical advice.';
};

export class ChatController {
  static async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { message, reportId } = req.body;

    // Verify report exists if provided
    if (reportId) {
      const report = await HealthReport.findOne({
        _id: reportId,
        userId: req.userId
      });

      if (!report) {
        res.status(404).json({ message: 'Report not found' });
        return;
      }
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(message);

    // Save chat message
    const chatMessage = new ChatMessage({
      userId: req.userId,
      userMessage: message,
      aiResponse,
      context: {
        reportId,
        topic: 'health-analysis'
      },
      tokens_used: {
        prompt: Math.ceil(message.length / 4),
        completion: Math.ceil(aiResponse.length / 4),
        total: Math.ceil((message.length + aiResponse.length) / 4)
      }
    });

    await chatMessage.save();

    res.status(201).json({
      message: 'Chat message processed',
      chat: chatMessage
    });
  }

  static async getChatHistory(req: AuthRequest, res: Response): Promise<void> {
    const { page = 1, limit = 20, reportId } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;

    const query: any = { userId: req.userId };
    if (reportId) {
      query['context.reportId'] = reportId;
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await ChatMessage.countDocuments(query);

    res.status(200).json({
      messages,
      pagination: {
        current: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  }

  static async deleteChatMessage(req: AuthRequest, res: Response): Promise<void> {
    const { messageId } = req.params;

    const message = await ChatMessage.findOneAndDelete({
      _id: messageId,
      userId: req.userId
    });

    if (!message) {
      res.status(404).json({ message: 'Chat message not found' });
      return;
    }

    res.status(200).json({ message: 'Chat message deleted successfully' });
  }

  static async rateChatMessage(req: AuthRequest, res: Response): Promise<void> {
    const { messageId } = req.params;
    const { rating, isHelpful, comment } = req.body;

    const message = await ChatMessage.findOneAndUpdate(
      { _id: messageId, userId: req.userId },
      {
        feedback: {
          rating,
          isHelpful,
          comment
        }
      },
      { new: true }
    );

    if (!message) {
      res.status(404).json({ message: 'Chat message not found' });
      return;
    }

    res.status(200).json({
      message: 'Rating submitted successfully',
      chat: message
    });
  }

  static async getChatStats(req: AuthRequest, res: Response): Promise<void> {
    const totalMessages = await ChatMessage.countDocuments({ userId: req.userId });
    const averageRating = await ChatMessage.aggregate([
      { $match: { userId: req.userId, 'feedback.rating': { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$feedback.rating' } } }
    ]);

    res.status(200).json({
      stats: {
        totalMessages,
        averageRating: averageRating[0]?.avgRating || 0,
        helpful: await ChatMessage.countDocuments({
          userId: req.userId,
          'feedback.isHelpful': true
        })
      }
    });
  }
}
