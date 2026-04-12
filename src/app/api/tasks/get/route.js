import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/models/Task";
import Routine from "@/models/Routine";
import { getUserFromRequest } from "@/lib/getUser";

export async function GET(request) {
  try {
    const userId = await getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const url = new URL(request.url);
    // The frontend tells us exactly which month/year the user is viewing
    const viewYearParam = url.searchParams.get("viewYear");
    const viewMonthParam = url.searchParams.get("viewMonth"); // 0-indexed
    const fetchAllMode = url.searchParams.get("all") === "true";

    // --- IST AWARE TODAY ---
    // IST = UTC+5:30. Server may run in UTC, so add 5h30m to get the current IST date.
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(Date.now() + IST_OFFSET_MS);
    // "Today" in IST as a calendar date stored at midnight UTC
    const todayUTC = new Date(Date.UTC(
      nowIST.getUTCFullYear(),
      nowIST.getUTCMonth(),
      nowIST.getUTCDate(),
      0, 0, 0, 0
    ));

    if (fetchAllMode) {
      // Auto-mark past pending as missed
      await Task.updateMany(
        { userId, status: "pending", date: { $lt: todayUTC } },
        { $set: { status: "missed" } }
      );
      const tasks = await Task.find({ userId }).sort({ date: 1, createdAt: -1 }).lean();
      return NextResponse.json({ tasks }, { status: 200 });
    }

    const todayStr = [
      nowIST.getUTCFullYear(),
      ("0" + (nowIST.getUTCMonth() + 1)).slice(-2),
      ("0" + nowIST.getUTCDate()).slice(-2),
    ].join("-");

    const viewYear = viewYearParam ? parseInt(viewYearParam) : nowIST.getUTCFullYear();
    const viewMonth = viewMonthParam !== null ? parseInt(viewMonthParam) : nowIST.getUTCMonth();

    // Generate for a 3-month window: prev, current, next
    // Always use Date.UTC so the window boundaries are in UTC, matching how tasks are stored
    const windowStart = new Date(Date.UTC(viewYear, viewMonth - 1, 1, 0, 0, 0, 0));
    // Last day of the month AFTER next: Date.UTC(y, m+2, 0) gives last day of month viewMonth+1
    const lastDayOfNextMonth = new Date(Date.UTC(viewYear, viewMonth + 2, 0)).getUTCDate();
    const windowEnd = new Date(Date.UTC(viewYear, viewMonth + 1, lastDayOfNextMonth, 23, 59, 59, 999));

    // -- LAZY GENERATE ROUTINE TASKS (Dynamic Viewport Window) --
    const routines = await Routine.find({ userId });

    // PERF: Single batch query for ALL existing routine tasks in the window.
    // Replaces the old N+1 pattern (one DB query per routine).
    const allExistingRoutineTasks = await Task.find({
      userId,
      routineId: { $in: routines.map((r) => r._id) },
      date: { $gte: windowStart, $lte: windowEnd },
    })
      .select("date routineId")
      .lean();

    // Group by routineId string → O(1) lookup per routine
    const existingByRoutine = new Map();
    for (const t of allExistingRoutineTasks) {
      const rid = t.routineId.toString();
      if (!existingByRoutine.has(rid)) existingByRoutine.set(rid, []);
      existingByRoutine.get(rid).push(t);
    }

    for (const routine of routines) {
      // Normalize startDate to UTC midnight so all comparisons are in UTC
      const rStartRaw = new Date(routine.startDate || routine.createdAt);
      const rStartDate = new Date(Date.UTC(
        rStartRaw.getUTCFullYear(),
        rStartRaw.getUTCMonth(),
        rStartRaw.getUTCDate(),
        0, 0, 0, 0
      ));

      let rEndDate = null;
      if (routine.endDate) {
        const rEndRaw = new Date(routine.endDate);
        rEndDate = new Date(Date.UTC(
          rEndRaw.getUTCFullYear(),
          rEndRaw.getUTCMonth(),
          rEndRaw.getUTCDate(),
          23, 59, 59, 999
        ));
      }

      // Look up pre-fetched batch results for this routine (O(1), no extra DB query)
      const existingRoutineTasks = existingByRoutine.get(routine._id.toString()) || [];

      // Start projection from whichever is LATER: startDate or windowStart (both UTC midnight)
      let currentProjectedDate = new Date(rStartDate > windowStart ? rStartDate : windowStart);
      // Ensure we start at UTC midnight
      currentProjectedDate = new Date(Date.UTC(
        currentProjectedDate.getUTCFullYear(),
        currentProjectedDate.getUTCMonth(),
        currentProjectedDate.getUTCDate(),
        0, 0, 0, 0
      ));

      const tasksToInsert = [];

      while (currentProjectedDate <= windowEnd) {
        // If routine has an endDate and we've passed it, stop
        if (rEndDate && currentProjectedDate > rEndDate) {
          break;
        }

        let shouldCreate = false;

        if (routine.frequency === "daily") {
          shouldCreate = true;
        } else if (routine.frequency === "weekly") {
          // Same UTC weekday as the routine's start date
          if (currentProjectedDate.getUTCDay() === rStartDate.getUTCDay()) {
            shouldCreate = true;
          }
        } else if (routine.frequency === "monthly") {
          // Same day-of-month as the routine's start date, clamped to month end
          const targetDay = rStartDate.getUTCDate();
          const daysInCurrentMonth = new Date(
            Date.UTC(currentProjectedDate.getUTCFullYear(), currentProjectedDate.getUTCMonth() + 1, 0)
          ).getUTCDate();
          const clampedDay = Math.min(targetDay, daysInCurrentMonth);
          if (currentProjectedDate.getUTCDate() === clampedDay) {
            shouldCreate = true;
          }
        }

        if (shouldCreate) {
          // Build YYYY-MM-DD string from UTC components (consistent with storage)
          const checkDateStr = [
            currentProjectedDate.getUTCFullYear(),
            ("0" + (currentProjectedDate.getUTCMonth() + 1)).slice(-2),
            ("0" + currentProjectedDate.getUTCDate()).slice(-2),
          ].join("-");

          // Skip if user explicitly hard-deleted this date
          if (routine.deletedDates && routine.deletedDates.includes(checkDateStr)) {
            currentProjectedDate = new Date(currentProjectedDate.getTime() + 86400000);
            continue;
          }

          // Skip if already generated — compare UTC date components to match storage format
          const alreadyExists = existingRoutineTasks.some((t) => {
            const d = new Date(t.date);
            return (
              d.getUTCFullYear() === currentProjectedDate.getUTCFullYear() &&
              d.getUTCMonth() === currentProjectedDate.getUTCMonth() &&
              d.getUTCDate() === currentProjectedDate.getUTCDate()
            );
          });

          if (!alreadyExists) {
            // currentProjectedDate is already UTC midnight — store directly
            const storeDate = new Date(Date.UTC(
              currentProjectedDate.getUTCFullYear(),
              currentProjectedDate.getUTCMonth(),
              currentProjectedDate.getUTCDate(),
              0, 0, 0
            ));
            tasksToInsert.push({
              userId,
              routineId: routine._id,
              title: routine.title,
              description: routine.description || "",
              date: storeDate,
              targetDuration: routine.targetDuration || 0,
            });
          }
        }

        // Advance by exactly 1 day using milliseconds (UTC-safe, avoids DST shifts)
        currentProjectedDate = new Date(currentProjectedDate.getTime() + 86400000);
      }

      if (tasksToInsert.length > 0) {
        await Task.insertMany(tasksToInsert);
      }
    }
    // -- END LAZY GENERATION --

    // --- AUTO MARK PAST PENDING AS MISSED ---
    // Any task that was pending and whose date is strictly before today (IST) is now "missed"
    await Task.updateMany(
      {
        userId,
        status: "pending",
        date: { $lt: todayUTC },
      },
      { $set: { status: "missed" } }
    );

    // Return only tasks within the 3-month viewport window (frontend groups by date for the calendar)
    const tasks = await Task.find({
      userId,
      date: { $gte: windowStart, $lte: windowEnd },
    }).sort({ date: 1, createdAt: -1 });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
