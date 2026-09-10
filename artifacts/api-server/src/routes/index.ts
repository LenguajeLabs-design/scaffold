import { Router, type IRouter } from "express";
import healthRouter from "./health";
import lessonPlanRouter from "./lesson-plan";
import classroomCopilotRouter from "./classroom-copilot";

import accessRouter from "./access";

const router: IRouter = Router();

router.use(healthRouter);
router.use(accessRouter);
router.use(lessonPlanRouter);
router.use(classroomCopilotRouter);

export default router;
