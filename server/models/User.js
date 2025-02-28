import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      type: {
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        phoneNumber: { type: String, default: "" },
        dateOfBirth: { type: Date },
        gender: { type: String, default: "" },
        address: { type: String, default: "" },
        levelEducation: String,
        typeEducation: String,
        major: String,
        faculty: String,
      },
      default: {}, // Default to an empty object
    },
    role: {
      type: String,
      default: "student",
      enum: ["lecturer", "student", "admin", "superadmin"],
    },
    mainrole: {
      type: String,
      default: "user",
      enum: ["user", "admin"],
    },
    subscription: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courses",
      },
    ],
    resetPasswordExpire: Date,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    collection: "users",
  }
);
schema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};
export const User = mongoose.model("User", schema);
