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
  swaggerDefinition: {
    info: {
      title: "Ollama API",
      version: "1.0.0",
      description: "API để giao tiếp với Ollama",
    },
    basePath: "/",
  },
  apis: ["./server.js"], // Đường dẫn tới file chứa các route API (ở đây là server.js)
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
