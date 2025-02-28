import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructorFile: { type: String, required: true },
  startDate: { type: Date, required: true },
  dueDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > this.startDate;
      },
      message: "Due date must be after the start date.",
    },
  },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Courses", required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["assignment", "quiz"], default: "assignment" },
}, { timestamps: true });

export const Assignment = mongoose.model("Assignment", assignmentSchema);