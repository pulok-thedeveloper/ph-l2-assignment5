import AppError from "../../helpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, role, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already exist");
  }

  const hashedPassword = await bcryptjs.hash(password as string, 10);

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const userData = {
    email,
    password: hashedPassword,
    auths: [authProvider],
    role,
    ...rest,
  };

  if (role === Role.DRIVER) {
    userData.driverProfile = {
      isApproved: false,
      isSuspended: false,
      isOnline: false,
      earnings: 0,
      currentRide: null,
    };
  }

  const user = await User.create(userData);

  return user;
};

const getAllUsers = async (role?: string) => {
  const filter = role ? { role } : {};

  const users = await User.find(filter).select("-password");
  const totalUsers = await User.countDocuments(filter);

  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not exist");
  }

  if (payload.role) {
    if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.isActive || payload.isDeleted) {
    if (decodedToken.role === Role.RIDER || decodedToken.role === Role.DRIVER) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password,
      Number(envVars.BCRYPT_SALT_ROUND)
    );
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

export const blockOrUnblockUser = async (
  userId: string,
  payload: Partial<IUser>
) => {
  const isActive = payload.isActive;
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
  blockOrUnblockUser,
};
