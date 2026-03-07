import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { validateBody } from "../middleware/Validate";
import { subscribeSchema } from "../validation/subscriber";
import { subscribeEmail } from "../services/SubscriberService";

const subscriberRouter = express.Router();

// @desc   Subscribe email
// @route  POST /api/subscribers
// @access Public
subscriberRouter.post(
  "/",
  validateBody(subscribeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    await subscribeEmail(req.body.email);
    res.status(201).json({ message: "Subscribed successfully" });
  }),
);

export default subscriberRouter;
