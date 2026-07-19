import express from "express";
import dotenv from "dotenv";
import router from "./src/routes/webhook.js";
import verifySignature from "./src/middleware/verifySignature.js";
dotenv.config();
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

app.use("/webhook", router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});