import { Router } from "express";
import { createWorkingController, getAllWorkingController, updateWorkingController } from "./working.cotroller";


const router = Router();
router.get("/working", getAllWorkingController);
router.post("/working", createWorkingController);
router.patch("/working/:id", updateWorkingController);

export default router;