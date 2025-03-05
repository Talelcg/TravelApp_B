import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  userId: mongoose.Schema.Types.ObjectId;
  location: string;
  rating: number;  
  images: string[];
  likes: mongoose.Types.ObjectId[]; // Array of user IDs who liked the post
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema<IPost> = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, required: true },
    rating: {
      type: Number,
      required: true,  
      min: 1,         
      max: 5,          
    },
    images: { type: [String], default: [] },
    likes: { type: [mongoose.Types.ObjectId], ref: "User", default: [] },
    commentsCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
PostSchema.pre<IPost>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IPost>('Post', PostSchema);
