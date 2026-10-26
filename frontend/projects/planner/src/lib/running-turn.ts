export interface RunningStep {
  id: string;
  text: string;
  done: boolean;
}

/** Giddy's turn in progress: the steps so far and the last event seen. */
export interface RunningTurn {
  turnId: string;
  steps: RunningStep[];
  after: number;
}
