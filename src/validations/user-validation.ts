import { body, check, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../core/api-error";

export const validateSignUpEmail = [
  body("email").isEmail().withMessage("Email must be a valid email address"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      throw new BadRequestError(
        "INVALID_REQUEST",
        "The request body is missing or improperly formatted"
      );
    }
    next();
  },
];

// export const validateCreateUser = [
//   check("uuid").optional().isUUID().withMessage("UUID must be a valid UUID"),
//   check("firstName").notEmpty().withMessage("First name is required"),
//   check("lastName").notEmpty().withMessage("Last name is required"),
//   check("email").isEmail().withMessage("Email must be a valid email address"),
//   check("password")
//     .isLength({ min: 6 })
//     .withMessage("Password must be at least 6 characters long"),
//   check("role")
//     .isIn(["customer", "bus_owner", "ticketer"])
//     .withMessage('Role must be one of "customer", "bus_owner", or "ticketer"'),

//   (req: Request, res: Response, next: NextFunction) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       throw new BadRequestError(
//         "VALIDATION_FAILED",
//         "Make sure all required fields are provided"
//       );
//     }
//     next();
//   },
// ];
