import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const projectRoot = process.cwd()
const checkOnly = process.argv.includes('--check')

const pagesPath = path.join(projectRoot, 'pages.json')
const srcPagesPath = path.join(projectRoot, 'src/pages.json')
const manifestPath = path.join(projectRoot, 'manifest.json')
const srcManifestPath = path.join(projectRoot, 'src/manifest.json')
const homePagePath = 'pages/index/index'

const normalizeText = text => text.replace(/\r\n/g, '\n')
const formatJson = value => `${JSON.stringify(value, null, 2)}\n`

const readJson = async filePath => JSON.parse(await readFile(filePath, 'utf8'))

const buildSrcPagesConfig = rootPagesConfig => {
  return {
    globalStyle: rootPagesConfig.globalStyle ?? {},
    easycom: rootPagesConfig.easycom ?? {},
    pages: (rootPagesConfig.pages ?? []).map((page, index) => ({
      path: page.path,
      type: page.path === homePagePath || index === 0 ? 'home' : 'page'
    })),
    subPackages: rootPagesConfig.subPackages ?? []
  }
}

const syncPagesConfig = async () => {
  const rootPagesConfig = await readJson(pagesPath)
  const currentSrcPagesConfig = await readJson(srcPagesPath)
  const expectedSrcPagesConfig = buildSrcPagesConfig(rootPagesConfig)
  const currentText = formatJson(currentSrcPagesConfig)
  const expectedText = formatJson(expectedSrcPagesConfig)

  if (currentText === expectedText) {
    return false
  }

  if (!checkOnly) {
    await writeFile(srcPagesPath, expectedText, 'utf8')
  }

  return true
}

const syncManifestConfig = async () => {
  const manifestText = normalizeText(await readFile(manifestPath, 'utf8'))
  const currentSrcManifestText = normalizeText(await readFile(srcManifestPath, 'utf8'))

  if (manifestText === currentSrcManifestText) {
    return false
  }

  if (!checkOnly) {
    await writeFile(srcManifestPath, manifestText, 'utf8')
  }

  return true
}

const pagesChanged = await syncPagesConfig()
const manifestChanged = await syncManifestConfig()
const changedFiles = [
  pagesChanged ? 'src/pages.json' : null,
  manifestChanged ? 'src/manifest.json' : null
].filter(Boolean)

if (checkOnly) {
  if (changedFiles.length > 0) {
    console.error(`Config drift detected: ${changedFiles.join(', ')}`)
    process.exitCode = 1
  } else {
    console.log('Config files are in sync.')
  }
} else if (changedFiles.length > 0) {
  console.log(`Synchronized ${changedFiles.join(', ')}`)
} else {
  console.log('Config files are already in sync.')
}
