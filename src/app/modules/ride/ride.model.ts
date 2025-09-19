import { Schema, model } from "mongoose";
import { IRide, RideStatus } from "./ride.interface";

const GeoLocationSchema = new Schema(
  {
    lat: { type: Number, required: true },
    long: { type: Number, required: true },
  },
  { _id: false, versionKey: false }
);

const RideSchema = new Schema<IRide>(
  {
    rider: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driver: { type: Schema.Types.ObjectId, ref: "User", default: null },

    fareTk: { type: Number, required: true },
    distanceKm: { type: Number, required: true },

    pickupAddress: { type: String },
    pickupLocation: { type: GeoLocationSchema, required: true },

    destinationAddress: { type: String },
    destinationLocation: { type: GeoLocationSchema, required: true },

    status: {
      type: String,
      enum: Object.values(RideStatus),
      default: RideStatus.REQUESTED,
    },

    requestedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    pickedUpAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

RideSchema.pre("save", function (next) {
  if (this.isModified("distanceKm") || this.isNew) {
    this.fareTk = this.distanceKm * 20; // 20tk per km
  }
  next();
});

export const Ride = model<IRide>("Ride", RideSchema);
