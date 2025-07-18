import { format, isToday, isYesterday } from "date-fns";

export const formatDateMarker = (dateString: string) => {
  const date = new Date(dateString);

  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "EEEE, MMMM d, yyyy");
  }
};
