import { NavItem } from './nav-item';

export interface NavGroup {
  /** Group heading; the first group usually has none. */
  label?: string;
  items: NavItem[];
}
