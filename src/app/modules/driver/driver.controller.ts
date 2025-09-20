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

// const setAvailability = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const driverId = req.user.userId;
//     const { isOnline } = req.body;

//     const driver = await User.findById(driverId);
//     if (!driver || driver.role !== "DRIVER") {
//       return res
//         .status(httpStatus.FORBIDDEN)
//         .json({ message: "Only drivers allowed" });
//     }

//     if (!driver.driverProfile) {
//       return res
//         .status(httpStatus.BAD_REQUEST)
//         .json({ message: "Driver profile missing" });
//     }

//     if (driver.driverProfile.isSuspended) {
//       return res
//         .status(httpStatus.FORBIDDEN)
//         .json({ message: "Suspended drivers cannot change availability" });
//     }

//     driver.driverProfile.isOnline = isOnline;
//     await driver.save();

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: `Driver is now ${isOnline ? "online" : "offline"}`,
//       data: { isOnline: driver.driverProfile.isOnline },
//     });
//   }
// );

// const getEarnings = catchAsync(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const driverId = req.user._id;
//     const driver = await User.findById(driverId).select("driverProfile");

//     if (!driver || driver.role !== "DRIVER") {
//       return res
//         .status(httpStatus.FORBIDDEN)
//         .json({ message: "Only drivers allowed" });
//     }

//     const profile = driver.driverProfile;
//     if (!profile) {
//       return res
//         .status(httpStatus.BAD_REQUEST)
//         .json({ message: "Driver profile missing" });
//     }

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: "Earnings fetched successfully",
//       data: {
//         earnings: profile.earnings,
//         currentRide: profile.currentRide,
//         isOnline: profile.isOnline,
//       },
//     });
//   }
// );

export const DriverController = {
  approveDriver,
  suspendDriver,
};
