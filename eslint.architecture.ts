import type { Linter } from 'eslint'

const BASE_FEATURES = [
  'auth',
  'account',
  'locations',
  'pricing',
  'tenant-profile',
  'legal',
  'event-types',
  'participant-categories',
  'event-assets',
  'photo-categories',
  'organizers',
  'contracts',
  'review',
] as const

const DOMAIN_FEATURES = [
  'buyers',
  'cart',
  'client-gallery',
  'delivery',
  'events',
  'landing',
  'notifications',
  'orders',
  'payments',
  'photos',
  'preview-links',
  'public-gallery',
  'retouch',
] as const

type Severity = 'error' | 'warn'

function restrict(severity: Severity, patterns: { group: string[]; message: string }[]) {
  return { 'no-restricted-imports': [severity, { patterns }] } as Linter.RulesRecord
}

const LAYER_MESSAGE =
  'Layer violation: this directory sits below features/. See .claude/contexts/structure/project-layout.md'

export const architectureBoundaries: Linter.Config[] = [
  {
    name: 'architecture/shared-and-core-never-import-features',
    files: ['src/shared/**/*.{ts,vue}'],
    rules: restrict('error', [
      { group: ['@/features/*', '@/features/**'], message: LAYER_MESSAGE },
    ]),
  },

  {
    name: 'architecture/core-never-imports-features',
    files: ['src/core/**/*.{ts,vue}'],
    rules: restrict('error', [
      { group: ['@/features/*', '@/features/**'], message: LAYER_MESSAGE },
    ]),
  },

  ...BASE_FEATURES.map((feature) => ({
    name: `architecture/base-${feature}-never-imports-domain`,
    files: [`src/features/${feature}/**/*.{ts,vue}`],
    rules: restrict('error', [
      {
        group: DOMAIN_FEATURES.map((domain) => `@/features/${domain}/**`),
        message: `Base feature "${feature}" may not import a domain feature. Base features must stay leaves.`,
      },
    ]),
  })),

  ...DOMAIN_FEATURES.map((feature) => ({
    name: `architecture/domain-${feature}-never-imports-domain`,
    files: [`src/features/${feature}/**/*.{ts,vue}`],
    rules: restrict('warn', [
      {
        group: DOMAIN_FEATURES.filter((other) => other !== feature).map(
          (other) => `@/features/${other}/**`,
        ),
        message: `Domain features may not import each other. Move the shared piece to shared/, promote it to a base feature, or use a core/ registry.`,
      },
    ]),
  })),
]
