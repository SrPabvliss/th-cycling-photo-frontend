/**
 * Options of every mutation of the client area. By default vue-query pauses a mutation without
 * network and sends it on its own when the network is back, so an action the person gave up on
 * could happen later, unseen. Here it fails at once, as a request with no answer, and the screen
 * says "Sin conexión a internet" next to the action. The organizer panel keeps the default.
 */
export const CLIENT_MUTATION = { networkMode: 'always' } as const
