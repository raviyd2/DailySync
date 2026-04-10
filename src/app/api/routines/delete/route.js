import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Routine from "@/models/Routine";
import Task from "@/models/Task";
import { getUserFromRequest } from "@/lib/getUser";

export async function DELETE(request) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const url = new URL(request.url);
    const routineId = url.searchParams.get("routineId");
    const purgeAll = url.searchParams.get("purgeAll") === "true";

    if (!routineId) {
      return NextResponse.json(
        { error: "Please provide a routineId" },
        { status: 400 }
      );
    }

    const routine = await Routine.findOneAndDelete({ _id: routineId, userId });

    if (!routine) {
      return NextResponse.json(
        { error: "Routine not found" },
        { status: 404 }
      );
    }

    // Handling multiple options for routine delete
    if (purgeAll) {
      // Nuke every single task associated with this routine (historic past & future)
      await Task.deleteMany({ userId, routineId });
    } else {
      // Normal routine delete: Cascade delete any projected future tasks, keep history
      // IST-aware today: tasks stored at UTC midnight = IST calendar date
      // Add IST offset to get the current IST date, then build UTC midnight for that date
      const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
      const nowIST = new Date(Date.now() + IST_OFFSET_MS);
      const todayUTC = new Date(Date.UTC(
        nowIST.getUTCFullYear(),
        nowIST.getUTCMonth(),
        nowIST.getUTCDate(),
        0, 0, 0, 0
      ));
      await Task.deleteMany({ userId, routineId, date: { $gt: todayUTC } });
    }

    return NextResponse.json(
      { message: purgeAll ? "Routine and ALL historic items effectively nuked" : "Routine stopped. Future tasks removed." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete routine error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
