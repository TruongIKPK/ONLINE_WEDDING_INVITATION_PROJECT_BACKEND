import { verifyToken } from '../utils/jwt.util.js';
import UserRepository from '../repositories/UserRepository.js';

const userRepository = new UserRepository();

// Middleware để verify JWT token
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        const decoded = verifyToken(token);
        
        // Lấy thông tin user từ database
        const user = await userRepository.getById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

// Middleware kiểm tra optional authentication (không bắt buộc phải có token)
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = verifyToken(token);
            const user = await userRepository.getById(decoded.userId);
            
            if (user) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Không trả về lỗi, chỉ tiếp tục không có user
        next();
    }
};
