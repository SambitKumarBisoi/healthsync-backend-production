const generateSlots = (startTime, endTime, slotDuration) => {
  const slots = [];

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  while (start + slotDuration <= end) {
    const slotStartHour = Math.floor(start / 60);
    const slotStartMinute = start % 60;

    const slotEnd = start + slotDuration;
    const slotEndHour = Math.floor(slotEnd / 60);
    const slotEndMinute = slotEnd % 60;

    const slot = `${String(slotStartHour).padStart(2, "0")}:${String(
      slotStartMinute
    ).padStart(2, "0")} - ${String(slotEndHour).padStart(2, "0")}:${String(
      slotEndMinute
    ).padStart(2, "0")}`;

    slots.push(slot);
    start = slotEnd;
  }

  return slots;
};

export default generateSlots;
