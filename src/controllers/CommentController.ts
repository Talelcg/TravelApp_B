import { Request, Response } from 'express';
import CommentModel from '../models/Comment';
import mongoose from 'mongoose';
import PostModel from '../models/Post'; // Add this line to import PostModel

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, postId } = req.body;
    const userId = req.params.userId || req.body.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized, userId is required' });
      return;
    }

    if (!content || !postId) {
      res.status(400).json({ message: 'Content and postId are required' });
      return;
    }
    const newComment = await CommentModel.create({
      content,
      postId,
      userId,
    });
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { commentsCount: 1 } }, // מגדיל את `commentCount` ב-1
      { new: true } // מחזיר את המסמך המעודכן
    );

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
  
};


export const getCommentsByPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ message: 'Invalid post ID' });
      return;
    }

    const comments = await CommentModel.find({ postId: new mongoose.Types.ObjectId(postId) });

    if (comments.length === 0) {
      res.status(404).json({ message: 'No comments found for this post' });
      return;
    }

    res.status(200).json(comments);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: (error as Error).message });
  }
};


export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const comment = await CommentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {

    const comment = await CommentModel.findByIdAndDelete(req.params.id);
    
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};


