import { User } from "../user/user.model";
import { IDriverProfile, Role } from "../user/user.interface";
import AppError from "../../helpers/AppError";
import httpStatus from "http-status-codes";
import mongoose from "mongoose";

const approveDriver = async (driverId: string) => {
  const driver = await User.findById(driverId);

  if (!driver || driver.role !== Role.DRIVER) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  if (driver.driverProfile) {
    driver.driverProfile.isApproved = true;
    driver.driverProfile.isSuspended = false;
  }

  await driver.save();

  return driver;
};

const suspendDriver = async (driverId: string) => {
  const driver = await User.findById(driverId);

  if (!driver || driver.role !== Role.DRIVER) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  if (driver.driverProfile) {
    driver.driverProfile.isOnline = false;
    driver.driverProfile.isSuspended = true;
    driver.driverProfile.isApproved = false;
  }

  await driver.save();

  return driver;
};

const setAvailability = async (
  driverId: string,
  payload: Partial<IDriverProfile>
) => {
  const driver = await User.findById(driverId);
  const { isOnline } = payload;

  if (!driver) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!driver.driverProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver profile missing");
  }

  if (driver.driverProfile.isSuspended) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Suspended drivers cannot change availability"
    );
  }

  driver.driverProfile.isOnline = isOnline as boolean;
  await driver.save();
};

const getEarnings = async (driverId: string) => {
  const objectId = new mongoose.Types.ObjectId(driverId);
  const driver = await User.findById(driverId)
    .select("driverProfile")
    .populate({
      path: "driverProfile.earnings.ride",
      select: "distanceKm pickupAddress destinationAddress completedAt fareTk",
    });

  if (!driver || !driver.driverProfile) {
    throw new AppError(httpStatus.NOT_FOUND, "Driver not found");
  }

  console.log("driver", driver)

  const result = await User.aggregate([
    { $match: { _id: objectId } },

    { $unwind: "$driverProfile.earnings" },

    {
      $lookup: {
        from: "rides",
        localField: "driverProfile.earnings.ride",
        foreignField: "_id",
        as: "ride",
      },
    },
    { $unwind: "$ride" },

    {
      $project: {
        earning: "$driverProfile.earnings.earning",
        distanceKm: "$ride.distanceKm",
        pickupAddress: "$ride.pickupAddress",
        destinationAddress: "$ride.destinationAddress",
        completedAt: "$ride.completedAt",
      },
    },

    { $sort: { completedAt: -1 } },
  ]);

  const totalEarnings = result.reduce((sum, e) => sum + (e.earning || 0), 0);

  return {
    totalEarnings,
    earningsHistory: result,
  };
};

export const DriverServices = {
  approveDriver,
  suspendDriver,
  setAvailability,
  getEarnings,
};
