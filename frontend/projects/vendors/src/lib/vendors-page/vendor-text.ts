import { Vendor, VendorCategory } from '@giddy/api';
import { joinNames } from '@giddy/core';

const planLabels: Record<string, string> = {
  inYourPlan: 'In your plan',
  quoteRequested: 'Quote requested',
  quoteReceived: 'Quote received',
  booked: 'Booked',
};

/** "In your plan", "Quote requested" and so on, or null when the vendor isn't in the plan. */
export function planLabel(vendor: Vendor): string | null {
  return vendor.planStatus ? planLabels[vendor.planStatus] : null;
}

function minutes(value: number): string {
  return value >= 60 && value % 60 === 0 ? `${value / 60} h` : `${value} min`;
}

/** "45 min · ages 4–10" for shows and activities; "Nut-free · 5 days’ notice" for food. */
export function vendorDetail(vendor: Vendor, category: VendorCategory): string {
  if (category === 'food') {
    const dietary = vendor.dietary.map((d) => d[0].toUpperCase() + d.slice(1));
    const notice =
      vendor.noticeDays === null
        ? []
        : [vendor.noticeDays === 1 ? 'Next-day delivery' : `${vendor.noticeDays} days’ notice`];
    return [...dietary, ...notice].join(' · ');
  }
  const ages =
    vendor.minAge !== null && vendor.maxAge !== null
      ? `ages ${vendor.minAge}–${vendor.maxAge}`
      : 'all ages';
  return [vendor.durationMinutes !== null ? minutes(vendor.durationMinutes) : null, ages]
    .filter(Boolean)
    .join(' · ');
}

/** "Can’t meet: dairy, gluten", "Meets every allergy", or null when there are none. */
export function allergyFitText(vendor: Vendor): { text: string; ok: boolean } | null {
  if (!vendor.allergyFit.length) return null;
  const missing = vendor.allergyFit.filter((f) => !f.ok).map((f) => f.allergen);
  return missing.length
    ? { text: `Can’t meet: ${missing.join(', ')}`, ok: false }
    : { text: 'Meets every allergy', ok: true };
}

/** "dairy (Maya), gluten (Hana) and peanut (Arjun)". */
export function allergyList(allergies: { allergen: string; children: string[] }[]): string {
  return joinNames(
    allergies.map((a) =>
      a.children.length ? `${a.allergen} (${joinNames(a.children)})` : a.allergen,
    ),
  );
}
