export interface CurrencyInfo {
  code: string;
  locale: string;
}

const USD_EXCHANGE_RATES: Record<string, number> = {
  INR: 83,
  GBP: 0.79,
  EUR: 0.92,
  JPY: 155,
};

const INDIA_STATES = new Set([
  "ap",
  "ar",
  "as",
  "br",
  "cg",
  "ch",
  "dh",
  "dl",
  "ga",
  "gj",
  "hp",
  "hr",
  "jh",
  "jk",
  "ka",
  "kl",
  "la",
  "ld",
  "mh",
  "ml",
  "mn",
  "mp",
  "mz",
  "nl",
  "od",
  "pb",
  "py",
  "rj",
  "sk",
  "tg",
  "tn",
  "tr",
  "ts",
  "uk",
  "up",
  "wb",
]);

const INDIA_CITIES = new Set([
  "hyderabad",
  "bengaluru",
  "bangalore",
  "mumbai",
  "delhi",
  "chennai",
  "pune",
  "kolkata",
  "ahmedabad",
  "jaipur",
  "surat",
]);

function normalize(value?: string) {
  return (value ?? "").trim().toLowerCase();
}

export function resolveCurrency({
  country,
  state,
  city,
}: {
  country?: string;
  state?: string;
  city?: string;
}): CurrencyInfo {
  const normalizedCountry = normalize(country);
  const normalizedState = normalize(state);
  const normalizedCity = normalize(city);

  if (
    normalizedCountry.includes("india") ||
    INDIA_STATES.has(normalizedState) ||
    INDIA_CITIES.has(normalizedCity)
  ) {
    return { code: "INR", locale: "en-IN" };
  }

  if (normalizedCountry.includes("uk") || normalizedCountry.includes("united kingdom")) {
    return { code: "GBP", locale: "en-GB" };
  }

  if (normalizedCountry.includes("japan")) {
    return { code: "JPY", locale: "ja-JP" };
  }

  if (normalizedCountry.includes("euro") || normalizedCountry.includes("europe")) {
    return { code: "EUR", locale: "en-IE" };
  }

  return { code: "USD", locale: "en-US" };
}

export function formatCurrency(
  amount: number,
  code = "USD",
  locale = "en-US"
) {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(safeAmount);
  } catch {
    const symbol = code === "INR" ? "₹" : "$";
    return `${symbol}${safeAmount.toLocaleString()}`;
  }
}

export function convertFromUsd(amount: number, code: string) {
  const rate = USD_EXCHANGE_RATES[code] ?? 1;
  return Math.round(amount * rate);
}
