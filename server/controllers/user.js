import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail, {
  sendForgotMail,
  sendNotificationMail,
} from "../middlewares/sendMail.js";
import TryCatch from "../middlewares/TryCatch.js";

// import { validate, registerValidation } from "../middlewares/validateInput.js";
// import { validationResult } from "express-validator";

// export const register = [
//   // Thêm các quy tắc validation
//   ...registerValidation, validate,

//   // Middleware để kiểm tra kết quả validation
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     next();
//   },

//   // Controller logic
//   TryCatch(async (req, res) => {
//     const { email, name, password, confirmPassword, role, profile } = req.body;

//   if (password !== confirmPassword) {
//     return res.status(400).json({
//       message: "Password not match",
//     });
//   }

//   if (!['student', 'lecturer'].includes(role)) {
//     return res.status(400).json({
//       message: "Invalid role",
//     });
//   }

//   let user = await User.findOne({ email });

//   if (user)
//     return res.status(400).json({
//       message: "User already exists",
//     });

//   const hashPassword = await bcrypt.hash(password, 10);

//   user = {
//     name,
//     email,
//     password: hashPassword,
//     role: role,
//     profile: {
//       firstName: profile.firstName,
//       lastName: profile.lastName,
//       phoneNumber: profile.phoneNumber,
//       dateOfBirth: profile.dateOfBirth,
//       gender: profile.gender,
//       address: profile.address,
//       levelEducation: profile.levelEducation,
//       typeEducation: profile.typeEducation,
//       major: profile.major,
//       faculty: profile.faculty,
//     }
//   };

//   // const otp = Math.floor(Math.random() * 1000000);
//   const otp = 123456;

//   const activationToken = jwt.sign(
//     { 
//       user: { name, email, password: hashPassword, role, profile }, 
//       otp 
//     },
//     process.env.Activation_Secret,
//     {
//       expiresIn: "5m",
//     }
//   );

//   const data = {
//     name,
//     otp,
//   };

//   await sendMail(email, "E learning", data);

//   res.status(200).json({
//     message: "OTP sent to your mail. Please check your mail",
//     activationToken,
//   });
// })
// ];

// export const verifyUser = TryCatch(async (req, res) => {
//   const { otp, activationToken } = req.body;

//   const verify = jwt.verify(activationToken, process.env.Activation_Secret);

//   if (!verify)
//     return res.status(400).json({
//       message: "OTP expired",
//     });

//   if (verify.otp !== otp)
//     return res.status(400).json({
//       message: "Wrong OTP",
//     });

//     const userProfile = verify.user.profile || {};

//     await User.create({
//       name: verify.user.name,
//       email: verify.user.email,
//       password: verify.user.password,
//       role: verify.user.role,
//       profile: {
//         firstName: userProfile.firstName || "",
//         lastName: userProfile.lastName || "",
//         phoneNumber: userProfile.phoneNumber || "",
//         dateOfBirth: userProfile.dateOfBirth,
//         gender: userProfile.gender || "",
//         address: userProfile.address || "",
//         levelEducation: userProfile.levelEducation || "",
//         typeEducation: userProfile.typeEducation || "",
//         major: userProfile.major || "",
//         faculty: userProfile.faculty || "",
//       }
//     });

//   res.json({
//     message: "User registered successfully",
//   });
// });

export const loginUser = TryCatch(async (req, res) => {
  const { username, password } = req.body;

  let user = await User.findOne({ $or: [{ email: username }, { name: username }] });

  if (!user)
    return res.status(400).json({
      message: "User not found",
    });

  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword)
    return res.status(400).json({
      message: "Wrong password",
    });

  const token = jwt.sign({ _id: user._id }, process.env.Jwt_Sec, {
    expiresIn: "15d",
  });

  res.json({
    message: `Welcome back ${user.name}`,
    token,
    user,
  });
});

