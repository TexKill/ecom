const fallbackApiUrl = "http://localhost:9000";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;

try {
  new URL(rawApiUrl);
} catch {
  throw new Error("Invalid NEXT_PUBLIC_API_URL: expected a valid absolute URL");
}

export const clientEnv = {
  NEXT_PUBLIC_API_URL: rawApiUrl.replace(/\/+$/, ""),
};

