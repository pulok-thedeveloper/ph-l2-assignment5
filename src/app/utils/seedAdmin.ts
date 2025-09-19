import { envVars } from "../config/env";
import { IAuthProvider, IUser, Role } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";

export const seedAdmin = async () => {
  try {
    const isSuperAdmin = await User.findOne({ role: Role.ADMIN });
    if (isSuperAdmin) {
      console.log("Admin already exist");
      return;
    }

    const hashedPassword = await bcryptjs.hash(
      envVars.ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: envVars.ADMIN_EMAIL,
    };

    const payload: IUser = {
      name: "Admin",
      email: envVars.ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.ADMIN,
      auths: [authProvider]
    };

    const superAdmin = await User.create(payload);

    console.log("Admin Created Successfully!", superAdmin);
  } catch (error) {
    console.log(error);
  }
};
