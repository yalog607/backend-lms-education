import Mux from "@mux/mux-node";
import 'dotenv/config';

const keyId = process.env.MUX_SIGNING_KEY_ID;
const keySecret = Buffer.from(process.env.MUX_PRIVATE_KEY_BASE64, 'base64'); 

export const signMuxToken = async (req, res) => {
    try {
        const { playbackId } = req.body;

        if (!playbackId) {
            return res.status(400).json({ message: "Thiếu Playback ID" });
        }

        const token = Mux.JWT.signPlaybackId(playbackId, {
            keyId: keyId,
            keySecret: keySecret,
            type: 'video',
            expiration: '6h',
        });

        return res.status(200).json({ success: true, token });
    } catch (error) {
        console.error("Lỗi tạo Mux Token:", error);
        return res.status(500).json({ message: "Lỗi Server" });
    }
};