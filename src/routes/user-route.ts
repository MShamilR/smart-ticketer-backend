import { validateSignUpEmail } from "../validations/user-validation";
import { handleSignUpEmail } from "../controllers/user/sign-up-email-controller";
import { handleVerifyEmail } from "../controllers/user/verify-email-controller";
import { handleCreateUser } from "../controllers/user/create-user-controller";
import express from "express";
import { appRoles } from "../db/schema/users";
import { authorize } from "../helpers/authorize";
import { handleGetUserDetails } from "../controllers/user/get-user-details-controller";

const router = express.Router();

router.post("/", authorize([...appRoles]), handleGetUserDetails);
router.post("/email", validateSignUpEmail, handleSignUpEmail);
router.post("/email/verify", handleVerifyEmail);
router.post("/create", handleCreateUser);

export default router;
