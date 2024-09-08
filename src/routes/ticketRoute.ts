import express from "express";
import { handleInitiateTicket } from "../controllers/ticketController";
import { authorize } from "../helpers/authorise";

const router = express.Router();

router.post("/initiate", authorize(["TICKETER"]), handleInitiateTicket);

export default router;
