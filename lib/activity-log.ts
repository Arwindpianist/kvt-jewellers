import type { ActivityLog, ActivityType } from "@/types/activity-log";

// In-memory storage for activity logs
// In production, this would be in a database
let activityLogs: ActivityLog[] = [];

const MAX_LOGS = 1000; // Keep last 1000 logs

/**
 * Logs an activity
 */
export function logActivity(
  type: ActivityType,
  userId: string,
  userName: string,
  entityType: "price" | "product" | "system",
  entityId: string,
  entityName: string,
  action: string,
  changes?: Record<string, { from: any; to: any }>,
  metadata?: Record<string, any>
): void {
  const log: ActivityLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    type,
    userId,
    userName,
    entityType,
    entityId,
    entityName,
    action,
    changes,
    timestamp: new Date(),
    metadata,
  };

  activityLogs.unshift(log); // Add to beginning

  // Keep only last MAX_LOGS
  if (activityLogs.length > MAX_LOGS) {
    activityLogs = activityLogs.slice(0, MAX_LOGS);
  }
}

/**
 * Gets all activity logs
 */
export function getActivityLogs(
  filters?: {
    userId?: string;
    type?: ActivityType;
    entityType?: "price" | "product" | "system";
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
): ActivityLog[] {
  let filtered = [...activityLogs];

  if (filters?.userId) {
    filtered = filtered.filter((log) => log.userId === filters.userId);
  }

  if (filters?.type) {
    filtered = filtered.filter((log) => log.type === filters.type);
  }

  if (filters?.entityType) {
    filtered = filtered.filter((log) => log.entityType === filters.entityType);
  }

  if (filters?.startDate) {
    filtered = filtered.filter((log) => log.timestamp >= filters.startDate!);
  }

  if (filters?.endDate) {
    filtered = filtered.filter((log) => log.timestamp <= filters.endDate!);
  }

  if (filters?.limit) {
    filtered = filtered.slice(0, filters.limit);
  }

  return filtered;
}

/**
 * Gets recent activity logs
 */
export function getRecentActivityLogs(limit: number = 10): ActivityLog[] {
  return activityLogs.slice(0, limit);
}

/**
 * Clears all activity logs (for testing/reset)
 */
export function clearActivityLogs(): void {
  activityLogs = [];
}
