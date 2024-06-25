import express from "express";
import { handleCreateUser, handleSignUpEmail, handleVerifyEmail } from "../controllers/userController";
const router = express.Router();

router.post("/email", handleSignUpEmail);
router.post("/email/verify", handleVerifyEmail);
router.post("/create", handleCreateUser)

export default router;
