import type {
  IApiOperatorRetouchEventOption,
  IOperatorRetouchEventOption,
} from '../types/responses/operator-retouch-event-option.response'

export function toOperatorRetouchEventOption(
  api: IApiOperatorRetouchEventOption,
): IOperatorRetouchEventOption {
  return { id: api.id, slug: api.slug, name: api.name }
}

export function toOperatorRetouchEventOptions(
  items: IApiOperatorRetouchEventOption[],
): IOperatorRetouchEventOption[] {
  return items.map(toOperatorRetouchEventOption)
}
