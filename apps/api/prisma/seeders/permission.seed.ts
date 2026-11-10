import { prisma } from "../../src/lib/database/prisma";

export async function seedPermissions() {
    const permissions = [
        {
            code: "USER_MANAGE",
            name: "Manage Users",
        },
        {
            code: "ADMIN_MANAGE",
            name: "Manage Admin",
        },
        {
            code: "BRANCH_MANAGE",
            name: "Manage Branch",
        },
        {
            code: "VIEW_WORKING_PERMIT",
            name: "view list",
        },

        {
            code: "ADD_WORKING_PERMIT",
            name: "add working",
        },
    ];

    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: {
                code: permission.code,
            },
            update: {
                name: permission.name,
            },
            create: permission,
        });
    }

    console.log("✅ Permissions seeded");
}