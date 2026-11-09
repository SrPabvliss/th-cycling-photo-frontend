export interface IPostLoginContext {
  permissions: string[]
}

type PostLoginTask = (context: IPostLoginContext) => Promise<void> | void

const tasks = new Set<PostLoginTask>()

export function registerPostLoginTask(task: PostLoginTask): void {
  tasks.add(task)
}

export async function runPostLoginTasks(context: IPostLoginContext): Promise<void> {
  await Promise.all(
    Array.from(tasks).map(async (task) => {
      try {
        await task(context)
      } catch {
        return
      }
    }),
  )
}
