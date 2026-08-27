export const TENANT_PROFILE_QUERY_KEYS = {
  profile: () => ['tenant-profile'] as const,
  payoutMethods: () => ['tenant-profile', 'payout-methods'] as const,
  contracts: () => ['tenant-profile', 'contracts'] as const,
}
