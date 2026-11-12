import { Router } from "express";
import { createDepartmentBranchController, deleteDepartmentBranchController, getDepartmentBranchesController, updateDepartmentBranchController } from "./branch.controller";




const router = Router();
router.get("/department-branches", getDepartmentBranchesController);
router.post("/department-branches", createDepartmentBranchController);
router.patch("/department-branches/:id", updateDepartmentBranchController);
router.delete("/department-branches/:id", deleteDepartmentBranchController);


export default router;