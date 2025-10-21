/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { RideServices } from "./ride.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";

// Rider requests a ride
export const requestRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodeToken = req.user as JwtPayload;
    const ride = await RideServices.requestRide({
      ...req.body,
      rider: decodeToken.userId,
    });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Ride requested successfully!",
      data: ride,
    });
  }
);

// Rider or Driver cancels a ride
export const cancelRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodeToken = req.user as JwtPayload;
    const rideId = req.params.id as string;

    const ride = await RideServices.cancelRide(rideId, decodeToken.userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Ride cancelled successfully!",
      data: ride,
    });
  }
);

// Get my rides (rider/driver)
export const getMyRides = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodeToken = req.user as JwtPayload;

    const rides = await RideServices.getMyRides(decodeToken.userId, decodeToken.role);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Rides retrieved successfully!",
      data: rides,
    });
  }
);

// Available Requested Rides (driver)
export const getAvailableRequestedRides = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodeToken = req.user as JwtPayload;

    const availableRides = await RideServices.getAvailableRequestedRides(
      decodeToken.userId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Available Requested Rides Retrived successfully!`,
      data: availableRides,
    });
  }
);

// Get single ride
export const getRideById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const ride = await RideServices.getRideById(id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Ride retrieved successfully!",
      data: ride,
    });
  }
);

// Dynamic ride status update (driver)
export const updateRideStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodeToken = req.user as JwtPayload;
    const id = req.params.id as string;
    const { status } = req.body;

    const ride = await RideServices.updateRideStatus(
      id,
      decodeToken.userId,
      status
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Ride ${status.toLowerCase()} successfully!`,
      data: ride,
    });
  }
);

const addRideFeedback = async (req: Request, res: Response) => {
  const decodeToken = req.user as JwtPayload;
  const rideId = req.params.id as string;
  const { rating, feedback } = req.body;

  const updatedRide = await RideServices.addRideFeedback(
    rideId,
    decodeToken.userId,
    rating,
    feedback
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: `Feedback submitted successfully`,
    data: updatedRide,
  });
};

const getAdminAnalytics = async (req: Request, res: Response) => {
  const data = await RideServices.getAdminAnalytics();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Admin analytics fetched successfully`,
    data: data,
  });
};

export const RideController = {
  requestRide,
  cancelRide,
  getRideById,
  getMyRides,
  getAvailableRequestedRides,
  updateRideStatus,
  addRideFeedback,
  getAdminAnalytics,
};
