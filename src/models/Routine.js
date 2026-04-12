import mongoose from "mongoose";

const RoutineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a routine title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    deletedDates: {
      type: [String], // Array of 'YYYY-MM-DD' strings
      default: [],
    },
    lastGenerated: {
      type: Date,
      default: null,
    },
    targetDuration: {
      type: Number, // in minutes
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// In Next.js dev mode, the model might be cached. Delete it to ensure schema updates take effect.
if (mongoose.models.Routine) {
  delete mongoose.models.Routine;
}

export default mongoose.model("Routine", RoutineSchema);
