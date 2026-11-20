import { Permission, Role } from "../admin/access-control.types";

export interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    isActive: boolean;
    roles: Role[];
    permissions: Permission[];
    branchAssignments?: UserBranchAssignment[];
}

export interface UserBranchAssignment {
  branchId: number;
  branch: {
    id: number;
    entityName: string;
    isBranch: boolean;
  };
}


export interface LoginResponse {
    success: boolean;
    message: string;
    user: User;
}

export type AuthenticatedUser = {
    id: number;
    name: string;
    username: string;
    roles: string[];
    permissions: string[];
};

export type RoleName = Role["name"];
export type PermissionName = Permission["name"];