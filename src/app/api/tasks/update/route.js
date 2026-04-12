import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import { getUserFromRequest } from "@/lib/getUser";

export async function PUT(request) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    const { taskId, status, title, description, date, targetDuration, actualDuration, durationIncrement } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "Please provide taskId" },
        { status: 400 }
      );
    }

    if (status && !["pending", "completed", "missed", "partially-completed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (status) {
      updateData.status = status;
      updateData.completedAt = ["completed", "partially-completed"].includes(status) ? new Date() : null;
      // If marking as completed, set actualDuration to targetDuration if it was 0? 
      // No, let users log it manually, but maybe auto-fill if they just check it.
    }
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = date;
    if (targetDuration !== undefined) updateData.targetDuration = Number(targetDuration);
    if (actualDuration !== undefined) updateData.actualDuration = Number(actualDuration);

    const mongoUpdate = { $set: updateData };
    if (durationIncrement) {
      mongoUpdate.$inc = { actualDuration: Number(durationIncrement) };
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      mongoUpdate,
      { new: true }
    );

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Task updated successfully", task },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
