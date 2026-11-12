import { Router } from "express";
import { getDepartmentBranchesController } from "./branch.controller";




const router = Router();
router.get("/department-branches", getDepartmentBranchesController)


export default router;