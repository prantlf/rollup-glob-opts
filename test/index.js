const test = require('tehanu')('globOpts')
const { rejects, strictEqual } = require('node:assert')
const globOpts = require('..')

test('skips an input without placeholders', async () => {
  const original = { input: 'a/b/c' }
  const expanded = await globOpts(original)
  strictEqual(original, expanded)
})

test('finds files matching a pattern', async () => {
  const original = {
    input: 'test/components/first/[name].ts',
    output: { file: 'dist/[name].js' }
  }
  const expanded = await globOpts(original)
  strictEqual(expanded.length, 2)
  strictEqual(expanded[0].input, 'test/components/first/first.test.ts')
  strictEqual(expanded[0].output.file, 'dist/first.test.js')
  strictEqual(expanded[1].input, 'test/components/first/first.ts')
  strictEqual(expanded[1].output.file, 'dist/first.js')
})

test('filters files with inconsistent placeholder values', async () => {
  const original = {
    input: 'test/components/[name]/[name].ts',
    output: [
      { file: 'dist/[name].js' },
      { file: 'dist/[name].min.js' }
    ]
  }
  const expanded = await globOpts(original)
  strictEqual(expanded.length, 2)
  strictEqual(expanded[0].input, 'test/components/first/first.ts')
  strictEqual(expanded[0].output.length, 2)
  strictEqual(expanded[0].output[0].file, 'dist/first.js')
  strictEqual(expanded[0].output[1].file, 'dist/first.min.js')
  strictEqual(expanded[1].input, 'test/components/second/second.ts')
  strictEqual(expanded[1].output.length, 2)
  strictEqual(expanded[1].output[0].file, 'dist/second.js')
  strictEqual(expanded[1].output[1].file, 'dist/second.min.js')
})

test('fails if the expanded path does not exist', async () => {
  const opt = { input: 'dummy/[name].ts' }
  rejects(async () => await globOpts(opt))
})

test('fails if the placeholders do not match any path', async () => {
  const opt = { input: 'test/[name]/[name]/[name].ts' }
  rejects(async () => await globOpts(opt))
})

test('fails with an unrecognised placeholder in the output pattern', async () => {
  const opt = {
    input: 'test/components/first/[name].ts',
    output: { file: 'dist/[dummy].js' }
  }
  rejects(async () => await globOpts(opt))
})
