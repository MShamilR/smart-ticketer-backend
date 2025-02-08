import { handleSignIn } from "../controllers/auth/sign-in-controller";
import express from "express";
const router = express.Router();

router.post("/signin", handleSignIn);

export default router;
