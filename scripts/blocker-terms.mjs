// Words that ad blocker lists (EasyList and the like) match in addresses and class names. A
// house spot whose file or class carries one of them can be cut or hidden by a blocker, and a
// module the app imports up front can stop the whole app. Used by check-blocker-names.mjs and
// by the house-spots names spec.

/** True when a file name or class name has a blocker word as a word or segment. */
export function hasBlockerTerm(name) {
  if (/advert|banner|sponsor|promo/i.test(name)) return true
  return name.split(/[-_./\s]+|(?=[A-Z])/).some((segment) => /^ads?$/i.test(segment))
}

/**
 * The name of an emitted file without its extension and the 8-character hash the build adds
 * ("use-my-contracts-CQ740DAd.js" is "use-my-contracts"): a random hash can spell anything.
 */
export function emittedName(file) {
  return file.replace(/\.[a-z0-9]+$/i, '').replace(/-[\w-]{8}$/, '')
}

/**
 * Names outside the house spots that match and stay, each with its reason. A new match fails.
 */
export const KNOWN_OUTSIDE = {
  'cf-banner': 'organizer panel (ClassificationFailuresBanner); the panel stays as it is',
  iti__ad: 'intl-tel-input: flag of Andorra (ISO code AD), third-party CSS',
}
