import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import Routine from "@/models/Routine";
import { getUserFromRequest } from "@/lib/getUser";

export async function DELETE(request) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const url = new URL(request.url);
    const taskId = url.searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "Please provide a taskId" },
        { status: 400 }
      );
    }

    const task = await Task.findOne({ _id: taskId, userId });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    if (task.routineId) {
      const d = new Date(task.date);
      // Use UTC accessors - tasks stored at noon UTC
      const dateStr = [
        d.getUTCFullYear(),
        ('0' + (d.getUTCMonth() + 1)).slice(-2),
        ('0' + d.getUTCDate()).slice(-2)
      ].join('-');
      
      await Routine.findByIdAndUpdate(task.routineId, {
        $push: { deletedDates: dateStr }
      });
    }

    await Task.findOneAndDelete({ _id: taskId, userId });

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
