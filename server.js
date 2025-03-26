import express from "express";
import Ollama from "ollama";
import cors from "cors";
import fetch from "node-fetch"; // Thêm node-fetch nếu cần
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import xhr2 from "xhr2";
global.XMLHttpRequest = xhr2;

const app = express();
const port = 3000;

const corsOptions = {
  origin: "*", // Cho phép tất cả các nguồn
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ollama Chat API",
      version: "1.0.0",
      description: "API for interacting with Ollama",
    },
    components: {
      schemas: {
        ChatRequest: {
          type: "object",
          required: ["content"],
          properties: {
            content: {
              type: "string",
              description: "Message content to send to Ollama",
              example: "Explain quantum computing",
            },
          },
        },
        ChatResponse: {
          type: "object",
          properties: {
            result: {
              type: "string",
              description: "Response from Ollama",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
          },
        },
      },
    },
    paths: {
      "/api/chat": {
        post: {
          summary: "Send message to Ollama",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ChatRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ChatResponse",
                  },
                },
              },
            },
            400: {
              description: "Bad request",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            500: {
              description: "Server error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"], // Path to the API files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { content } = req.body;

    const response = await Ollama.chat({
      model: "gemma3:4b",
      messages: [{ role: "user", content: content || "Why is the sky blue?" }],
    });

    res.json({ result: response.message.content });
  } catch (error) {
    console.error("Lỗi khi giao tiếp với Ollama:", error);
    res.status(500).json({ error: "Có lỗi xảy ra trong quá trình xử lý" });
  }
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
