import express from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();
const authController = new AuthController();

// Traditional Authentication Routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected Routes - require authentication
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, authController.changePassword);

// Google OAuth2 Routes
router.get('/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/auth/error',
        session: false 
    }),
    authController.googleCallback
);

// OAuth Error Route
router.get('/error', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'Authentication failed',
        timestamp: new Date().toISOString()
    });
});

export default router;
