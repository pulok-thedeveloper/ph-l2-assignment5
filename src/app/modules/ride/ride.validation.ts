import z from "zod/v3";
import { RideStatus } from "./ride.interface";

const geoLocationSchema = z.object({
  lat: z.number(),
  long: z.number(),
});

export const requestRideZodSchema = z.object({
  distanceKm: z
    .number()
    .positive({ message: "Distance must be greater than 0" }),
  pickupAddress: z.string().optional(),
  pickupLocation: geoLocationSchema,
  destinationAddress: z.string().optional(),
  destinationLocation: geoLocationSchema,
});

export const updateRideStatusZodSchema = z.object({
  status: z.nativeEnum(RideStatus, {
    errorMap: () => ({ message: "Invalid ride status" })
  })
});