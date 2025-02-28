import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipients: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  file: {
    filename: { type: String },
    path: { type: String },
  },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export const Notification = mongoose.model("Notification", notificationSchema);
