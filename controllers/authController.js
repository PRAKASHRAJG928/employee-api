import User from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password are required" });
        }
        const user = await User.findOne({ email: email.toLowerCase() })
        if(!user){
            return res.status(404).json({success: false, error: "User Not Found"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(401).json({success: false, error: "Wrong Password"})
        }
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured");
            return res.status(500).json({ success: false, error: "Server misconfiguration" });
        }
        const token = jwt.sign(
            {_id: user._id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: "10d"}
        );
        res.status(200).json({
            success: true,
            token,
            user: {_id: user._id, name: user.name, role: user.role},
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({success: false, error: "Internal Server Error", message: error?.message})
    }
};

const verify = (req,res)=>{
    return res.status (200).json({success:true,user:req.user})
}

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                error: "All password fields are required"
            });
        }

        // Check if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: "New password and confirm password do not match"
            });
        }

        // Validate password strength (minimum 6 characters)
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: "New password must be at least 6 characters long"
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Verify old password
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return res.status(401).json({
                success: false,
                error: "Current password is incorrect"
            });
        }

        // Check if new password is different from old password
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                error: "New password must be different from current password"
            });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        user.password = hashedNewPassword;
        user.updatedAt = new Date();
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({
            success: false,
            error: "Server error in changing password"
        });
    }
};

export {login, verify, changePassword}
