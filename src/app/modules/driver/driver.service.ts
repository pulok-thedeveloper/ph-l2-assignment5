import { User } from "../user/user.model";
import { Role } from "../user/user.interface";
import AppError from "../../helpers/AppError";
import httpStatus from "http-status-codes";

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
  }

  await driver.save();

  return driver;
};

export const DriverServices = {
  approveDriver,
  suspendDriver,
};
