import { prisma } from "../../src/lib/database/prisma";

export async function seedRoles() {
    const roles = [
        {
            name: "ADMIN",
            permissions: [
                "USER_MANAGE",
                "ADMIN_MANAGE",
            ],
        },
        {
            name: "USER",
            permissions: [
                "ADD_WORKING_PERMIT",
                "VIEW_WORKING_PERMIT",
            ],
        },
         {
            name: "COORDINATOR",
            permissions: [
                "ADD_WORKING_PERMIT",
                "VIEW_WORKING_PERMIT",
            ],
        },
         {
            name: "CHECKER ",
            permissions: [
                "ADD_WORKING_PERMIT",
                "VIEW_WORKING_PERMIT",
            ],
        },
    ];

    for (const role of roles) {
        const createdRole = await prisma.role.upsert({
            where: {
                name: role.name,
            },
            update: {},
            create: {
                name: role.name,
            },
        });

        for (const permissionCode of role.permissions) {
            const permission = await prisma.permission.findUnique({
                where: {
                    code: permissionCode,
                },
            });

            if (!permission) {
                throw new Error(
                    `Permission "${permissionCode}" not found.`
                );
            }

            await prisma.rolePermission.upsert({
                where: {
                    roleId_permissionId: {
                        roleId: createdRole.id,
                        permissionId: permission.id,
                    },
                },
                update: {},
                create: {
                    roleId: createdRole.id,
                    permissionId: permission.id,
                },
            });
        }
    }

    console.log("✅ Roles seeded");
}