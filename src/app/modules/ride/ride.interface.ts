import { Types } from "mongoose";

export interface IGeoLocation {
  lat: number;
  long: number;
}

export enum RideStatus {
   REQUESTED = "REQUESTED",
   ACCEPTED = "ACCEPTED",
   PICKED_UP = "PICKED_UP",
   IN_TRANSIT = "IN_TRANSIT",
   COMPLETED = "COMPLETED",
   CANCELLED = "CANCELLED",
   REJECTED = "REJECTED"
}

export interface IRide {
  rider: Types.ObjectId;
  driver?: Types.ObjectId | null;
  fareTk: number;
  distanceKm: number;
  pickupAddress?: string;
  pickupLocation: IGeoLocation;
  destinationAddress?: string;
  destinationLocation: IGeoLocation;
  status: RideStatus;
  requestedAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  rating?: number;
  feedback?: string;
}
