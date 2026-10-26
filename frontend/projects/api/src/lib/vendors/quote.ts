export interface Quote {
  id: string;
  vendorId: string;
  vendorName: string;
  status: 'requested' | 'quoted' | 'accepted';
  /** For example "Rexy usually replies within a day." */
  replyTime: string;
}
