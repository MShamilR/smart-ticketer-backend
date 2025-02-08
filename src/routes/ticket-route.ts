import express from "express";
import { authorize } from "../helpers/authorize";
import { handleInitiateTicket } from "../controllers/ticket/initiate-ticket-controller";
import { handleCompleteTicket } from "../controllers/ticket/complete-ticket-controller";

const router = express.Router();

router.post("/initiate", authorize(["TICKETER"]), handleInitiateTicket);
router.post("/complete", authorize(["TICKETER"]), handleCompleteTicket);

export default router;
