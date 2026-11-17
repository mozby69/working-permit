import { NextFunction, Request, Response } from "express";
import { createWorkingService, getAllWorkingService, updateWorkingService } from "./working.service";
import { createWorkingSchema, updateWorkingSchema, workingIdSchema } from "@repo/shared";

export async function getAllWorkingController(
    req: Request,
    res: Response,
    next: NextFunction  
) {
    try{
        const data = await getAllWorkingService();

        return res.status(200).json({
            success: true,
            data
        });
    }catch(error){
        next(error);
    }
}

export async function createWorkingController(
    req: Request,
    res: Response,
    next: NextFunction  
) {
    try{
        const parsed = createWorkingSchema.safeParse(
            req.body
        );

        if(!parsed.success){
            return res.status(400).json({
                success: false,
                errors: parsed.error.flatten(),
            });
        }

        const data = await createWorkingService(parsed.data);

        return res.status(200).json({
            success: true,
            message: "Created successfully",
            data,
        });

    }catch(error){
        next(error);
    }
}


export async function updateWorkingController(
   req: Request,
   res: Response,
   next: NextFunction  
){
    try{

        const params = workingIdSchema.safeParse(
            req.params
        );

          if(!params.success){
            return res.status(400).json({
                success: false,
                message: "Invalid ID",
            });
        }

        const parsed =   updateWorkingSchema.safeParse(
            req.body
        );

        if(!parsed.success){
            return res.status(400).json({
                success: false,
                errors: parsed.error.flatten(),
            });
        }

        const data = await updateWorkingService(
            params.data.id,
            parsed.data
        );

        return res.status(200).json({
            success: true,
            message: "Updated successfully",
            data
        });

    }catch(error){
        next(error);
    }
}