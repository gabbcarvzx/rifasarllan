export type RaffleShareDetails = {
  platformName: string;
  raffleTitle: string;
  priceLabel: string;
  drawDateLabel: string;
};

export function buildRaffleShareText({
  platformName,
  raffleTitle,
  priceLabel,
  drawDateLabel,
}: RaffleShareDetails) {
  return [
    `${raffleTitle} - ${platformName}`,
    `Numeros a partir de ${priceLabel}.`,
    `Sorteio previsto: ${drawDateLabel}.`,
    "Escolha seus numeros e participe:",
  ].join("\n");
}

export function buildWhatsAppShareUrl(text: string, pageUrl: string) {
  const cleanUrl = pageUrl.split("#")[0];
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${cleanUrl}`)}`;
}
