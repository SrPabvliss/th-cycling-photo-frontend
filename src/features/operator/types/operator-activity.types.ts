/**
 * Operator activity discriminator. Shared by recent-activity items and by
 * any UI piece that needs to differentiate review work from retouch work
 * (e.g. queue jump cards, activity icons, KPI tiles).
 */
export type ActivityType = 'review' | 'retouch'
