import User from "../models/user.model.js";

export const upgradeToInstructor = async(req, res) => {
    try {
        const { userId} = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({message: "User not found."});

        user.role = "instructor";
        await user.save();

        return res.status(200).json({message: "User has been upgraded to instructor role"});
    } catch (error) {
        console.log(" Error upgrading user to instructor: ", error);
        res.status(500).json({message: "Error upgrading user to instructor"});
    }
}