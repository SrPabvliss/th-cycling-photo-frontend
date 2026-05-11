import type { Component } from 'vue'
import { CheckmarkDoneOutline, ColorWandOutline } from '@vicons/ionicons5'

import type { ActivityType } from '../types/operator-activity.types'

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  review: 'Revisión',
  retouch: 'Retoque',
}

export const ACTIVITY_TYPE_ICONS: Record<ActivityType, Component> = {
  review: CheckmarkDoneOutline,
  retouch: ColorWandOutline,
}

/**
 * CSS color tokens / inline values for primary tint and accent of each
 * activity type. Components reuse these instead of hardcoding hex values
 * or repeating ternaries.
 */
export const ACTIVITY_TYPE_TINTS: Record<ActivityType, { bg: string; fg: string }> = {
  review: { bg: 'rgba(16, 80, 128, 0.12)', fg: 'var(--tt-primary)' },
  retouch: { bg: 'rgba(245, 158, 11, 0.16)', fg: 'var(--tt-warning)' },
}
