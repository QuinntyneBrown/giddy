import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblem } from '@giddy/api';

/** The API's first message for each field, from a 400 answer; empty for anything else. */
export function fieldErrors<F extends string>(
  error: unknown,
  fields: F[],
): Partial<Record<F, string>> {
  const problem =
    error instanceof HttpErrorResponse && error.status === 400
      ? (error.error as ApiProblem | null)
      : null;
  if (!problem?.errors) return {};
  return Object.fromEntries(
    fields.map((f) => [f, problem.errors![f]?.[0]]).filter(([, m]) => m),
  ) as Partial<Record<F, string>>;
}
