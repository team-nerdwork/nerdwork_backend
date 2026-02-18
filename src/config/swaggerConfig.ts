import { url } from "inspector";
import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Comic App API",
      version: "1.0.0",
      description: "API documentation for Comic App",
    },
    servers: [
      // {
      //   url: "https://nerdworkbackend-production.up.railway.app/",
      // },
      {
        url: "http://localhost:5000/",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
