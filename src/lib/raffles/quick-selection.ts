type RaffleNumberLike = {
  number: number;
  status: string;
};

type QuickSelectionInput = {
  numbers: RaffleNumberLike[];
  selectedNumbers: Set<number>;
  quantity: number;
};

type RandomQuickSelectionInput = QuickSelectionInput & {
  random?: () => number;
};

export function getAvailableNumberValues(numbers: RaffleNumberLike[]) {
  return numbers
    .filter((item) => item.status === "available")
    .map((item) => item.number)
    .sort((first, second) => first - second);
}

export function addRandomAvailableNumbers({
  numbers,
  selectedNumbers,
  quantity,
  random = Math.random,
}: RandomQuickSelectionInput) {
  const next = new Set(selectedNumbers);
  const available = getAvailableNumberValues(numbers).filter(
    (number) => !next.has(number),
  );

  while (next.size < quantity && available.length > 0) {
    const index = Math.min(
      Math.floor(random() * available.length),
      available.length - 1,
    );
    const [number] = available.splice(index, 1);
    next.add(number);
  }

  return next;
}
