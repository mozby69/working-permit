import type {
    Permission,
    Role,
    User,
} from "@repo/shared";

export function mapUser(user: any): User {
    const roles: Role[] = user.roles.map(
        (entry: any) => ({
            id: entry.role.id,
            name: entry.role.name,
            description: entry.role.description,

            permissions:
                entry.role.permissions?.map(
                    (item: any): Permission => ({
                        id: item.permission.id,
                        code: item.permission.code,
                        name: item.permission.name,
                        description: item.permission.description,
                    })
                ) ?? [],
        })
    );

    const permissionMap = new Map<number, Permission>();

    for (const role of roles) {
        for (const permission of role.permissions ?? []) {
            permissionMap.set(
                permission.id,
                permission
            );
        }
    }

    const branchAssignments =
    user.branchAssignments?.map(
      (assignment: any) => ({
        branchId: assignment.branchId,

        branch: {
          id: assignment.branch.id,
          entityName: assignment.branch.entityName,
          isBranch: assignment.branch.isBranch,
        },
      })
    ) ?? [];

    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        roles,
        permissions: Array.from(
            permissionMap.values()
        ),
        branchAssignments,
    };
}

export function mapRole(role: any) {
    return {
        id: role.id,
        name: role.name,
        description: role.description,

        permissions: role.permissions.map(
            (item: any) => ({
                id: item.permission.id,
                code: item.permission.code,
                name: item.permission.name,
            })
        ),
    };
}