import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";

const router = Router();

router.post(
  "/register",
  validateRequest(createUserZodSchema),
  UserController.createUser
);

router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  validateRequest(updateUserZodSchema),
  UserController.updateUser
);

router.get("/all-users", checkAuth(Role.ADMIN), UserController.getAllUsers);

router.patch(
  "/block/:id",
  checkAuth(Role.ADMIN),
  UserController.blockOrUnblockUser
);

export const UserRoutes = router;
