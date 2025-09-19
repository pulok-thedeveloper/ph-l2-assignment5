import { Types } from "mongoose";

export enum Role {
  RIDER = "RIDER",
  DRIVER = "DRIVER",
  ADMIN = "ADMIN",
}

export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IDriverProfile {
  isApproved: boolean;
  isSuspended: boolean;
  isOnline: boolean;
  earnings: number;
  currentRide?: Types.ObjectId | null;
}

export interface IUser {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  isDeleted?: boolean;
  isActive?: IsActive;
  role: Role;
  auths: IAuthProvider[];
  driverProfile?: IDriverProfile | null;
}
