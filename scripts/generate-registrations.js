// scripts/generate-registrations.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const BundleName = 'IAM'

// Emulate __dirname in ESM:
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const root = path.resolve(__dirname, '../src')

// Build import lines & registrations
let out = []
let symbols = {
  'services': [],
  'components': [],
  'pages': [],
  'layouts': []
};

// helper to walk directories
function walk(dir, ext, files = []) {
  // 1) bail out if dir doesn't exist or isn't a directory
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return files
  }

  // 2) safe to read
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) {
      walk(full, ext, files)
    }
    else if (full.endsWith(ext)) {
      files.push(full)
    }
  }
  return files
}

/**
 * Converts a snake_case string to PascalCase.
 * @param {string} str - The snake_case input.
 * @returns {string} The PascalCase output.
 */
function snakeCaseToPascalCase(str) {
  return str
    .split('_')                               // [ 'hello', 'world' ]
    .map(s =>
      s.charAt(0).toUpperCase() +              // 'H'
      s.slice(1)                               // 'ello'
    )                                          // [ 'Hello', 'World' ]
    .join('');                                 // 'HelloWorld'
}

function importSymbols(files, type) {
  out.push(`\n// => importing ${type}:`)
  files.forEach(file => {
    const rel = './' + path.relative(root, file).replace(/\\/g, '/')
    const dir = path.basename(path.dirname(file))
    const basename = path.basename(file, path.extname(file))
    const prefix = dir != type && dir != basename ? `${dir}_` : ''
    const name = snakeCaseToPascalCase(`${type}_${prefix}${basename}`.replaceAll('-', '_'))
    out.push(`import ${name} from '${rel}'`)
    symbols[type].push(name)
  })
}

// 1) Services
const svcs = walk(path.join(root, 'services'), '.js')
// 2) Components
const comps = walk(path.join(root, 'components'), '.vue')
// 3) Pages
const pages = walk(path.join(root, 'pages'), '.vue')
// 4) Layouts
const layouts = walk(path.join(root, 'layouts'), '.vue')

out.push(`// AUTO GENERATED - do not edit by hand\n`)

if (fs.existsSync(path.join(root, 'ENDPOINTS.js'))) {
  out.push('// => importing ENDPOINTS:')
  out.push(`import ${BundleName}_ENDPOINTS from './ENDPOINTS.js'\n`)
}

if (svcs.length > 0) {
  importSymbols(svcs, 'services')
}

if (comps.length > 0) {
  importSymbols(comps, 'components')
}

if (pages.length > 0) {
  importSymbols(pages, 'pages')
}

if (layouts.length > 0) {
  importSymbols(layouts, 'layouts')
}

out.push('\nexport function registerEndpoints(app) {')
out.push(`  if(!!${BundleName}_ENDPOINTS) {`)
out.push(`    app.config.globalProperties.$${BundleName.toLowerCase()}.ENDPOINTS = ${BundleName}_ENDPOINTS`)
out.push('  }')
out.push('}\n')

// Services
out.push('export function registerServices(app) {')
symbols.services.forEach(symbol => {
  const name = symbol.replace(/Services/, '')
  out.push(`  app.config.globalProperties.$${BundleName.toLowerCase()}.services['${name}'] = ${symbol}`)
})
out.push('  return;\n')
out.push('}\n')

// Components
out.push('export function registerComponents(app) {')
symbols.components.forEach(symbol => {
  const name = symbol.replace(/Components/, '')
  out.push(`  app.component('${name}', ${symbol})`)
})
out.push('  return;\n')
out.push('}\n')

// Pages
out.push('export const pages = {}')
symbols.pages.forEach(symbol => {
  const name = symbol.replace(/Pages/, '')
  out.push(`pages['${name}'] = ${symbol}`)
})

// Layouts
out.push('export const layouts = {}')
symbols.layouts.forEach(symbol => {
  const name = symbol.replace(/Layouts/, '')
  out.push(`layouts['${name}'] = ${symbol}`)
})

// Write the file
fs.writeFileSync(
  path.join(root, 'registrations.js'),
  out.join('\n'),
  'utf-8'
)

console.log('registrations.js generated.')
