import crypto from "crypto";

function verifySignature(req, res, next) {

    const signature = req.headers["x-hub-signature-256"];

    if (!signature) {
        return res.status(401).json({
            message: "Missing GitHub signature"
        });
    }

    const digest =
        "sha256=" +
        crypto
            .createHmac("sha256", process.env.GITHUB_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || "")
            .update(req.rawBody)
            .digest("hex");

    const isValid = crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(digest)
    );

    if (!isValid) {
        return res.status(401).json({
            message: "Invalid signature"
        });
    }

    next();
}

export default verifySignature;