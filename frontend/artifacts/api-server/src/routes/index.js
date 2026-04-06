import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import tasksRouter from "./tasks";
import dashboardRouter from "./dashboard";
const router = Router();
router.use(healthRouter);
router.use(authRouter);
router.use(tasksRouter);
router.use(dashboardRouter);
var stdin_default = router;
export {
  stdin_default as default
};
