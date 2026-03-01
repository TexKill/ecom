import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Subscriber } from "../models/Subscriber";
import { validateBody } from "../middleware/Validate";
import { subscribeSchema } from "../validation/subscriber";

const subscriberRouter = express.Router();

// @desc   Subscribe email
// @route  POST /api/subscribers
// @access Public
subscriberRouter.post(
  "/",
  validateBody(subscribeSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const email = String(req.body.email).trim().toLowerCase();

    const exists = await Subscriber.findOne({ email }).lean();
    if (exists) {
      res.status(409).json({ message: "Email is already subscribed" });
      return;
    }

    await Subscriber.create({ email });
    res.status(201).json({ message: "Subscribed successfully" });
  }),
);

export default subscriberRouter;

