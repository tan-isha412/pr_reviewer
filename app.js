import express from "express";
import dotenv from "dotenv";
import router from "./src/routes/webhook.js";
import verifySignature from "./src/middleware/verifySignature.js";
import requireEnv from "./src/utils/requireEnv.js";
dotenv.config();
requireEnv(["GITHUB_TOKEN", "GITHUB_WEBHOOK_SECRET", "GEMINI_API_KEY"]);
const app = express();
app.use(express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        }
    })
);
app.get("/", (req, res) => {
    res.send("Server is running");
});

app.use("/webhook", verifySignature, router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});