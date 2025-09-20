/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { DriverServices } from "./driver.service";
import { User } from "../user/user.model";

const approveDriver = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const driverId = req.params.id;
    const driver = await DriverServices.approveDriver(driverId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.ACCEPTED,
      message: "Driver approved",
      data: driver,
    });
  }
);

const suspendDriver = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const driverId = req.params.id;
    const driver = await DriverServices.suspendDriver(driverId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.ACCEPTED,
      message: "Driver suspended",
      data: driver,
    });
  }
);

const setAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const driverId = req.user.userId;

    const driver = await DriverServices.setAvailability(driverId, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Driver is now ${req.body.isOnline ? "online" : "offline"}`,
      data: driver,
    });
  }
);

const getEarnings = catchAsync(async (req: Request, res: Response) => {
  const driverId = req.user.userId; // assuming auth middleware sets this
  const result = await DriverServices.getEarnings(driverId);

  res.status(200).json({
    success: true,
    message: "Earnings retrieved successfully",
    data: result,
  });
});

export const DriverController = {
  approveDriver,
  suspendDriver,
  setAvailability,
  getEarnings,
};
