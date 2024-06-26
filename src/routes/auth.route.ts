import { Router } from "express";
import {
  forgotPassword,
  getAuthUser,
  login,
  logout,
  resetPassword,
  signup,
  updateUserPassword,
} from "../controllers/auth.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetToken", resetPassword);

// Protect all routes after this middlewares
router.use(isAuth);

router.get("/me", getAuthUser);
router.patch("/updateMyPassword", updateUserPassword);
router.get("/logout", logout);

export default router;
