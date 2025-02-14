import request from "supertest";
import mongoose from "mongoose";
import userModel from "../models/User";
import app from "../app";


beforeAll(async () => {
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

describe("Auth Tests", () => {
  let refreshToken: string;

  test("Test User Registration", async () => {
    const response = await request(app).post('/users/register').send({
      username: 'test_user',
      email: 'test_user@gmail.com',
      password: 'password123',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.username).toBe('test_user');
  });

  test("Test User Login", async () => {
    const response = await request(app).post('/users/login').send({
      email: 'test_user@gmail.com',
      password: 'password123',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');

    refreshToken = response.body.refreshToken;
  });

  test("Test Token Refresh", async () => {
    const response = await request(app)
      .post('/users/refresh')
      .send({ refreshToken });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });
  
});
