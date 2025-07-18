import { isSameDay } from "date-fns";
import { Message } from "@/types/message";

export const shouldShowDateMarker = (
  currentMessage: Message,
  previousMessage?: Message
) => {
  if (!previousMessage) return true;

  const currentDate = new Date(currentMessage.created_at);
  const previousDate = new Date(previousMessage.created_at);

  return !isSameDay(currentDate, previousDate);
};
