const defaultQuickPickOptions = [5, 10, 20, 50, 100] as const;

export function getQuickPickOptions(
  maxNumbersPerReservation: number,
  availableNumbers: number,
) {
  const limit = Math.min(
    Math.max(Math.trunc(maxNumbersPerReservation), 0),
    Math.max(Math.trunc(availableNumbers), 0),
  );

  return defaultQuickPickOptions.filter((value) => value <= limit);
}
