export type ActivityType = 
  | "price_updated"
  | "price_published"
  | "price_unpublished"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "bulk_update"
  | "settings_changed";

export interface ActivityLog {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  entityType: "price" | "product" | "system";
  entityId: string;
  entityName: string;
  action: string;
  changes?: Record<string, { from: any; to: any }>;
  timestamp: Date;
  metadata?: Record<string, any>;
}
