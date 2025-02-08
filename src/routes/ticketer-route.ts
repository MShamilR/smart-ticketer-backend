import express from "express";
import { authorize } from "../helpers/authorize";
import { handleInviteTicketer } from "../controllers/ticketer/invite-ticketer-controller";
import { handleAcceptTicketer } from "../controllers/ticketer/accept-ticketer-controller";

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
