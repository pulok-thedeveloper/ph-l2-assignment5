/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { RideServices } from "./ride.service";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";

// Rider requests a ride
export const requestRide = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const riderId = req.user.userId;
    const ride = await RideServices.requestRide({
      ...req.body,
      rider: riderId,
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
    const userId = req.user.userId;
    const rideId = req.params.id as string;

    const ride = await RideServices.cancelRide(rideId, userId);
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
    const userId = req.user.userId;
    const role = req.user.role;

    const rides = await RideServices.getMyRides(userId, role);
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
    const driverId = req.user.userId;

    const availableRides = await RideServices.getAvailableRequestedRides(
      driverId
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
    const driverId = req.user.userId;
    const id = req.params.id as string;
    const { status } = req.body;

    const ride = await RideServices.updateRideStatus(id, driverId, status);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Ride ${status.toLowerCase()} successfully!`,
      data: ride,
    });
  }
);

const addRideFeedback = async (req: Request, res: Response) => {
  const riderId = req.user._id;
  const { rideId, rating, feedback } = req.body;

  const updatedRide = await RideServices.addRideFeedback(
    rideId,
    riderId,
    rating,
    feedback
  );

  res.status(200).json({
    success: true,
    message: "Feedback submitted successfully",
    data: updatedRide,
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
};
