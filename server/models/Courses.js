import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  summary: String,
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resources' }],
  assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
  },
}, {
  timestamps: true,
  collection: 'courses'
});

export const Courses = mongoose.model("Courses", schema);
