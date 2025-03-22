import { Request, Response } from 'express';
import PostModel from '../models/Post';
import User from '../models/User';
import mongoose, { Types } from 'mongoose';
import path from 'path';
import fs from 'fs';
 

export const addPost = async (req: Request, res: Response): Promise<void> => {
  
  try {
    const { title, content, location, rating } = req.body;
    const userId = req.params.userId; 
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    // קבלת הנתיב של התמונות שהועלו
    const imagePaths = req.files ? (req.files as Express.Multer.File[]).map(file =>  `http://localhost:3000/images/${file.filename}`) : [];

    const newPost = await PostModel.create({
      title,
      content,
      userId,
      location,
      rating,
      images: imagePaths, // שמירת הנתיבים של התמונות במסד הנתונים
      likes: [],
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });}
};
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await PostModel.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, location, rating } = req.body;
    let { images } = req.body;
    const postId = req.params.id;

    if (!postId) {
      res.status(400).json({ message: "Post ID is required" });
      return;
    }

    // חיפוש הפוסט במסד הנתונים
    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // לוודא שהתמונות הן מערך (גם אם ריק)
    if (!images) {
      images = []; // אם אין תמונות, נשלח מערך ריק כדי שלא יהיה undefined
    }

    // מציאת תמונות שנמחקו
    const imagesToRemove = post.images.filter((img: string) => !images.includes(img));

    // מחיקת התמונות מהשרת
    imagesToRemove.forEach((imagePath: string) => {
      const localPath = path.join(__dirname, "..", "public", "images", path.basename(imagePath));
      fs.unlink(localPath, (err: NodeJS.ErrnoException | null) => {
        if (err) console.error(`Failed to delete image: ${localPath}`, err);
      });
    });

    // עדכון הפוסט
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { title, content, location, rating, images, updatedAt: new Date() },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};



export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await PostModel.findByIdAndDelete(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Like a post// Like or unlike a post
export const toggleLikePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id; // מזהה הפוסט
    const userId = req.params.userId; // מזהה המשתמש

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);
    const likesArray = post.likes.map((id) => id.toString()); // המרת ObjectId למחרוזות

    if (likesArray.includes(userObjectId.toString())) {
      // אם המשתמש כבר עשה לייק, נסיר אותו
      post.likes = post.likes.filter((id) => id.toString() !== userObjectId.toString());
      await post.save();
      res.status(200).json({ message: "Post unliked", likes: post.likes.map(id => id.toString()) });
    } else {
      // אחרת נוסיף אותו
      post.likes.push(userObjectId);
      await post.save();
      res.status(200).json({ message: "Post liked", likes: post.likes.map(id => id.toString()) });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const getPostsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // ודא שהמזהה של המשתמש נמצא
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // חיפוש הפוסטים לפי מזהה המשתמש
    const posts = await PostModel.find({ userId: new mongoose.Types.ObjectId(userId) });

    // אם אין פוסטים עבור המשתמש, החזר הודעה מתאימה
    if (posts.length === 0) {
      res.status(404).json({ message: "No posts found for this user" });
      return;
    }

    // החזרת הפוסטים שנמצאו
    res.status(200).json(posts);
  } catch (error: any) {
    // טיפול בשגיאות
    res.status(500).json({ error: error.message });
  }
};

