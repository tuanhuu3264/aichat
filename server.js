import express from "express";
import Ollama from "ollama";
import cors from "cors"; // Import CORS
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
// Import node-fetch và polyfill cho XMLHttpRequest
import fetch from 'node-fetch';
import { XMLHttpRequest } from 'xhr2';

// Đảm bảo Ollama sử dụng fetch và XMLHttpRequest đúng cách
global.fetch = fetch;
global.XMLHttpRequest = XMLHttpRequest;

const app = express();
const port = 3000;

// Cấu hình CORS
const corsOptions = {
  origin: "*", // Cho phép tất cả các nguồn
  methods: ["GET", "POST"], // Chỉ cho phép phương thức GET và POST
  allowedHeaders: ["Content-Type", "Authorization"], // Cho phép các header này trong yêu cầu
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions)); // Sử dụng cấu hình CORS
app.use(express.json());

// Cấu hình Swagger
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

// Khởi tạo Swagger
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Cấu hình Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Định nghĩa API

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Gửi tin nhắn tới Ollama và nhận phản hồi
 *     description: API để gửi tin nhắn và nhận phản hồi từ Ollama
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung tin nhắn gửi tới
 *                 example: "Explain quantum computing in simple terms"
 *             required:
 *               - content
 *     responses:
 *       '200':
 *         description: Phản hồi thành công từ Ollama
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   description: Nội dung phản hồi từ mô hình
 *                   example: "Quantum computing is a type of computing that uses quantum-mechanical phenomena..."
 *       '400':
 *         description: Yêu cầu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Nội dung không được để trống"
 *       '500':
 *         description: Lỗi máy chủ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Có lỗi xảy ra trong quá trình xử lý"
 */
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
