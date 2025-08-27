import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import UserRepository from '../repositories/UserRepository.js';
import { generateToken } from '../utils/jwt.util.js';
import { successResponse, errorResponse } from '../helpers/responseHelper.js';

const userRepository = new UserRepository();

export class AuthController {
    // Đăng ký bằng email/password
    async register(req, res) {
        try {
            const { email, username, full_name, phone, password } = req.body;

            // Validate required fields
            if (!email || !username || !password) {
                return errorResponse(res, 'Email, username, and password are required', 400);
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return errorResponse(res, 'Invalid email format', 400);
            }

            // Check if email already exists
            const emailExists = await userRepository.emailExists(email);
            if (emailExists) {
                return errorResponse(res, 'Email already exists', 409);
            }

            // Check if username already exists
            const usernameExists = await userRepository.usernameExists(username);
            if (usernameExists) {
                return errorResponse(res, 'Username already exists', 409);
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create new user
            const userData = {
                id_user: uuidv4(),
                email,
                username,
                full_name: full_name || '',
                phone: phone || '',
                password: hashedPassword,
                created_at: new Date()
            };

            const newUser = await userRepository.create(userData);

            // Generate JWT token
            const token = generateToken({
                userId: newUser.id_user,
                email: newUser.email,
                username: newUser.username
            });

            // Remove password from response
            const { password: _, ...userResponse } = newUser;

            return successResponse(res, {
                message: 'User registered successfully',
                user: userResponse,
                token
            }, 201);

        } catch (error) {
            console.error('Register error:', error);
            return errorResponse(res, 'Registration failed', 500, error.message);
        }
    }

    // Đăng nhập bằng email/username và password
    async login(req, res) {
        try {
            const { emailOrUsername, password } = req.body;

            if (!emailOrUsername || !password) {
                return errorResponse(res, 'Email/username and password are required', 400);
            }

            // Find user by email or username
            let user = await userRepository.findByEmail(emailOrUsername);
            if (!user) {
                user = await userRepository.findByUsername(emailOrUsername);
            }

            if (!user) {
                return errorResponse(res, 'Invalid credentials', 401);
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return errorResponse(res, 'Invalid credentials', 401);
            }

            // Generate JWT token
            const token = generateToken({
                userId: user.id_user,
                email: user.email,
                username: user.username
            });

            // Remove password from response
            const { password: _, ...userResponse } = user;

            return successResponse(res, {
                message: 'Login successful',
                user: userResponse,
                token
            });

        } catch (error) {
            console.error('Login error:', error);
            return errorResponse(res, 'Login failed', 500, error.message);
        }
    }

    // Lấy thông tin user hiện tại
    async getProfile(req, res) {
        try {
            // req.user đã được set bởi auth middleware
            const user = req.user;

            return successResponse(res, {
                message: 'User profile retrieved successfully',
                user
            });

        } catch (error) {
            console.error('Get profile error:', error);
            return errorResponse(res, 'Failed to get user profile', 500, error.message);
        }
    }

    // Cập nhật profile user
    async updateProfile(req, res) {
        try {
            const userId = req.user.id_user;
            const { full_name, phone, username } = req.body;

            // Check if username already exists (excluding current user)
            if (username && username !== req.user.username) {
                const usernameExists = await userRepository.usernameExists(username, userId);
                if (usernameExists) {
                    return errorResponse(res, 'Username already exists', 409);
                }
            }

            const updateData = {};
            if (full_name !== undefined) updateData.full_name = full_name;
            if (phone !== undefined) updateData.phone = phone;
            if (username !== undefined) updateData.username = username;

            const updatedUser = await userRepository.updateProfile(userId, updateData);

            return successResponse(res, {
                message: 'Profile updated successfully',
                user: updatedUser
            });

        } catch (error) {
            console.error('Update profile error:', error);
            return errorResponse(res, 'Failed to update profile', 500, error.message);
        }
    }

    // Đổi mật khẩu
    async changePassword(req, res) {
        try {
            const userId = req.user.id_user;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return errorResponse(res, 'Current password and new password are required', 400);
            }

            // Get user with password
            const user = await userRepository.getByIdWithPassword(userId);
            if (!user) {
                return errorResponse(res, 'User not found', 404);
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return errorResponse(res, 'Current password is incorrect', 400);
            }

            // Hash new password
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update password
            await userRepository.updatePassword(userId, hashedNewPassword);

            return successResponse(res, {
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);
            return errorResponse(res, 'Failed to change password', 500, error.message);
        }
    }

    // Xử lý Google OAuth callback
    async googleCallback(req, res) {
        try {
            // req.user được set bởi passport strategy
            const user = req.user;

            // Generate JWT token
            const token = generateToken({
                userId: user.id_user,
                email: user.email,
                username: user.username
            });

            // Redirect to frontend với token
            const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendURL}/auth/success?token=${token}`);

        } catch (error) {
            console.error('Google callback error:', error);
            const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendURL}/auth/error`);
        }
    }

    // Logout (chỉ cần client xóa token)
    async logout(req, res) {
        try {
            return successResponse(res, {
                message: 'Logout successful'
            });
        } catch (error) {
            console.error('Logout error:', error);
            return errorResponse(res, 'Logout failed', 500, error.message);
        }
    }
}
