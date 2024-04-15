import bcrypt from "bcryptjs";
import { errorHandler } from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/setup.ts";
import { users } from "../db/schema/users.ts";

export const signup = async (req, res, next) => {
  const { firstname, lastname, email, password, role } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password.toString(), salt);
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existingUser) {
      return next(
        errorHandler(409, "EMAIL_ALREADY_EXISTS", "Email already in use")
      );
    }
    const newUser = {
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role,
    };
    db.insert(users).values(newUser);
    res
      .status(201)
      .json({ code: "USER_CREATED", message: "User created successfully" });
  } catch (error) {
    next(error);
  }
};

/* export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found"));

    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "incorrect credentials"));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: hashedPassword, ...rest } = validUser._doc;
    const expiryDate = new Date(Date.now() + 3600000);
    res
      .cookie("access_token", token, { httpOnly: true, expires: expiryDate })
      .status(200)
      .json({ ...rest, token });
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res) => {
  res.clearCookie("access_token").status(200).json("Signout success");
};
 */
