import mongoose from "mongoose";

export interface IUser {
  email: string;
  password: string;
  _id?: string;
  refreshToken?: string[];
  username: string;
  profileImage?: string;
  bio?: string; // Add the bio field to the IUser interface
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true, // Ensure username is required
    unique: true,   // Enforce uniqueness
    trim: true,     // Remove leading/trailing spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: [String],
    default: [],
  },
  profileImage: {
    type: String,
    default: "" , // Default to an empty string if no image is provided
  },
  bio: {
    type: String,
    default: "I'm using EASYTRAVEL", // Default bio value
  }
});

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;

/**
* @swagger
* components:
* schemas:
* User:
* type: object
* required:
* - email
* - password
* properties:
* email:
* type: string
* description: The user email
* password:
* type: string
* description: The user password
* profileImage:
* type: string
* description: The user's profile image URL
* bio:
* type: string
* description: The user's bio
* example:
* email: 'bob@gmail.com'
* password: '123456'
* profileImage: 'https://example.com/profile.jpg'
* bio: "I'm using EASYTRAVEL"
*/
