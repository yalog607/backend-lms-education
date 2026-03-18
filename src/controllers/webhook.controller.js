import Mux from "@mux/mux-node";
import Lesson from "../models/lesson.model.js";

const mux = new Mux({ webhookSecret: process.env.MUX_WEBHOOK_SECRET });

export const handleMuxWebhook = async (req, res) => {
    try {
        // Lấy rawBody dạng string
        const rawBody = req.rawBody ? req.rawBody.toString('utf8') : '';
        let event;
        try {
            mux.webhooks.verifySignature(rawBody, req.headers, process.env.MUX_WEBHOOK_SECRET);
            event = JSON.parse(rawBody);
        } catch (err) {
            console.error("Webhook Error: Chữ ký không hợp lệ", err.message);
            return res.status(400).send("Invalid Signature");
        }

        const { type, data } = event;

        if (type === "video.asset.ready") {
            const assetId = data.id;
            const duration = data.duration;
            const playbackId = data.playback_ids?.[0]?.id;
            const uploadId = data.upload_id;

            console.log(`⚡ Mux báo: Video ${uploadId} đã xong. Duration: ${duration}`);

            const updatedLesson = await Lesson.findOneAndUpdate(
                { muxUploadId: uploadId},
                {
                    duration: duration,
                    muxAssetId: assetId,
                    muxPlaybackId: playbackId,
                },
                { new: true }
            );

            if (updatedLesson) {
                console.log(`✅ Đã cập nhật bài học: ${updatedLesson.title}`);
            } else {
                console.log(`⚠️ Không tìm thấy bài học với uploadId: ${uploadId}`);
            }
        }

        res.status(200).send("OK");

    } catch (error) {
        console.error("Lỗi Server Webhook:", error);
        res.status(500).send("Server Error");
    }
};