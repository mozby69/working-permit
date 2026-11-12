import { NextFunction, Request, Response } from "express";
import { getDepartmentBranchesService } from "./branch.service";


export async function getDepartmentBranchesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { isBranch } = req.query;

    if (
      isBranch !== undefined &&
      isBranch !== "true" &&
      isBranch !== "false"
    ) {
      return res.status(400).json({
        success: false,
        message: "isBranch must be true or false",
      });
    }

    const filter =
      isBranch === undefined
        ? undefined
        : isBranch === "true";

    const data = await getDepartmentBranchesService(filter);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}