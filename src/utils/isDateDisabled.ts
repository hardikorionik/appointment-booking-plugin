import { DateTime } from "luxon";

import type { Staff, DateItem } from "@/types";

interface IsDateDisabledProps {
  dateObj: DateItem;

  selectedProfessional?: Staff | null;

  outletTimeZone: string;
}

export const isDateDisabled = ({
  dateObj,
  selectedProfessional,
  outletTimeZone,
}: IsDateDisabledProps): boolean => {
  if (!selectedProfessional) return false;

  const dt = DateTime.fromISO(dateObj.fullDate || "").setZone(outletTimeZone);

  const currentDate = dt.toFormat("yyyy-MM-dd");

  /* =========================
     1. STAFF LEAVE DATES
  ========================= */

  const leaveDates = selectedProfessional?.futureLeaveDates || [];

  const isOnLeave = leaveDates.some((leave) => {
    if (leave.status !== "APPROVED" || leave.leaveType !== "FULL_DAY") {
      return false;
    }

    const leaveDate = leave?.leavePeriod?.date;

    if (!leaveDate) return false;

    const formattedLeaveDate =
      DateTime.fromISO(leaveDate).toFormat("yyyy-MM-dd");

    return formattedLeaveDate === currentDate;
  });

  if (isOnLeave) return true;

  /* =========================
     2. DATE OVERRIDES
  ========================= */

  const overrides = selectedProfessional?.dateOverrides || [];

  const matchingOverride = overrides.find((override) => {
    const overrideDate = DateTime.fromISO(override.date).toFormat("yyyy-MM-dd");

    return overrideDate === currentDate;
  });

  if (matchingOverride?.type === "CLOSED") {
    return true;
  }

  if (matchingOverride?.type === "TIME") {
    return false;
  }

  /* =========================
     3. WEEKLY HOURS
  ========================= */

  const weeklyJson = selectedProfessional?.weeklyHours?.weeklyJson || {};

  const weekKeyMap: Record<number, string> = {
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
    6: "sat",
    7: "sun",
  };

  const weekdayKey = weekKeyMap[dt.weekday];

  const dayConfig = weeklyJson?.[weekdayKey];

  if (!dayConfig || dayConfig.isClosed) {
    return true;
  }

  return false;
};
