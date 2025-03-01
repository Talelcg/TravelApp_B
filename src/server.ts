import app from './app';
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === "development") {
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Web Dev 2022 REST API",
        version: "1.0.0",
        description: "REST server including authentication using JWT",
      },
      servers: [{ url: "http://localhost:3000" }],
      components: {
        schemas: {
          User: {
            type: "object",
            required: ["email", "password"],
            properties: {
              email: { type: "string", description: "The user email" },
              password: { type: "string", description: "The user password" },
              username: { type: "string", description: "The user username" },
              refreshToken: {
                type: "array",
                items: { type: "string" },
                description: "List of refresh tokens",
              },
            },
            example: {
              email: "bob@gmail.com",
              password: "123456",
              username: "bob123",
            },
          },
          Post: {
            type: "object",
            required: ["title", "content", "userId", "location", "rating", "images"],
            properties: {
              title: { type: "string" },
              content: { type: "string" },
              userId: { type: "string" },
              location: { type: "string" },
              rating: { type: "number", minimum: 1, maximum: 5 },
              images: { type: "array", items: { type: "string" } },
            },
            example: {
              title: "Amazing Hiking Trail",
              content: "A beautiful experience in the mountains.",
              userId: "1234567890",
              location: "Mountainside, Israel",
              rating: 5,
              images: ["image1.jpg", "image2.jpg"],
            },
          },
          PostInput: {
            type: "object",
            required: ["title", "content"],
            properties: {
              title: { type: "string" },
              content: { type: "string" },
            },
            example: {
              title: "Amazing Hiking Trail",
              content: "A beautiful experience in the mountains.",
            },
          },
          Comment: {
            type: "object",
            required: ["content", "postId", "userId"],
            properties: {
              content: { type: "string" },
              postId: { type: "string" },
              userId: { type: "string" },
            },
            example: {
              content: "Great trail, highly recommend!",
              postId: "1234567890",
              userId: "9876543210",
            },
          },
          CommentInput: {
            type: "object",
            required: ["content", "postId"],
            properties: {
              content: { type: "string" },
              postId: { type: "string" },
            },
            example: {
              content: "Great trail, highly recommend!",
              postId: "1234567890",
            },
          },
        },
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    apis: ["./src/routes/*.ts"],
  };
  const specs = swaggerJsDoc(options);
  app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
