import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Routine from "@/models/Routine";
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
    const { routineId, title, description, targetDuration } = body;

    if (!routineId) {
      return NextResponse.json(
        { error: "Please provide routineId" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (targetDuration !== undefined) updateData.targetDuration = Number(targetDuration);

    const routine = await Routine.findOneAndUpdate(
      { _id: routineId, userId },
      { $set: updateData },
      { new: true }
    );

    if (!routine) {
      return NextResponse.json(
        { error: "Routine not found" },
        { status: 404 }
      );
    }

    // Cascade update: Change title/description/duration for all tasks associated with this routine
    // Usually we update all tasks to keep everything in sync
    if (title || description !== undefined || targetDuration !== undefined) {
      const taskUpdateData = {};
      if (title) taskUpdateData.title = title;
      if (description !== undefined) taskUpdateData.description = description;
      if (targetDuration !== undefined) taskUpdateData.targetDuration = Number(targetDuration);

      await Task.updateMany(
        { routineId, userId },
        { $set: taskUpdateData }
      );
    }

    return NextResponse.json(
      { message: "Routine and associated tasks updated successfully", routine },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update routine error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
