const areaCodes = new Set(
  (
    '204 226 236 249 250 257 263 289 306 343 354 365 367 368 382 387 403 416 418 428 431 437 438 450 ' +
    '460 468 474 506 514 519 548 579 581 584 587 604 613 639 647 672 683 705 709 742 753 778 780 782 ' +
    '807 819 825 867 873 879 902 905 942'
  ).split(' '),
);

/** Ten digits (optionally after a leading 1) with a Canadian area code, as the API checks. */
export function isCanadianMobile(value: string): boolean {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return digits.length === 10 && areaCodes.has(digits.slice(0, 3));
}
