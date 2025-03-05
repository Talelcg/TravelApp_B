import request from "supertest";
import mongoose from "mongoose";
import commentModel from "../models/Comment";
import postModel from "../models/Post";
import userModel, { IUser } from "../models/User";
import app from "../app";
import { Console } from "console";

let accessToken: string;
let refreshToken: string;
let postId: string;
let commentId: string;

beforeAll(async () => {
  await commentModel.deleteMany(); 
  await postModel.deleteMany(); 
  await userModel.deleteMany(); 

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI!, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("MongoDB connected!");
});

afterAll(async () => {
  console.log("Disconnecting MongoDB...");
  await mongoose.connection.close();
  console.log("MongoDB disconnected.");
});

beforeEach(async () => {

  await request(app).post('/users/register').send({
    username: 'test_user',
    email: 'test_user@gmail.com',
    password: 'password123',
  });

  const loginRes = await request(app).post('/users/login').send({
    email: 'test_user@gmail.com',
    password: 'password123',
  });

  accessToken = loginRes.body.accessToken;
  refreshToken = loginRes.body.refreshToken;

  // Create a test post
  const postRes = await request(app)
    .post('/posts')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      title: "Test Post",
        content: "Test Content",
        location: "Tel Aviv",
        rating: 4,
        images: [],
        commentsCount: 0
    });
  console.log('Post id:', postRes.body._id);
  postId = postRes.body._id;
});

describe("Comments Tests", () => {
  test("Test Create Comment", async () => {
    const response = await request(app)
      .post(`/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: "Test Comment",
        postId: postId,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.content).toBe("Test Comment");
    commentId = response.body._id;
  }); 
  test("Test Get All Comments by Post ID", async () => {
    // צור תגובה כדי לוודא שיש תגובות לפוסט
    const createCommentResponse = await request(app)
      .post(`/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: "Another Test Comment",
        postId: postId,
      });
  
    expect(createCommentResponse.statusCode).toBe(201);
  
    // עכשיו נסה לשלוף את התגובות שוב
    const response = await request(app)
      .get(`/comments/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`);
  
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  
    response.body.forEach((comment: any) => {
      expect(comment).toHaveProperty("_id");
      expect(comment).toHaveProperty("content");
      expect(comment).toHaveProperty("postId");
      expect(comment).toHaveProperty("userId");
      expect(comment.postId.toString()).toBe(postId);
    });
  });
  

  test("Test Update Comment", async () => {
    const response = await request(app)
      .put(`/comments/${commentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: "Updated Comment",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe("Updated Comment");
  });
  test("Test Delete Comment", async () => {

 const deleteResponse = await request(app)
   .delete(`/comments/${commentId}`)
   .set('Authorization', `Bearer ${accessToken}`);
 expect(deleteResponse.statusCode).toBe(200);
 expect(deleteResponse.body.message).toBe('Comment deleted successfully');
 
 const response2 = await request(app).get(`/comments/${commentId}`)
    .set('Authorization', `Bearer ${accessToken}`); 
    expect(response2.statusCode).toBe(200);
    expect(response2.body).toEqual([]);
  })
});
