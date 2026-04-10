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
    const dateQuery = url.searchParams.get("date"); // YYYY-MM-DD

    if (!dateQuery) {
      return NextResponse.json(
        { error: "Please provide a target date" },
        { status: 400 }
      );
    }

    // PERF: Build a precise UTC midnight-to-midnight range for the target YYYY-MM-DD.
    // Tasks are stored at UTC midnight = the IST calendar date, so this is an exact match.
    const [y, m, d] = dateQuery.split("-").map(Number);
    const dayStart = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    const dayEnd   = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));

    // Fetch only the tasks on this specific day (no full-table JS filter needed)
    const tasks = await Task.find({
      userId,
      date: { $gte: dayStart, $lte: dayEnd },
    }).select("_id routineId").lean();

    if (tasks.length === 0) {
      return NextResponse.json(
        { message: `No tasks found for ${dateQuery}` },
        { status: 200 }
      );
    }

    const taskIds    = tasks.map((t) => t._id);
    const routineIds = [...new Set(
      tasks.filter((t) => t.routineId).map((t) => t.routineId.toString())
    )];

    // Delete all matched tasks in one shot
    await Task.deleteMany({ _id: { $in: taskIds }, userId });

    // PERF: Blacklist date in all affected routines with a single updateMany
    if (routineIds.length > 0) {
      await Routine.updateMany(
        { _id: { $in: routineIds } },
        { $addToSet: { deletedDates: dateQuery } }
      );
    }

    return NextResponse.json(
      { message: `Wiped ${taskIds.length} tasks from ${dateQuery}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
