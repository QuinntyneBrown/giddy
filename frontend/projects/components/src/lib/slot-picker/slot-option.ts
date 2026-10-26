export interface SlotOption {
  /** The value emitted when picked, for example "13:00". */
  value: string;
  /** Shown on the button, for example "1:00 pm". */
  label: string;
  /** Read by screen readers, for example "10:00 am to 12:30 pm". */
  description: string;
  booked: boolean;
}
