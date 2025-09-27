import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../infrastructure/repositories/UserRepository.js';

export class AuthController {
    constructor() {
        this.userRepository = new UserRepository();
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role
                },
                this.jwtSecret,
                { expiresIn: this.jwtExpiresIn }
            );

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    user: user.toSafeJSON()
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            const decoded = jwt.verify(token, this.jwtSecret);
            const user = await this.userRepository.findById(decoded.userId);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }

            res.json({
                success: true,
                data: {
                    user: user.toSafeJSON()
                }
            });

        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    }
}
