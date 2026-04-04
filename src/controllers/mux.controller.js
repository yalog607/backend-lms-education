import Mux from "@mux/mux-node";
import 'dotenv/config';
import { video } from "../lib/mux.js";

const mux = new Mux({
  jwtSigningKey: process.env.MUX_SIGNING_KEY_ID,
  jwtPrivateKey: Buffer.from(process.env.MUX_PRIVATE_KEY_BASE64, 'base64').toString('utf8'),
});

export const signMuxToken = async (req, res) => {
    try {
        const { playbackId } = req.body;
        if (!playbackId) {
            return res.status(400).json({ message: "Thiếu Playback ID" });
        }

        const token = await mux.jwt.signPlaybackId(playbackId, {
            type: 'video',
            expiration: '6h',
        });

        return res.status(200).json({ success: true, token });
    } catch (error) {
        console.error("Lỗi tạo Mux Token:", error);
        return res.status(500).json({ message: "Lỗi Server" });
    }
};

export const getUploadUrl = async (req, res) => {
    try {
        const upload = await video.uploads.create({
            new_asset_settings: {
                playback_policy: ['signed'],
                mp4_support: 'none',
            },
            cors_origin: '*',
        });

        console.log("Upload object details: ", upload);

        return res.status(200).json({ 
            success: true, 
            uploadUrl: upload.url, 
            uploadId: upload.id
        });
    } catch (error) {
        console.error("Lỗi tạo Mux Upload URL:", error);
        return res.status(500).json({ message: "Không thể tạo link upload video" });
    }
};