import { format } from "date-fns";

export const formatMessageDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "HH:mm");
};
