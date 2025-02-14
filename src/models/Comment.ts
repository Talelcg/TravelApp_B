import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  content: string;
  postId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
}

const CommentSchema: Schema<IComment> = new Schema(
  {
    content: { type: String, required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IComment>('Comment', CommentSchema);
