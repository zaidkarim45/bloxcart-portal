/**
 * Amounts throughout the checkout/order domain are plain decimal numbers
 * in the display currency's major unit (e.g. 5.49 = $5.49), not cents.
 * When real Shopify order data is wired in (Phase L), map its cents-based
 * amounts down to this shape at the boundary rather than changing this
 * convention everywhere it's consumed.
 */
export function formatMoney(amount: number, currency: string = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}
