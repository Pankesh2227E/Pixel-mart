/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility to format numeric price values into Indian Rupees (₹) format.
 * Simply replaces the currency symbol while keeping the raw numeric value.
 */
export function formatPrice(price: number | string | undefined | null): string {
  if (price === undefined || price === null) {
    return '₹0';
  }
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numericPrice)) {
    return '₹0';
  }
  // format with Indian/English locale representation but keeping the same values
  return `₹${numericPrice.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
