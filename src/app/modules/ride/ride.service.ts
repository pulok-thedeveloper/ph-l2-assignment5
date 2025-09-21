import httpStatus from "http-status-codes";
import { Ride } from "./ride.model";
import { IRide, RideStatus } from "./ride.interface";
import { Types } from "mongoose";
import AppError from "../../helpers/AppError";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";

// Request ride
const requestRide = async (payload: Partial<IRide>): Promise<IRide> => {
  if (
    !payload.rider ||
    !payload.pickupLocation ||
    !payload.destinationLocation ||
    !payload.distanceKm
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Rider, pickup, and destination are required"
    );
  }

  return await Ride.create({
    ...payload,
    status: RideStatus.REQUESTED,
    requestedAt: new Date(),
    fareTk: payload.distanceKm * 20,
  });
};

// Cancel ride (rider or driver)
const cancelRide = async (rideId: string, userId: Types.ObjectId) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");

  if (ride.status !== RideStatus.REQUESTED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Ride cannot be cancelled after it has been accepted"
    );
  }

  if (!ride.rider.equals(userId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Not authorized to cancel this ride"
    );
  }

  ride.status = RideStatus.CANCELLED;
  ride.cancelledAt = new Date();
  await ride.save();

  return ride;
};


// Get rides for current user
const getMyRides = async (userId: Types.ObjectId, role: string) => {
  const objectId = new Types.ObjectId(userId);

  if (role === "RIDER")
    return await Ride.find({ rider: objectId }).sort({ createdAt: -1 });
  if (role === "DRIVER")
    return await Ride.find({ driver: objectId }).sort({ createdAt: -1 });
  throw new AppError(httpStatus.BAD_REQUEST, "Invalid role");
};

// Get ride by ID
const getRideById = async (rideId: string) => {
  const ride = await Ride.findById(rideId)
    .populate("rider", "name email phone")
    .populate("driver", "name email phone");

  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  return ride;
};

const getAvailableRequestedRides = async (driverId: string) => {
  const driver = await User.findById(driverId);

  if (!driver || driver.role !== "DRIVER") {
    throw new AppError(httpStatus.FORBIDDEN, "Only drivers can access rides");
  }

  if (!driver.driverProfile?.isApproved || driver.driverProfile?.isSuspended) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Driver not allowed to take rides"
    );
  }

  if (!driver.driverProfile?.isOnline) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Driver must be online to receive rides"
    );
  }

  // Fetch all ride requests that are not yet assigned
  const availableRides = await Ride.find({
    status: RideStatus.REQUESTED,
    driver: null,
  }).sort({ requestedAt: -1 });

  return availableRides;
};

// Dynamic ride status update (driver)
const updateRideStatus = async (
  rideId: string,
  driverId: Types.ObjectId,
  status: RideStatus
) => {
  const ride = await Ride.findById(rideId);
  const driver = await User.findById(driverId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");

  if (!driver) {
    throw new AppError(httpStatus.FORBIDDEN, "User not found");
  }

  const profile = driver.driverProfile;
  if (!profile)
    throw new AppError(httpStatus.BAD_REQUEST, "Driver profile missing");

  if (profile.isSuspended) {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is suspended");
  }

  const allowedTransitions: Record<RideStatus, RideStatus[]> = {
    REQUESTED: [RideStatus.ACCEPTED, RideStatus.REJECTED],
    ACCEPTED: [RideStatus.PICKED_UP],
    PICKED_UP: [RideStatus.IN_TRANSIT],
    IN_TRANSIT: [RideStatus.COMPLETED],
    COMPLETED: [],
    REJECTED: [],
    CANCELLED: [],
  };

  if (!allowedTransitions[ride.status].includes(status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot change status from ${ride.status} to ${status}`
    );
  }

  if (status === RideStatus.ACCEPTED && profile.currentRide) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You already have an active ride"
    );
  }

  if (
    status !== RideStatus.REJECTED &&
    ride.driver &&
    !ride.driver.equals(driverId)
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "Not assigned to this ride");
  }

  switch (status) {
    case RideStatus.ACCEPTED:
      ride.driver = driverId;
      ride.acceptedAt = new Date();
      profile.currentRide = ride._id;
      break;
    case RideStatus.REJECTED:
      ride.driver = driverId;
      break;
    case RideStatus.PICKED_UP:
      ride.pickedUpAt = new Date();
      break;
    case RideStatus.IN_TRANSIT:
      break;
    case RideStatus.COMPLETED:
      ride.completedAt = new Date();
      profile.earnings.push({
        ride: ride._id,
        earning: ride.fareTk,
      });
      profile.currentRide = null;
      break;
  }

  ride.status = status;
  await ride.save();
  await driver.save();

  return ride;
};


const addRideFeedback = async (
  rideId: string,
  riderId: Types.ObjectId,
  rating: number,
  feedback?: string
) => {
  const ride = await Ride.findById(rideId);
  if (!ride) throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  if (!ride.driver)
    throw new AppError(httpStatus.BAD_REQUEST, "No driver assigned");
  if (!ride.rider.equals(riderId))
    throw new AppError(httpStatus.FORBIDDEN, "Not your ride");
  if (ride.rating)
    throw new AppError(httpStatus.BAD_REQUEST, "Feedback already submitted");

  // Save feedback in ride
  ride.rating = rating;
  ride.feedback = feedback as string;
  await ride.save();

  // Update driver's global rating
  const driver = await User.findById(ride.driver);
  if (driver?.driverProfile) {
    const dp = driver.driverProfile;
    const newCount = (dp.ratingCount || 0) + 1;
    const newRating =
      ((dp.rating || 0) * (dp.ratingCount || 0) + rating) / newCount;

    dp.rating = newRating;
    dp.ratingCount = newCount;
    await driver.save();
  }

  return ride;
};

// Admin Analytics (Admin)
const getAdminAnalytics = async () => {
  const totalRiders = await User.countDocuments({ role: Role.RIDER });
  const totalDrivers = await User.countDocuments({ role: Role.DRIVER });
  const activeDrivers = await User.countDocuments({
    role: Role.DRIVER,
    "driverProfile.isApproved": true,
    "driverProfile.isOnline": true,
    "driverProfile.isSuspended": false,
  });
  const suspendedDrivers = await User.countDocuments({
    role: Role.DRIVER,
    "driverProfile.isSuspended": true,
  });

  // Ride stats
  const totalRides = await Ride.countDocuments();
  const completedRides = await Ride.countDocuments({
    status: RideStatus.COMPLETED,
  });
  const cancelledRides = await Ride.countDocuments({
    status: RideStatus.CANCELLED,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysRides = await Ride.countDocuments({
    requestedAt: { $gte: today },
  });

  const totalEarningsAgg = await Ride.aggregate([
    { $match: { status: RideStatus.COMPLETED } },
    { $group: { _id: null, total: { $sum: "$fareTk" } } },
  ]);
  const totalEarnings = totalEarningsAgg[0]?.total || 0;


  return {
    users: {
      totalRiders,
      totalDrivers,
      activeDrivers,
      suspendedDrivers,
    },
    rides: {
      totalRides,
      completedRides,
      cancelledRides,
      todaysRides,
    },
    earnings: {
      totalEarnings
    },
  };
};

export const RideServices = {
  requestRide,
  cancelRide,
  getRideById,
  getMyRides,
  getAvailableRequestedRides,
  updateRideStatus,
  addRideFeedback,
  getAdminAnalytics,
};
