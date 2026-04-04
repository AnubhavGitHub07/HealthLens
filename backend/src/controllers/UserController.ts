import { Response } from 'express';
import { User, HealthMetrics } from '../models';
import { AuthRequest } from '../middleware/errorHandler';
import { validationResult } from 'express-validator';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  }

  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { firstName, lastName, dateOfBirth, gender, bio, allergies, medicalHistory, currentMedications } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        bio,
        allergies,
        medicalHistory,
        currentMedications
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  }

  static async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
    await User.findByIdAndDelete(req.userId);
    await HealthMetrics.deleteOne({ userId: req.userId });

    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Account deleted successfully' });
  }

  static async getSettings(req: AuthRequest, res: Response): Promise<void> {
    const user = await User.findById(req.userId).select('email firstName lastName');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      settings: {
        email: user.email,
        notificationsEnabled: true,
        emailNotifications: true,
        dataSharing: false
      }
    });
  }

  static async updateSettings(req: AuthRequest, res: Response): Promise<void> {
    const { notificationsEnabled, emailNotifications, dataSharing } = req.body;

    // Settings would typically be stored in User or a separate UserSettings collection
    // For now, we'll return a confirmation
    res.status(200).json({
      message: 'Settings updated successfully',
      settings: {
        notificationsEnabled,
        emailNotifications,
        dataSharing
      }
    });
  }

  static async getHealthData(req: AuthRequest, res: Response): Promise<void> {
    const metrics = await HealthMetrics.findOne({ userId: req.userId });

    if (!metrics) {
      res.status(404).json({ message: 'No health data found' });
      return;
    }

    res.status(200).json({ metrics });
  }

  static async addHealthMetric(req: AuthRequest, res: Response): Promise<void> {
    const { date, bloodPressure, heartRate, bloodGlucose, weight, steps, sleepHours, stressLevel, customMetrics } = req.body;

    let metrics = await HealthMetrics.findOne({ userId: req.userId });

    if (!metrics) {
      metrics = new HealthMetrics({
        userId: req.userId,
        metrics: []
      });
    }

    metrics.metrics.push({
      date: new Date(date) || new Date(),
      bloodPressure,
      heartRate,
      bloodGlucose,
      weight,
      steps,
      sleepHours,
      stressLevel,
      customMetrics
    });

    metrics.lastUpdated = new Date();
    await metrics.save();

    res.status(201).json({
      message: 'Health metric added successfully',
      metrics
    });
  }
}
