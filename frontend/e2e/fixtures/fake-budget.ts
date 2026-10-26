import { Request } from '@playwright/test';
import { FakeResponse } from './fake-planner';
import { SeedVendor } from './fake-vendors';

type Register = (
  method: string,
  path: string,
  handler: (request: Request, params: Record<string, string>) => FakeResponse,
) => void;

/** A plan item, as the parties fake keeps them. */
export interface PlanItem {
  category: string;
  name: string;
  price: number;
  status: string;
  paid: number;
}

export interface SeedExpense {
  id: string;
  description: string;
  category: string;
  amount: number;
  paid: boolean;
}

interface PartyFacts {
  budget: number | null;
  guests: number | null;
  status: string;
}

const planOrder = ['Venue', 'Entertainer', 'Activity', 'Cake', 'Food', 'Loot bags', 'Rental'];
const categories = ['Decorations', 'Venue', 'Entertainment', 'Food & cake', 'Loot bags', 'Other'];

/** The budget, a view of the plan plus the parent's own costs, as the API answers it. */
export class FakeBudget {
  /** The parent's own costs by party id. */
  expenses = new Map<string, SeedExpense[]>();
  /** Giddy's estimates for parties that had no plan, by party id. */
  estimates = new Map<string, PlanItem[]>();
  private nextId = 1;

  constructor(
    private readonly party: (partyId: string) => PartyFacts | null,
    private readonly plan: () => PlanItem[],
    private readonly vendors: () => SeedVendor[],
  ) {}

  register(on: Register): void {
    on('GET', '/api/parties/:partyId/budget', (_, { partyId }) =>
      this.party(partyId) ? { body: this.view(partyId) } : { status: 404 },
    );
    on('POST', '/api/parties/:partyId/budget/lines', (request, { partyId }) => {
      const invalid = this.validate(request);
      if (invalid) return invalid;
      const body = request.postDataJSON() as Omit<SeedExpense, 'id'>;
      const expense = {
        ...body,
        description: body.description.trim(),
        id: `cost-${this.nextId++}`,
      };
      this.expenses.set(partyId, [...this.costs(partyId), expense]);
      return { status: 201, body: this.expenseLine(expense) };
    });
    on('PUT', '/api/parties/:partyId/budget/lines/:costId', (request, { partyId, costId }) => {
      const invalid = this.validate(request);
      if (invalid) return invalid;
      if (!this.costs(partyId).some((e) => e.id === costId)) return { status: 404 };
      const body = request.postDataJSON() as Omit<SeedExpense, 'id'>;
      const expense = { ...body, description: body.description.trim(), id: costId };
      this.expenses.set(
        partyId,
        this.costs(partyId).map((e) => (e.id === costId ? expense : e)),
      );
      return { body: this.expenseLine(expense) };
    });
    on('DELETE', '/api/parties/:partyId/budget/lines/:costId', (_, { partyId, costId }) => {
      if (!this.costs(partyId).some((e) => e.id === costId)) return { status: 404 };
      this.expenses.set(
        partyId,
        this.costs(partyId).filter((e) => e.id !== costId),
      );
      return { status: 204 };
    });
    on('POST', '/api/parties/:partyId/budget/estimate', (_, { partyId }) => {
      if (this.items(partyId).length || this.costs(partyId).length)
        return {
          status: 409,
          body: { status: 409, title: 'This party already has costs to work from.' },
        };
      const kids = this.party(partyId)?.guests ?? 12;
      this.estimates.set(partyId, [
        { category: 'Venue', name: 'Venue (estimate)', price: 300, status: 'toBook', paid: 0 },
        {
          category: 'Entertainer',
          name: 'Entertainer (estimate)',
          price: 200,
          status: 'toBook',
          paid: 0,
        },
        { category: 'Cake', name: 'Cake (estimate)', price: 80, status: 'toBook', paid: 0 },
        { category: 'Food', name: 'Food (estimate)', price: 7 * kids, status: 'toBook', paid: 0 },
        {
          category: 'Loot bags',
          name: 'Loot bags (estimate)',
          price: 4 * kids,
          status: 'toBook',
          paid: 0,
        },
      ]);
      return { body: this.view(partyId) };
    });
    on('POST', '/api/parties/:partyId/budget/swaps', (request, { partyId }) => {
      const body = request.postDataJSON() as { category: string; replacementId: string };
      const item = this.items(partyId).find((i) => i.category === body.category);
      const vendor = this.vendors().find((v) => v.id === body.replacementId);
      if (!item || !vendor) return { status: 404 };
      if (item.status === 'confirmed')
        return {
          status: 409,
          body: {
            status: 409,
            title: `${item.name} is already booked, so it can’t be swapped here.`,
          },
        };
      Object.assign(item, { name: vendor.name, price: vendor.price, status: 'toBook', paid: 0 });
      return { body: this.view(partyId) };
    });
  }

