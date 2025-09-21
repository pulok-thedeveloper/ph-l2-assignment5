import express from "express";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { RideController } from "./ride.controller";
import { requestRideZodSchema, updateRideStatusZodSchema } from "./ride.validation";

const router = express.Router();

// Rider requests a ride
router.post(
  "/request",
  checkAuth(Role.RIDER),
  validateRequest(requestRideZodSchema),
  RideController.requestRide
);

// Rider cancels a ride
router.post(
  "/cancel/:id",
  checkAuth(Role.RIDER, Role.DRIVER),
  RideController.cancelRide
);

// Get my rides
router.get("/my", checkAuth(Role.RIDER, Role.DRIVER), RideController.getMyRides);

router.get(
  "/available",
  checkAuth("DRIVER"),
  RideController.getAvailableRequestedRides
);

// Get ride by ID
router.get(
  "/:id",
  checkAuth(Role.RIDER, Role.DRIVER, Role.ADMIN),
  RideController.getRideById
);

// Dynamic ride status update (driver)
router.post(
  "/status/:id",
  checkAuth(Role.DRIVER),
  validateRequest(updateRideStatusZodSchema),
  RideController.updateRideStatus
);

// Rider Ratings and feedback (Rider)
router.post(
  "/feedback",
  checkAuth(Role.RIDER),
  RideController.addRideFeedback
);

export const RideRoutes = router;
