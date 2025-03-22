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

router.post('/google', async (req: Request, res: Response): Promise<void> => {
    const { credential } = req.body;
  
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
  
      const payload = ticket.getPayload();
      if (!payload?.email) {
        res.status(400).json({ message: 'Invalid Google token' });
        return;
      }
  
      let user = await User.findOne({ email: payload.email });
      if (!user) {
        user = await User.create({
          email: payload.email,
          username: payload.name,
          profilePicture: payload.picture,
          password: 'google',
          bio: ''
        });
      }
  
      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.TOKEN_SECRET!,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({ accessToken, user });
    } catch (error) {
      console.error('Google login error:', error);
      res.status(500).json({ message: 'Google login failed' });
    }
  });
  

// Other routes...
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/:id', authController.getUserById);
router.post("/upload-profile-picture/:userId", upload.single("profilePicture"), authController.updateProfilePicture);
router.post("/update-bio/:userId", authController.updateBio);

export default router;
