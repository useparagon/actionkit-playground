export const ACTIONKIT_BASE_URL = process.env.NEXT_PUBLIC_PARAGON_BASE_URL
  ? `https://worker-actionkit.${process.env.NEXT_PUBLIC_PARAGON_BASE_URL}`
  : "https://actionkit.useparagon.com";
