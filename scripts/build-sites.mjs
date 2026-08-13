import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const sourceDist = resolve(root, 'dist')
const siteDist = resolve(root, 'dist-sites')

await rm(siteDist, { recursive: true, force: true })
await mkdir(resolve(siteDist, 'client'), { recursive: true })
await mkdir(resolve(siteDist, 'server'), { recursive: true })
await mkdir(resolve(siteDist, '.openai'), { recursive: true })
await cp(sourceDist, resolve(siteDist, 'client'), { recursive: true })
await cp(resolve(root, '.openai/hosting.json'), resolve(siteDist, '.openai/hosting.json'))
await writeFile(resolve(siteDist, 'server/index.js'), `export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request)
  },
}
`)
