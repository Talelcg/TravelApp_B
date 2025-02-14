import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import Post from '../models/Post';
import User from '../models/User';

let token: string;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI!);

  await request(app).post('/users/register').send({
    username: 'trypost',
    email: 'trypost@gmail.com',
    password: 'trypostpassword',
  });

  const res = await request(app).post('/users/login').send({
    email: 'trypost@gmail.com',
    password: 'trypostpassword',
  });

  token = res.body.accessToken;
});

afterEach(async () => {
  await Post.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Post Endpoints', () => {
  it('should create a new post', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'My First Post',
        content: 'Content of the first post',
        location: 'Tel Aviv',
        rating: 4,
        images: [],
        commentsCount: 0
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toEqual('My First Post');
    expect(res.body.location).toEqual('Tel Aviv');
    expect(res.body.rating).toEqual(4);
    expect(res.body.commentsCount).toEqual(0);
  });

  it('should fetch all posts', async () => {
    await Post.create({
      title: 'My First Post',
      content: 'Content of the first post',
      location: 'Tel Aviv',
      rating: 4,
      images: [],
      commentsCount: 0,
      userId: new mongoose.Types.ObjectId(),
    });

    const res = await request(app).get('/posts');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].title).toEqual('My First Post');
    expect(res.body[0].location).toEqual('Tel Aviv');
    expect(res.body[0].rating).toEqual(4);
  });
});
