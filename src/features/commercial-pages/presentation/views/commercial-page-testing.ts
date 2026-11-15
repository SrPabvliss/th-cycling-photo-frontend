import type { VueWrapper } from '@vue/test-utils'

/** Text of a node with its whitespace folded, as a reader would see it. */
export const textOf = (wrapper: { text(): string }) => wrapper.text().replace(/\s+/g, ' ').trim()

export function contactLinks(wrapper: VueWrapper) {
  return wrapper.findAll('a').map((link) => ({
    text: textOf(link),
    href: link.attributes('href'),
    target: link.attributes('target'),
    rel: link.attributes('rel'),
  }))
}
