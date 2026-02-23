import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

type Role = 'CUSTOMER' | 'ADMIN' | 'STAFF';
type Domain = 'customer' | 'admin';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: Role;
        domain?: Domain;
    };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export const authenticateOptional = (req: AuthRequest, _res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        next();
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
        req.user = decoded;
    } catch {
        req.user = undefined;
    }

    next();
};

export const authorizeRoles = (...roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Insufficient permissions' });
            return;
        }
        next();
    };
};

export const authorizeDomain = (domain: Domain) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (req.user?.domain !== domain) {
            res.status(403).json({ message: 'Invalid auth domain' });
            return;
        }
        next();
    };
};

export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF')) {
        res.status(403).json({ message: 'Admin access required' });
        return;
    }
    next();
};

export const authorizeCustomer = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'CUSTOMER') {
        res.status(403).json({ message: 'Customer access required' });
        return;
    }
    next();
};
