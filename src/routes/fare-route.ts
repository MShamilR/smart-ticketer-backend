import { handleGetFareList } from "../controllers/fare/get-fare-list-controller";
import { authorize } from "../helpers/authorize";
import express from "express";

const router = express.Router();

router.post("/get", authorize(["TICKETER"]), handleGetFareList);

export default router;
