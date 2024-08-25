import express from "express";
import { handleRegisterBus } from "../controllers/busController";
import { authorize } from "../helpers/authorise";

const router = express.Router();

router.post("/initiate", authorize(["TICKETER"]), handleRegisterBus);

export default router;
