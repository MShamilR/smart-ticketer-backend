import { validateSignUpEmail } from "../validations/user-validation";
import express from "express";
import {
  handleCreateUser,
  handleSignUpEmail,
  handleVerifyEmail,
} from "../controllers/user-controller";
const router = express.Router();

router.post("/email", validateSignUpEmail, handleSignUpEmail);
router.post("/email/verify", handleVerifyEmail);
router.post("/create", handleCreateUser);

export default router;