  private items(partyId: string): PlanItem[] {
    const party = this.party(partyId);
    if (party && party.status !== 'draft') return this.plan();
    return this.estimates.get(partyId) ?? [];
  }

  private costs(partyId: string): SeedExpense[] {
    return this.expenses.get(partyId) ?? [];
  }

  private view(partyId: string) {
    const party = this.party(partyId)!;
    const items = [...this.items(partyId)].sort(
      (a, b) => planOrder.indexOf(a.category) - planOrder.indexOf(b.category),
    );
    const lines = [
      ...items.map((item) => ({
        id: `plan:${item.category}`,
        kind: 'plan',
        category: item.category,
        name: item.name,
        status: status(item),
        planned: item.price,
        paid: item.paid,
      })),
      ...this.costs(partyId).map((e) => this.expenseLine(e)),
    ];
    const planned = lines.reduce((sum, l) => sum + l.planned, 0);
    const paid = lines.reduce((sum, l) => sum + l.paid, 0);
    const overBy = party.budget !== null ? Math.max(0, planned - party.budget) : 0;
    const totals = new Map<string, number>();
    for (const line of lines)
      totals.set(line.category, (totals.get(line.category) ?? 0) + line.planned);
    return {
      budget: party.budget,
      planned,
      paid,
      left: party.budget !== null ? party.budget - planned : null,
      perKid: party.guests ? Math.round(planned / party.guests) : null,
      over: overBy > 0,
      overBy,
      categories: [...totals.entries()].map(([category, amount]) => ({ category, amount })),
      lines,
      swaps: overBy > 0 ? this.swaps(items, overBy) : [],
    };
  }

  /** Like the API: the smallest single swap that is enough, otherwise the biggest savings first. */
  private swaps(items: PlanItem[], overBy: number) {
    const options = items
      .filter((item) => item.status !== 'confirmed')
      .map((item) => {
        const best = this.vendors()
          .filter((v) => v.category !== 'activities' && v.planCategory === item.category)
          .filter((v) => v.name !== item.name && v.price < item.price)
          .sort((a, b) => a.price - b.price)[0];
        return best
          ? {
              category: item.category,
              currentName: item.name,
              currentPrice: item.price,
              replacementId: best.id,
              replacementName: best.name,
              replacementPrice: best.price,
              saving: item.price - best.price,
            }
          : null;
      })
      .filter((o) => o !== null);
    const single = options.filter((o) => o.saving >= overBy).sort((a, b) => a.saving - b.saving)[0];
    if (single) return [single];
    const chosen = [];
    for (const option of options.sort((a, b) => b.saving - a.saving)) {
      chosen.push(option);
      if (chosen.reduce((sum, c) => sum + c.saving, 0) >= overBy) break;
    }
    return chosen;
  }

  private expenseLine(expense: SeedExpense) {
    return {
      id: expense.id,
      kind: 'expense',
      category: expense.category,
      name: expense.description,
      status: expense.paid ? 'paid' : 'estimate',
      planned: expense.amount,
      paid: expense.paid ? expense.amount : 0,
    };
  }

  private validate(request: Request): FakeResponse | null {
    const body = request.postDataJSON() as Partial<SeedExpense>;
    const errors: Record<string, string[]> = {};
    if (!body.description?.trim()) errors['description'] = ['Say what the cost is for.'];
    if (!categories.includes(body.category ?? '')) errors['category'] = ['Choose a category.'];
    const amount = body.amount ?? 0;
    if (!(amount > 0) || Math.round(amount * 100) !== amount * 100)
      errors['amount'] = ['Enter an amount like 35 or 35.50'];
    return Object.keys(errors).length
      ? { status: 400, body: { status: 400, title: 'Some details need fixing.', errors } }
      : null;
  }
}

function status(item: PlanItem): string {
  if (item.status === 'quoted') return 'quoted';
  if (item.status !== 'confirmed') return 'estimate';
  if (item.paid >= item.price) return 'paid';
  return item.paid > 0 ? 'depositPaid' : 'booked';
}
