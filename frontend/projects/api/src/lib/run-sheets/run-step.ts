export interface RunStep {
  id: string;
  /** HH:mm in Toronto. */
  time: string;
  title: string;
  details: string;
  /** Who looks after it: the parent, the venue host or a vendor. */
  who: string;
  /** The one thing not to forget, such as the gluten-free slice. */
  reminder: string | null;
}
