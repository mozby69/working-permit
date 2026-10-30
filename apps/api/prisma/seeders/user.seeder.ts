import bcrypt from "bcrypt";
import { prisma } from "../../src/lib/database/prisma";

export async function seedUsers() {
    console.log("🌱 Seeding users...");

    const adminRole = await prisma.role.findUnique({
        where: {
            name: "ADMIN",
        },
    });

    if (!adminRole) {
        throw new Error(
            "ADMIN role not found. Run role seeder first."
        );
    }

    const password = await bcrypt.hash("Admin123", 12);

    const admin = await prisma.user.upsert({
        where: {
            email: "admin@fms.local",
        },
        update: {
            name: "System",
            username: "Admin",
        },
        create: {
            email: "admin@fms.local",
            password,
            name: "System",
            username: "Admin",
        },
    });

    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: admin.id,
                roleId: adminRole.id,
            },
        },
        update: {},
        create: {
            userId: admin.id,
            roleId: adminRole.id,
        },
    });

    console.log(`✅ Admin user seeded: ${admin.email}`);
}