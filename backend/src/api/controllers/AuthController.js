import { LoginCommand } from '../../application/UserAggregate/Commands/Login/LoginCommand.js';
import { VerifyTokenCommand } from '../../application/UserAggregate/Commands/VerifyToken/VerifyTokenCommand.js';

export class AuthController {
    constructor(loginHandler, verifyTokenHandler) {
        this.loginHandler = loginHandler;
        this.verifyTokenHandler = verifyTokenHandler;
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

            const command = new LoginCommand(email, password);
            const result = await this.loginHandler.handle(command);
            res.json(result.toJSON());

        } catch (error) {
            console.error('Login error:', error);
            
            if (error.message === 'Invalid email or password') {
                return res.status(401).json({
                    success: false,
                    message: error.message
                });
            }
            
            if (error.message.includes('Email') || error.message.includes('Password')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            
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

            const command = new VerifyTokenCommand(token);
            const result = await this.verifyTokenHandler.handle(command);
            res.json(result.toJSON());

        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    }
}
