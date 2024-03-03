import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  resetPassword,
  signup,
  updateUserPassword,
} from "../controllers/auth.controller.js";
import {
  deleteUser,
  getAllUsers,
  getUser,
  updateUserDetails,
  uploadAvatar,
  uploadCoverImage,
} from "../controllers/user.controller.js";
import { allowFor, isAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { UserRole } from "../types/user.type.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword/:resetToken", resetPassword);

// Protect all routes after this middlewares
router.use(isAuth);

router.get("/", getAllUsers);
router.patch("/updateMyPassword", updateUserPassword);
router.patch("/updateUserDetails", updateUserDetails);
router.patch("/uploadAvatar", upload.single("avatar"), uploadAvatar);
router.patch(
  "/uploadCoverImage",
  upload.single("coverImage"),
  uploadCoverImage
);
router.get("/logout", logout);
router.route("/:id").get(getUser).delete(allowFor(UserRole.ADMIN), deleteUser);

export default router;
