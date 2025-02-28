import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileUrl: { type: String, required: true },
  grade: { type: Number, min: 0, max: 100, default: 0 },
  comment: { type: String, default: "" },
}, { timestamps: true });

export const Submission = mongoose.model("Submission", submissionSchema);