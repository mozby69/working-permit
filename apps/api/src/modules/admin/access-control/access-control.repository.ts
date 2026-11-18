import { prisma } from "@/lib/database/prisma";
import { Prisma } from "../../../../generated/prisma/client";

type FindAllUsersParams = {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sort?: string;
};

export async function findAllUsers(
    params: FindAllUsersParams
) {
    const {
        page = 1,
        limit = 10,
        search,
        role,
        status,
        sort,
    } = params;

    const where: Prisma.UserWhereInput = {};

    if (search?.trim()) {
        where.OR = [
            {
                name: {
                    contains: search,
                    // mode: "insensitive",
                },
            },
            {
                username: {
                    contains: search,
                    // mode: "insensitive",
                },
            },
            {
                email: {
                    contains: search,
                    // mode: "insensitive",
                },
            },
        ];
    }

    if (status && status !== "all") {
        where.isActive =
            status === "active";
    }

    if (role && role !== "all") {
        where.roles = {
            some: {
                role: {
                    name: role,
                },
            },
        };
    }

    let orderBy: Prisma.UserOrderByWithRelationInput = {
        username: "asc",
    };

    switch (sort) {
        case "name_asc":
            orderBy = {
                name: "asc",
            };
            break;

        case "name_desc":
            orderBy = {
                name: "desc",
            };
            break;

        case "username_asc":
            orderBy = {
                username: "asc",
            };
            break;

        case "username_desc":
            orderBy = {
                username: "desc",
            };
            break;

        case "date_desc":
            orderBy = {
                createdAt: "desc",
            };
            break;

        case "date_asc":
            orderBy = {
                createdAt: "asc",
            };
            break;
    }

    const [users, total] =
        await prisma.$transaction([
            prisma.user.findMany({
                where,

                select: {
                    id: true,
                    username: true,
                    name: true,
                    email: true,
                    isActive: true,
                    createdAt: true,

                    roles: {
                        select: {
                            role: {
                                select: {
                                    id: true,
                                    name: true,
                                    description: true,

                                    permissions: {
                                        select: {
                                            permission: {
                                                select: {
                                                    id: true,
                                                    code: true,
                                                    name: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    branchAssignments: {
                    include: {
                        branch: {
                        select: {
                            id: true,
                            entityName: true,
                            isBranch: true,
                        },
                        },
                    },
                    },
                },

                skip: (page - 1) * limit,
                take: limit,
                orderBy,
            }),

            prisma.user.count({
                where,
            }),
        ]);

    return {
        data: users,

        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
}

export async function findAllRoles() {
    return prisma.role.findMany({
        select: {
            id: true,
            name: true,
            description: true,
            permissions: {
                select: {
                    permission: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function findAllPermissions() {
    return prisma.permission.findMany({
        select: {
            id: true,
            code: true,
            name: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}

export async function findUserById(userId: number) {
    return prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
}

export async function findRoleById(roleId: number) {
    return prisma.role.findUnique({
        where: {
            id: roleId,
        },
    });
}

export async function findDuplicateUser(
    username: string,
    email?: string | null,
    excludeUserId?: number
) {
    return prisma.user.findFirst({
        where: {
            ...(excludeUserId && {
                id: {
                    not: excludeUserId,
                },
            }),

            OR: [
                { username },
                ...(email ? [{ email }] : []),
            ],
        },
    });
}


export async function createUser(data: {
  name: string;
  username: string;
  email?: string | null;
  password: string;
  roleIds: number[];
  branchIds?: number[];
}) {
  return prisma.$transaction(async (tx) => {
    const branchIds = [...new Set(data.branchIds ?? [])];

    if (branchIds.length > 0) {
      const count = await tx.departmentBranches.count({
        where: {
          id: { in: branchIds },
          isBranch: true,
        },
      });

      if (count !== branchIds.length) {
        throw new Error("Invalid branch assignment");
      }
    }

    const user = await tx.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        isActive: true,

        roles: {
          create: data.roleIds.map((roleId) => ({
            role: {
              connect: { id: roleId },
            },
          })),
        },

        branchAssignments: {
          create: branchIds.map((branchId) => ({
            branch: {
              connect: { id: branchId },
            },
          })),
        },
      },
    });

    return tx.user.findUniqueOrThrow({
      where: { id: user.id },

      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },

        branchAssignments: {
          include: {
            branch: {
              select: {
                id: true,
                entityName: true,
                isBranch: true,
              },
            },
          },
        },
      },
    });
  });
}


export async function updateUser(
  userId: number,
  data: {
    name?: string;
    username?: string;
    email?: string | null;
    password?: string;
    isActive?: boolean;
    roleIds?: number[];
    branchIds?: number[];
  }
) {
  return prisma.$transaction(async (tx) => {
    if (data.branchIds !== undefined) {
      const branchIds = [...new Set(data.branchIds)];

      if (branchIds.length > 0) {
        const count = await tx.departmentBranches.count({
          where: {
            id: { in: branchIds },
            isBranch: true,
          },
        });

        if (count !== branchIds.length) {
          throw new Error("Invalid branch assignment");
        }
      }
    }

    await tx.user.update({
      where: { id: userId },

      data: {
        ...(data.name !== undefined && {
          name: data.name,
        }),

        ...(data.username !== undefined && {
          username: data.username,
        }),

        ...(data.email !== undefined && {
          email: data.email,
        }),

        ...(data.password !== undefined &&
          data.password !== "" && {
            password: data.password,
          }),

        ...(data.isActive !== undefined && {
          isActive: data.isActive,
        }),
      },
    });

    if (data.roleIds !== undefined) {
      await tx.userRole.deleteMany({
        where: { userId },
      });

      if (data.roleIds.length > 0) {
        await tx.userRole.createMany({
          data: [...new Set(data.roleIds)].map(
            (roleId) => ({
              userId,
              roleId,
            })
          ),
        });
      }
    }

    if (data.branchIds !== undefined) {
      await tx.userBranchAssignment.deleteMany({
        where: { userId },
      });

      if (data.branchIds.length > 0) {
        await tx.userBranchAssignment.createMany({
          data: [...new Set(data.branchIds)].map(
            (branchId) => ({
              userId,
              branchId,
            })
          ),
        });
      }
    }

    return tx.user.findUniqueOrThrow({
      where: { id: userId },

      include: {
        roles: {
          include: {
            role: true,
          },
        },

        branchAssignments: {
          include: {
            branch: {
              select: {
                id: true,
                entityName: true,
                isBranch: true,
              },
            },
          },
        },
      },
    });
  });
}


export const deleteUser = async (userId: number) => {
    return prisma.user.delete({
        where: {
            id: userId,
        },
    });
};

export async function createRole(data: {
    name: string;
    description?: string | null;
}) {
    return prisma.role.create({
        data,
    });
}

export async function updateRole(
    roleId: number,
    data: {
        name?: string;
        description?: string | null;
    }
) {
    return prisma.role.update({
        where: {
            id: roleId,
        },
        data,
    });
}

export async function updateRolePermissions(
  roleId: number,
  permissionIds: number[]
) {
  return prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({
      where: { roleId },
    });

    if (permissionIds.length === 0) {
      return;
    }

    await tx.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
    });
  });
}