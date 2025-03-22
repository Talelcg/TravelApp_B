import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import authController from "../controllers/authcontroller";
import multer from "multer";
import path from "path";

// ... Swagger comments ...

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/profile_pictures"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = Router();
router.post('/google', authController.googleLogin);


// Other routes...
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/:id', authController.getUserById);
router.post("/upload-profile-picture/:userId", upload.single("profilePicture"), authController.updateProfilePicture);
router.post("/update-bio/:userId", authController.updateBio);

export default router;
