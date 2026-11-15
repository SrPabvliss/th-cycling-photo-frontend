import { onBeforeUnmount, onMounted } from 'vue'

export interface IPageMeta {
  title: string
  description: string
}

/**
 * Tab title and description of a page while it is on screen. Leaving gives back what was there
 * before, so the rest of the app keeps its plain title.
 */
export function usePageMeta(meta: IPageMeta): void {
  let previousTitle = ''
  let previousDescription: string | null = null
  let created: HTMLMetaElement | null = null

  onMounted(() => {
    previousTitle = document.title
    document.title = meta.title

    let tag = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (tag) previousDescription = tag.content
    else {
      tag = document.createElement('meta')
      tag.name = 'description'
      document.head.append(tag)
      created = tag
    }
    tag.content = meta.description
  })

  onBeforeUnmount(() => {
    document.title = previousTitle
    if (created) created.remove()
    else if (previousDescription !== null) {
      const tag = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
      if (tag) tag.content = previousDescription
    }
  })
}
