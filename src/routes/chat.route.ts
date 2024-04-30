import { Router } from "express";
import {
  createGroupChat,
  createPrivateChat,
  getAllGroupChats,
  getAllPrivateChats,
  getChat,
} from "../controllers/chat.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(isAuth);

router.get("/getAllPrivateChats", getAllPrivateChats);
router.get("/getAllGroupChats", getAllGroupChats);
router.get("/:chatId", getChat);

router.post("/createPrivateChats", createPrivateChat);
router.post("/createGroupChats", createGroupChat);

export default router;
