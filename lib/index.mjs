import debug from 'debug'
import glob from 'tiny-glob'

const log = debug('glob-opts')

const placeholder = /\[[^.\]]+\]/g

function parseInput(input) {
  const names = []
  const pattern = input.replace(placeholder, name => {
    names.push(name)
    return '*'
  })
  const regexp = new RegExp(
    `^${input.replace(placeholder, '([^/]+)').replace(/\./g, '\\.')}$`
  )
  return { pattern, regexp, names }
}

function getValues(regexp, file) {
  log('matching "%s" with %s', file, regexp)
  const match = regexp.exec(file)
  return match && match.slice(1)
}

function formatOutput(regexp, names, file, output) {
  const values = getValues(regexp, file)
  return output.replace(placeholder, name => {
    const index = names.indexOf(name)
    if (index < 0) throw new Error(`unrecognised placeholder "${name}" in "${output}"`)
    return values[index]
  })
}

const cache = {}

async function getFiles(pattern) {
  let files = cache[pattern]
  if (!files) files = cache[pattern] = await glob(pattern)
  return files
}

function filterFiles(files, regexp, names) {
  return files.filter(file => {
    const values = getValues(regexp, file)
    /* c8 ignore next 4 */
    if (names.length !== values.length) {
      log('dropping "%s", %d placeholders for %d values', file, names.length, values.length)
      return
    }
    const map = {}
    for (let i = 0, l = names.length; i < l; ++i) {
      const name = names[i]
      const value = values[i]
      const old = map[name]
      if (old) {
        if (old !== value) {
          log('dropping "%s", inconsistent "%s": "%s" != "%s"', file, name, old, value)
          return
        }
        return true
      }
      map[name] = value
    }
    return true
  })
}

function expandOpts(rule, files, regexp, names) {
  return files.map(file => {
    const clone = { ...rule }
    const { output } = clone
    clone.input = file
    clone.output = output.length !== undefined
      ? output.map(target => updateTarget({ ...target }, file))
      : updateTarget({ ...output }, file)
    return clone
  })

  function updateTarget(target, source) {
    const { file } = target
    const outfile = target.file = formatOutput(regexp, names, source, file)
    log('new output "%s" for "%s"', outfile, file)
    return target
  }
}

export default async function globOpts(rule) {
  const { input } = rule
  log('expanding "%s"', input)
  const { pattern, regexp, names } = parseInput(input)
  if (!names.length) return rule
  let files = await getFiles(pattern)
  log('%d files found for "%s".', files.length, pattern)
  files = filterFiles(files, regexp, names)
  log('%d files matched "%s".', files.length, input)
  if (!files.length) throw new Error(`nothing matched "${input}"`)
  return expandOpts(rule, files, regexp, names)
}
