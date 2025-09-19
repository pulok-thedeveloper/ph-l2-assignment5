/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User created successfully!",
      data: user,
    });
  }
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const role = req.query.role as string | undefined;
    const result = await UserServices.getAllUsers(role);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All User retrieved successfully!",
      data: result.data,
      meta: result.meta,
    });
  }
);

const blockOrUnblockUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id as string;
    const user = await UserServices.blockOrUnblockUser(userId, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `User ${req.body.isActive} successfully!`,
      data: user,
    });
  }
);

const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id as string;

    const verifiedToken = req.user;
    const payload = req.body;

    const user = await UserServices.updateUser(
      userId,
      payload,
      verifiedToken as JwtPayload
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User updated successfully!",
      data: user,
    });
  }
);

export const UserController = {
  createUser,
  getAllUsers,
  updateUser,
  blockOrUnblockUser,
};
