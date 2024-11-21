import express from "express";
import { handleRegisterBus } from "../controllers/busController";
import { authorize } from "../helpers/authorize";

const router = express.Router();

router.post("/add", authorize(["BUS_OPERATOR"]), handleRegisterBus);
// router.get("/signout", signout);

export default router;
