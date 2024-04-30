import { Router } from "express";
import {
  addFriend,
  deleteUser,
  getAllUsers,
  getFriends,
  getUser,
  updateUserDetails,
  uploadAvatar,
  uploadCoverImage,
} from "../controllers/user.controller.js";
import { allowFor, isAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { UserRole } from "../types/user.type.js";

const router = Router();

// Protect all routes after this middlewares
router.use(isAuth);

router.get("/", getAllUsers);
router.get("/friends", getFriends);
router.post("/addFriend/:friendUsername", addFriend);

router.patch("/updateUserDetails", updateUserDetails);
router.patch("/uploadAvatar", upload.single("avatar"), uploadAvatar);
router.patch(
  "/uploadCoverImage",
  upload.single("coverImage"),
  uploadCoverImage
);

router.route("/:id").get(getUser).delete(allowFor(UserRole.ADMIN), deleteUser);

export default router;
