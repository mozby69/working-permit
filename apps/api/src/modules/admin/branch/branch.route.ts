import { Router } from "express";
import { createDepartmentBranchController, deleteDepartmentBranchController, getBranchWorkingController, getDepartmentBranchesController, getPaginationDepartmentBranchesController, updateDepartmentBranchController } from "./branch.controller";
import { authenticate } from "@/middleware/authenticate.middleware";
import { authorize } from "@/middleware/authorize.middleware";




const router = Router();
router.get("/department-branches", getDepartmentBranchesController);
router.get("/pagination-branches", getPaginationDepartmentBranchesController);
router.post("/department-branches", createDepartmentBranchController);
router.patch("/department-branches/:id", updateDepartmentBranchController);
router.delete("/department-branches/:id", deleteDepartmentBranchController);
router.get( "/my-working-permits", authenticate, authorize({ roles: ["BRANCH"], }), getBranchWorkingController);


export default router;