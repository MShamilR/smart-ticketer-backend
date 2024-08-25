import express from "express";
import { handleSignIn } from "../controllers/authController.js";
const router = express.Router();

router.post("/signin", handleSignIn);

export default router;
