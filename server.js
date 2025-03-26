import express from "express";
import Ollama from "ollama";
import cors from "cors"; // Import CORS
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

const app = express();
const port = 3000;

app.use(cors());
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
 *     description: Gửi tin nhắn từ người dùng và nhận phản hồi từ Ollama.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Why is the sky blue?"
 *     responses:
 *       200:
 *         description: Phản hồi từ Ollama
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: "The sky is blue because of the scattering of light."
 *       500:
 *         description: Lỗi khi giao tiếp với Ollama
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
      model: "gemma3:1b",
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
