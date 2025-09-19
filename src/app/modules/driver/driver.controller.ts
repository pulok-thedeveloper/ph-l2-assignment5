/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { DriverServices } from "./driver.service";

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

export const DriverController = {
  approveDriver,
  suspendDriver,
};
