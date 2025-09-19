import { model, Schema } from "mongoose";
import {
  IAuthProvider,
  IDriverProfile,
  IsActive,
  IUser,
  Role,
} from "./user.interface";

const AuthProviderSchema = new Schema<IAuthProvider>(
  {
    provider: {
      type: String,
      enum: ["google", "credentials"],
      required: true,
    },
    providerId: { type: String, required: true },
  },
  { _id: false, versionKey: false }
);

const DriverProfileSchema = new Schema<IDriverProfile>(
  {
    isApproved: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    earnings: { type: Number, default: 0 },
    currentRide: { type: Schema.Types.ObjectId, ref: "Ride", default: null },
  },
  { _id: false, versionKey: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    phone: { type: String },
    picture: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.RIDER,
      required: true,
    },
    auths: { type: [AuthProviderSchema], required: true },
    driverProfile: { type: DriverProfileSchema, default: null },
  },
  { timestamps: true, versionKey: false }
);

export const User = model<IUser>("User", UserSchema);
