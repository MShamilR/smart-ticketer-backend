import express from "express";
import { handleSignIn } from "../controllers/authController.js";
const router = express.Router();

router.post("/signin", handleSignIn);
// router.get("/signout", signout);

export default router;
