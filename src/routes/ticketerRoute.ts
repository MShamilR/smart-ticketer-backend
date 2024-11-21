import express from "express";
import {
  handleInviteTicketer,
  handleAcceptTicketer,
} from "../controllers/ticketersController";
import { authorize } from "../helpers/authorize";

const router = express.Router();

router.post(
  "/invite-ticketer",
  authorize(["BUS_OPERATOR"]),
  handleInviteTicketer
);
router.post(
  "/accept-ticketer",
  authorize(["TICKETER", "PASSENGER"]),
  handleAcceptTicketer
);

export default router;
