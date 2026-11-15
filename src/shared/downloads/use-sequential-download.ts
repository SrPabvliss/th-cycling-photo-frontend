import { getCurrentScope, onScopeDispose, ref, type Ref } from 'vue'

import { downloadFile } from './download-file'

export interface IDownloadableFile {
  url: string
  filename: string
}

export type SequentialDownloadState = 'idle' | 'running' | 'stopped' | 'failed' | 'done'

export interface ISequentialDownload {
  state: Ref<SequentialDownloadState>
  /** Files already downloaded. */
  done: Ref<number>
  total: Ref<number>
  start(): Promise<void>
  /** Stops after the file in progress. */
  stop(): void
  /** Continues from the first file not downloaded, with fresh addresses. */
  resume(): Promise<void>
}

/**
 * Downloads several files one after another, counting them. The addresses are asked for every
 * time it starts or resumes (they expire after an hour). A failure keeps the count, so resuming
 * goes on from there; leaving the screen stops it.
 */
export function useSequentialDownload(options: {
  getFiles: () => Promise<IDownloadableFile[]>
}): ISequentialDownload {
  const state = ref<SequentialDownloadState>('idle')
  const done = ref(0)
  const total = ref(0)
  let stopRequested = false
  let disposed = false
  let running = false

  async function run(from: number) {
    if (running) return
    running = true
    stopRequested = false
    state.value = 'running'
    done.value = from
    try {
      let files: IDownloadableFile[]
      try {
        files = await options.getFiles()
      } catch {
        state.value = 'failed'
        return
      }
      total.value = files.length
      for (let index = from; index < files.length; index += 1) {
        if (disposed) return
        if (stopRequested) {
          state.value = 'stopped'
          return
        }
        const file = files[index]!
        try {
          await downloadFile(file.url, file.filename)
        } catch {
          state.value = 'failed'
          return
        }
        done.value = index + 1
      }
      state.value = stopRequested && done.value < files.length ? 'stopped' : 'done'
    } finally {
      running = false
    }
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      disposed = true
      stopRequested = true
    })
  }

  return {
    state,
    done,
    total,
    start: () => run(0),
    stop: () => {
      if (running) stopRequested = true
    },
    resume: () => run(done.value),
  }
}
