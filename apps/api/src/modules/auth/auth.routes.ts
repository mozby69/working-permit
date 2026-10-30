import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { me, logout, loginController, createUserController, getRoleController, getPermissionController, getUsersController, updateRolePermissionsController, updateUserController } from "./auth.controller";
import { authRateLimiter } from "@/middleware/rate-limit.middleware";

const router = Router();

// router.post("/login", authRateLimiter, loginController); //enable when production
router.post("/login", loginController);
router.post("/signup", createUserController);
router.get("/roles", getRoleController)
router.get("/permissions", getPermissionController)
router.get("/users", getUsersController)
router.put("/roles/:id/permissions", updateRolePermissionsController)
router.put("/users/:id", updateUserController)
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);

export default router;