export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({ user });
});

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get the updated profile data from the request body
    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      address,
      levelEducation,
      typeEducation,
      major,
      faculty,
    } = req.body;

    // Find the user by their ID and update their profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "profile.firstName": firstName,
          "profile.lastName": lastName,
          "profile.phoneNumber": phoneNumber,
          "profile.dateOfBirth": dateOfBirth,
          "profile.gender": gender,
          "profile.address": address,
          "profile.levelEducation": levelEducation,
          "profile.typeEducation": typeEducation,
          "profile.major": major,
          "profile.faculty": faculty,
        },
      },
      { new: true } // This ensures that the updated document is returned
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the updated user profile as the response
    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = TryCatch(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(404).json({
      message: "No user with this email",
    });

  const token = jwt.sign({ email }, process.env.Forgot_Secret);

  const data = { email, token };

  await sendForgotMail("E learning System", data);

  user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;

  await user.save();

  res.json({
    message: "Reset password link is sent to you mail",
  });
});

export const resetPassword = TryCatch(async (req, res) => {
  const decodedData = jwt.verify(req.query.token, process.env.Forgot_Secret);

  const user = await User.findOne({ email: decodedData.email });

  if (!user)
    return res.status(404).json({
      message: "No user with this email",
    });

  if (user.resetPasswordExpire === null)
    return res.status(400).json({
      message: "Token Expired",
    });

  if (user.resetPasswordExpire < Date.now()) {
    return res.status(400).json({
      message: "Token Expired",
    });
  }

  const password = await bcrypt.hash(req.body.password, 10);

  user.password = password;

  user.resetPasswordExpire = null;

  await user.save();

  res.json({ message: "Password Reset" });
});

export const sendNotification = TryCatch(async (req, res) => {
  const { sender, recipients, subject, message, file } = req.body;

  if (!sender || !recipients || !subject || !message) {
    return res
      .status(400)
      .json({
        message:
          "Missing required fields: sender, recipient, subject, or message.",
      });
  }

  const data = { sender, recipients, message, file };
  await sendNotificationMail({ subject, data });

  const notification = new Notification({
    sender,
    recipients,
    subject,
    message,
    file,
  });

  const savedNotification = await notification.save();

  res.status(201).json({
    message: "Notification created successfully.",
    notification: savedNotification,
  });
});

export const getNotification = TryCatch(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res
      .status(400)
      .json({ message: "User ID is required to fetch notifications." });
  }

  // Fetch notifications where the user is a recipient
  const notifications = await Notification.find({ 
    $or:[
      {recipients: userId },
      {sender: userId}
    ]
  })
    .populate("sender", "name email")
    .sort({ createdAt: -1 })
    .lean();

  if (!notifications.length) {
    return res
      .status(200)
      .json({ message: "No notifications found.", notifications: [] });
  }

  const unreadNotifications = notifications.filter((notification) => {
    const readBy = notification.readBy.map((id) => id.toString());
    return !readBy.includes(userId.toString()) && notification.sender._id.toString() !== userId.toString();
  });

  res.status(200).json({
    message: "Notifications retrieved successfully.",
    notifications,
    unread: unreadNotifications.length,
  });
});

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const userId = req.user._id;

    if (!userId || !notificationId) {
      return res
        .status(400)
        .json({ message: "User ID and Notification ID are required." });
    }

    // Update the notification's readBy field
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { $addToSet: { readBy: userId } }, // Add userId to readBy array if not already present
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.status(200).json({
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    res.status(500).json({
      message: "An error occurred while marking the notification as read.",
      error: error.message,
    });
  }
};

export const searchUserByEmail = async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json([]);  // Trả về mảng rỗng khi không tìm thấy người dùng
    }
    res.json([user]);  // Trả về một mảng chứa người dùng
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// // reset password dev
// async function resetPasswordtest(userId, newPassword) {
//   const hashedPassword = await bcrypt.hash(newPassword, 10);

//   // Cập nhật mật khẩu mới trong cơ sở dữ liệu
//   await User.updateOne({ _id: userId }, { password: hashedPassword });
//   console.log("Mật khẩu đã được đặt lại thành công!");
// }

// // Gọi hàm với mật khẩu mới
// resetPasswordtest("676d55e77c09b2e53e79bddf", "newplaintextpassword");
