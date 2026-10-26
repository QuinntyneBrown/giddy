import { Proposal } from '@giddy/api';
import { PlanCardRow } from '@giddy/components';
import { formatMoney } from '@giddy/core';

const emojis: Record<string, string> = {
  Venue: '📍',
  Entertainer: '🧪',
  Cake: '🎂',
  Food: '🍕',
  'Loot bags': '🎁',
};

/** The rows of a plan card: the theme first, then each priced item. */
export function planRows(proposal: Proposal): PlanCardRow[] {
  return [
    {
      emoji: '🦕',
      title: 'Theme',
      meta: `${proposal.theme.name}: ${proposal.theme.detail}`,
      price: '',
    },
    ...proposal.items.map((item) => ({
      emoji: emojis[item.category] ?? '✨',
      title: item.category,
      meta: `${item.name} · ${item.detail}`,
      price: formatMoney(item.price),
      note: item.allergyNote,
    })),
  ];
}

/** "$778 of $800", "$178 over $600", or the total alone when there is no budget. */
export function planTotal(proposal: Proposal): string {
  if (proposal.budget === null) return formatMoney(proposal.total);
  return proposal.overBudgetBy > 0
    ? `${formatMoney(proposal.overBudgetBy)} over ${formatMoney(proposal.budget)}`
    : `${formatMoney(proposal.total)} of ${formatMoney(proposal.budget)}`;
}
