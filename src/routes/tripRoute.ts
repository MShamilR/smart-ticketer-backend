import express from "express";
import { authorize } from "../helpers/authorize";
import { handleInitiateTrip } from "../controllers/tripController";

const router = express.Router();

router.post("/initiate", authorize(["TICKETER"]), handleInitiateTrip);

export default router;
