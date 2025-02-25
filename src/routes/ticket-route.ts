import express from "express";
import { authorize } from "../helpers/authorize";
import { handleInitiateTicket } from "../controllers/ticket/initiate-ticket-controller";
import { handleCompleteTicket } from "../controllers/ticket/complete-ticket-controller";

const router = express.Router();

router.post("/:qrCode/initiate", authorize(["TICKETER"]), handleInitiateTicket);
router.post("/:qrCode/complete", authorize(["TICKETER"]), handleCompleteTicket);

export default router;
