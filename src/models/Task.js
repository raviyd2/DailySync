import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    routineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Routine",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Please provide a task title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "missed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);
// --- DB INDEXES ---
// All task queries filter by userId + date, or userId + routineId + date.
// Without these, MongoDB does a full collection scan on every request.
TaskSchema.index({ userId: 1, date: 1 });
TaskSchema.index({ userId: 1, routineId: 1, date: 1 });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
