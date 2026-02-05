import type { NextApiRequest, NextApiResponse } from "next";

type GeoapifyResult = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  state_code?: string;
  country?: string;
  country_code?: string;
};

type ResolveLocationResponse = {
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  stateCode?: string;
  currencyCode?: string;
  currencySymbol?: string;
  currencyName?: string;
};

async function fetchCurrency(countryCode: string) {
  const url = `https://restcountries.com/v3.1/alpha/${countryCode}?fields=currencies,cca2,cca3`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as Array<{
    currencies?: Record<string, { name?: string; symbol?: string }>;
  }>;
  const currencies = data?.[0]?.currencies;
  if (!currencies) {
    return null;
  }
  const [code] = Object.keys(currencies);
  if (!code) {
    return null;
  }
  const meta = currencies[code] ?? {};
  return {
    currencyCode: code,
    currencyName: meta.name,
    currencySymbol: meta.symbol,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResolveLocationResponse | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const query = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
  const text = (query ?? "").toString().trim();
  if (!text) {
    return res.status(400).json({ error: "Missing location query" });
  }

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEOAPIFY_API_KEY not configured" });
  }

  const params = new URLSearchParams({
    text,
    format: "json",
    limit: "3",
    apiKey,
  });
  const url = `https://api.geoapify.com/v1/geocode/search?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    return res.status(502).json({ error: "Geoapify lookup failed" });
  }
  const data = (await response.json()) as { results?: GeoapifyResult[] };
  const result = data?.results?.[0];
  if (!result) {
    return res.status(404).json({ error: "No location match found" });
  }

  const city =
    result.city ||
    result.town ||
    result.village ||
    result.municipality ||
    result.county ||
    undefined;
  const state = result.state || result.county || undefined;
  const stateCode = result.state_code || undefined;
  const country = result.country || undefined;
  const countryCode = result.country_code
    ? result.country_code.toUpperCase()
    : undefined;

  const currency = countryCode ? await fetchCurrency(countryCode) : null;

  return res.status(200).json({
    city,
    state: stateCode ?? state,
    country,
    countryCode,
    stateCode,
    currencyCode: currency?.currencyCode,
    currencyName: currency?.currencyName,
    currencySymbol: currency?.currencySymbol,
  });
}
