export interface InboxItem {
  id: string;
  /** An emoji, such as 💌 for a reply. */
  icon: string;
  title: string;
  detail: string;
  /** The page in the app it is about. */
  link: string;
  /** ISO instant. */
  createdAt: string;
  read: boolean;
}
