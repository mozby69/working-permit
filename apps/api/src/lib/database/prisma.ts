import "dotenv/config";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../../generated/prisma/client";

console.log("DATABASE CONFIG:", {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    passwordConfigured: Boolean(process.env.DB_PASSWORD),
});

const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    connectionLimit: 10,
    connectTimeout: 10000,
    acquireTimeout: 30000,

    // Required for your current MySQL 8.4 authentication setup
    allowPublicKeyRetrieval: true,
});

export const prisma = new PrismaClient({
    adapter,
    log: ["error", "warn"],
});