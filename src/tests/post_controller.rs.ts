import request from "supertest";
import mongoose from "mongoose";
import postModel from "../models/Post";
import userModel, { IUser } from "../models/User";
import app from "../app";

let accessToken: any;
let refreshToken: any;
type User = IUser & { token?: string };
const testUser: User = {
  username: "asd",
  email: "test@user.com",
  password: "testpassword",
};

let postId = "";

beforeAll(async () => {
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
    username: 'user1',
    email: 'user1@gmail.com',
    password: 'user1password',
  });
  const res = await request(app).post('/users/login').send({
    email: 'user1@gmail.com',
    password: 'user1password',
  });
  expect(res.statusCode).toEqual(200);

  expect(res.body).toHaveProperty('accessToken');
  expect(res.body).toHaveProperty('refreshToken');
  accessToken = res.body.accessToken;
  refreshToken = res.body.refreshToken;
});

describe("Posts Tests", () => {
  test("Posts test get all", async () => {
    const response = await request(app).get("/posts");
    console.log(response.body);
    expect(response.statusCode).toBe(200);
  });

  test("Test Create Post", async () => {
    const response = await request(app)
      .post("/posts")
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: "Test Post",
        content: "Test Content",
        location: "Tel Aviv",
        rating: 4,
        images: [],
        commentsCount: 0
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.content).toBe("Test Content");
    expect(response.body.location).toBe("Tel Aviv");
    expect(response.body.rating).toBe(4);
    postId = response.body._id;
  });

  test("Test get post by id", async () => {
    const response = await request(app).get(`/posts/${postId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.title).toBe("Test Post");
    expect(response.body.content).toBe("Test Content");
    expect(response.body.location).toBe("Tel Aviv");
    expect(response.body.rating).toBe(4);
  });

  test("Test Create Post 2", async () => {
    const response = await request(app)
      .post("/posts")
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: "Test Post 2",
        content: "Test Content 2",
        location: "Haifa",
        rating: 3,
        images: [],
        commentsCount: 0
      });  

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe("Test Post 2");
    expect(response.body.location).toBe("Haifa");
    expect(response.body.rating).toBe(3);
  });

  test("Posts test get all 2", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("Test Delete Post", async () => {
    const response = await request(app)
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(response.statusCode).toBe(200);

    const response2 = await request(app).get(`/posts/${postId}`);
    expect(response2.statusCode).toBe(404);
  });

  test("Test Create Post fail", async () => {
    const response = await request(app)
      .post("/posts")
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: "Test Content 2",
      });

    expect(response.statusCode).toBe(400);
  });


  test("Test Like Post", async () => {
    // יצירת פוסט לבדיקה
    const createPostResponse = await request(app)
      .post("/posts")
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: "Like Test Post",
        content: "Testing likes",
        location: "Jerusalem",
        rating: 5,
        images: [],
        commentsCount: 0
      });
  
    expect(createPostResponse.statusCode).toBe(201);
    const postId = createPostResponse.body._id;
  
    // ביצוע לייק לפוסט
    const likeResponse = await request(app)
      .post(`/posts/${postId}`) // שים לב לנתיב המתוקן בהתאם לנתב שלך
      .set('Authorization', `Bearer ${accessToken}`);
  
    expect(likeResponse.statusCode).toBe(200);
    expect(likeResponse.body.likes).toEqual(
      expect.arrayContaining([expect.any(String)]) // בודק אם יש ID ברשימת הלייקים
    );
  
    // בדיקה אם המשתמש נוסף לרשימת הלייקים של הפוסט
    const getPostResponse = await request(app).get(`/posts/${postId}`);
    expect(getPostResponse.statusCode).toBe(200);
    expect(getPostResponse.body.likes).toContainEqual(expect.any(String));
  });
  
});
