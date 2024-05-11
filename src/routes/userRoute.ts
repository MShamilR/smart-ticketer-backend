import express from "express";
import { handleNewUser } from "../controllers/userController";
const router = express.Router();

router.post("/register", handleNewUser);

export default router;
