import { Router } from "express";
import { DriverController } from "./driver.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

router.patch("/approve/:id", checkAuth(Role.ADMIN), DriverController.approveDriver);
router.patch(
  "/suspend/:id",
  checkAuth(Role.ADMIN),
  DriverController.suspendDriver
);

export const DriverRoutes = router;
