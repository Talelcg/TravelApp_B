import { NextFunction, Request, Response } from 'express';
import userModel, { IUser } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';




import { OAuth2Client } from 'google-auth-library';
// ...other imports

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req: Request, res: Response): Promise<void> => {
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

    let user = await userModel.findOne({ email: payload.email });

    if (!user) {
      user = await userModel.create({
        email: payload.email,
        username: payload.name,
        profileImage: payload.picture,
        password: 'google',
        bio: '',
      });
    }

    const tokens = generateToken(user._id);
    if (!tokens) {
      res.status(500).send('Token generation failed');
      return;
    }

    if (!user.refreshToken) user.refreshToken = [];
    user.refreshToken.push(tokens.refreshToken);
    await user.save();

    res.status(200).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: { _id: user._id, username: user.username, profileImage: user.profileImage }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google login failed' });
  }
};

export const getUsernameById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ username: user.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateUsername = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { username } = req.body;
  
      if (!username) {
        res.status(400).json({ message: "Username cannot be empty" });
        return;
      }
  
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { username },
        { new: true }
      );
  
      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json({ message: "Username updated successfully", username: updatedUser.username });
    } catch (error) {
      console.error("Error updating username:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  



const register = async (req: Request, res: Response) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({
          username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });
        res.status(200).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
};

type tTokens = {
    accessToken: string,
    refreshToken: string
}

const generateToken = (userId: string): tTokens | null => {
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    // generate token
    const random = Math.random().toString();
    const accessToken = jwt.sign({
        _id: userId,
        random: random
    },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRES });

    const refreshToken = jwt.sign({
        _id: userId,
        random: random
    },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES });
    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
};
const login = async (req: Request, res: Response) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).send('wrong username or password');
            return;
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            res.status(400).send('wrong username or password');
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            console.log("bli")
            res.status(500).send('Server Error');
            return;
        }
        // generate token
        const tokens = generateToken(user._id);
        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res.status(200).send(
            {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                _id: user._id
            });

    } catch (err) {
        res.status(400).send(err);
    }
};

type tUser = Document<unknown, {}, IUser> & IUser & Required<{
    _id: string;
}> & {
    __v: number;
}
const verifyRefreshToken = (refreshToken: string | undefined) => {
    return new Promise<tUser>((resolve, reject) => {
        //get refresh token from body
        if (!refreshToken) {
            reject("fail");
            return;
        }
        //verify token
        if (!process.env.TOKEN_SECRET) {
            reject("fail");
            return;
        }
        jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
            if (err) {
                reject("fail");
                return
            }
            //get the user id fromn token
            const userId = payload._id;
            try {
                //get the user form the db
                const user = await userModel.findById(userId);
                if (!user) {
                    reject("fail");
                    return;
                }
                if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
                    user.refreshToken = [];
                    await user.save();
                    reject("fail");
                    return;
                }
                const tokens = user.refreshToken!.filter((token) => token !== refreshToken);
                user.refreshToken = tokens;
                await user.save();
                
                resolve(user);
            } catch (err) {
                reject("fail");
                return;
            }
        });
    });
}

const logout = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        res.status(200).send("success");
    } catch (err) {
        res.status(400).json({ error: err });
    }
};

export const updateProfilePicture = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!req.file) {
        res.status(400).json({ message: "No image uploaded" });
        return;
      }
  
      // Save the relative path to the database
      const newProfilePictureUrl = `http://localhost:3000/profile_pictures/${req.file.filename}`;
      console.log(userId)
      const user = await userModel.findByIdAndUpdate(userId, { profileImage: newProfilePictureUrl }, { new: true });

      console.log(newProfilePictureUrl)
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
  
      res.json({ message: "Profile picture updated successfully", profileImage: newProfilePictureUrl });
    } catch (error) {
      console.error("Error updating profile picture:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userModel.findById(req.params.id).select('-password -refreshToken'); // מסיר את השדות הרגישים
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const refresh = async (req: Request, res: Response) => {
    try {
        const user = await verifyRefreshToken(req.body.refreshToken);
        if (!user) {
            res.status(400).send("fail");
            return;
        }
        const tokens = generateToken(user._id);

        if (!tokens) {
            res.status(500).send('Server Error');
            return;
        }
        if (!user.refreshToken) {
            user.refreshToken = [];
        }
        user.refreshToken.push(tokens.refreshToken);
        await user.save();
        res.status(200).send(
            {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                _id: user._id
            });
        //send new token
    } catch (err) {
        res.status(400).send("fail");
    }
};

type Payload = {
    _id: string;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header('authorization');
    const token = authorization && authorization.split(' ')[1];

    if (!token) {
        res.status(401).send('Access Denied');
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.status(500).send('Server Error');
        return;
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            res.status(401).send('Access Denied');
            return;
        }
        req.params.userId = (payload as Payload)._id;
        next();
    });
};

export const updateBio = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { bio } = req.body;
  
      if (!bio) {
        res.status(400).json({ message: "Bio cannot be empty" });
        return;
      }
  
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { bio },
        { new: true } // ✅ Return updated user
      );
  
      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }
  
      res.json({ message: "Bio updated successfully", bio: updatedUser.bio });
    } catch (error) {
      console.error("Error updating bio:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

export default {
    register,
    login,
    refresh,
    updateUsername,
    logout,getUsernameById,getUserById,updateBio,updateProfilePicture,googleLogin
};