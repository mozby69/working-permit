import { rateLimit } from "express-rate-limit";

// ==========================================
// General API Rate Limiter
// ==========================================

export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 300,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please try again later.",
    },
});

// ==========================================
// Authentication Rate Limiter
// ==========================================

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 5,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,
        code: "TOO_MANY_ATTEMPTS",
        message: "Too many attempts. Please try again later.",
    },
});