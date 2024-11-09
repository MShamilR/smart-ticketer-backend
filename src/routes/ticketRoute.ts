import express from "express";
import {
  handleCompleteTicket,
  handleInitiateTicket,
} from "../controllers/ticketController";
import { authorize } from "../helpers/authorise";

const router = express.Router();

router.post("/initiate", authorize(["TICKETER"]), handleInitiateTicket);
router.post("/complete", authorize(["TICKETER"]), handleCompleteTicket);

export default router;
