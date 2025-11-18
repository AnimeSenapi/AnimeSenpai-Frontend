import { statSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const budgets = {
  main: 200 * 1024, // 200KB gzip (approximate raw cap; CI should use gzip in future)
  admin: 400 * 1024,
}

function listChunkSizes(dir) {
  const files = readdirSync(dir).filter((f) => f.endsWith('.js'))
  const sizes = files.map((f) => ({ file: f, size: statSync(join(dir, f)).size }))
  sizes.sort((a, b) => b.size - a.size)
  return sizes
}

function fail(msg) {
  console.error(msg)
  process.exit(1)
}

try {
  const chunksDir = './.next/static/chunks'
  const files = listChunkSizes(chunksDir)
  const top = files.slice(0, 10)
  console.log('Top JS chunks by raw size (bytes):')
  top.forEach((f) => console.log(`${f.size}\t${f.file}`))

  const mainApprox = files
    .filter((f) => /main|app-|framework|react|node_modules/.test(f.file))
    .reduce((acc, f) => acc + f.size, 0)

  if (mainApprox > budgets.main) {
    fail(`Main route budget exceeded: ${mainApprox} > ${budgets.main}`)
  }

  console.log('Bundle budgets OK')
} catch (e) {
  console.error('Bundle budget check failed:', e?.message || e)
  process.exit(1)
}


