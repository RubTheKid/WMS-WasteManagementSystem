import jwt from 'jsonwebtoken';
import { UserRepository } from '../../infrastructure/repositories/UserRepository.js';

export class AuthMiddleware {
    constructor() {
        this.userRepository = new UserRepository();
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    }

    authenticate = async (req, res, next) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Access denied. No token provided.'
                });
            }

            const decoded = jwt.verify(token, this.jwtSecret);
            const user = await this.userRepository.findById(decoded.userId);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. User not found.'
                });
            }

            // add user info to request object
            req.user = user.toSafeJSON();
            next();

        } catch (error) {
            console.error('Authentication error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    };

    requireAdmin = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                });
            }

            next();

        } catch (error) {
            console.error('Admin check error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    requireEmployee = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!['ADMIN', 'EMPLOYEE'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Employee or admin access required'
                });
            }

            next();

        } catch (error) {
            console.error('Employee check error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
}
