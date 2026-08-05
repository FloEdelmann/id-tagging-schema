#!/usr/bin/env zx

// NOTE: uses https://github.com/google/zx and has to be called from id-tagging-schema root directory

const presetRootDirectory = path.join(import.meta.dirname, '../data/presets')
const presetJsonFiles = await glob('./data/presets/**/*.json', {
    gitignore: true,
    absolute: true,
})

function getRelativePath(file) {
    return path.relative(presetRootDirectory, file)
}

function getPresetId(file) {
    const relativePath = getRelativePath(file)
    const directory = path.dirname(relativePath)
    const basename = path.basename(relativePath, '.json').replace(/^_/, '')
    return directory === '.' ? basename : `${directory}/${basename}`
}

function getParentPresetFile(file) {
    let directory = path.dirname(file)

    if (directory === presetRootDirectory) {
        return undefined
    }

    const parentFile = `${directory}.json`
    if (fs.existsSync(parentFile)) {
        return parentFile
    }

    const basename = path.basename(directory)
    directory = path.dirname(directory)

    const unsearchableParentFile = `${directory}/_${basename}.json`
    if (fs.existsSync(unsearchableParentFile)) {
        return unsearchableParentFile
    }

    return undefined
}

function insertBefore(array, value, searchValue) {
    const index = array.indexOf(searchValue)
    if (index === -1) {
        return false
    }

    array.splice(index, 0, value)
    return true
}
function insertAfter(array, value, searchValue) {
    const index = array.indexOf(searchValue)
    if (index === -1) {
        return false
    }

    array.splice(index + 1, 0, value)
    return true
}

const markdownLines = []

for (const file of presetJsonFiles) {
    const parentPresetFile = getParentPresetFile(file)
    if (!parentPresetFile) {
        continue
    }

    const parentPresetId = getPresetId(parentPresetFile)

    const preset = JSON.parse(fs.readFileSync(file, 'utf-8'))
    const parentPreset = JSON.parse(fs.readFileSync(parentPresetFile, 'utf-8'))

    const implicitlyInherited = []
    const presetKeys = Object.keys(preset)

    if (!preset.fields && parentPreset.fields) {
        preset.fields = [`{${parentPresetId}}`]
        implicitlyInherited.push('`fields`')

        insertBefore(presetKeys, 'fields', 'moreFields') ||
            insertBefore(presetKeys, 'fields', 'tags') ||
            presetKeys.push('fields')
    }

    if (!preset.moreFields && parentPreset.moreFields) {
        preset.moreFields = [`{${parentPresetId}}`]
        implicitlyInherited.push('`moreFields`')

        insertAfter(presetKeys, 'moreFields', 'fields') ||
            insertBefore(presetKeys, 'moreFields', 'tags') ||
            presetKeys.push('moreFields')
    }

    if (implicitlyInherited.length === 0) {
        continue
    }

    const sortedPreset = Object.fromEntries(
        presetKeys.map(key => [key, preset[key]])
    )

    fs.writeFileSync(file, JSON.stringify(sortedPreset, null, 4) + '\n', 'utf8')
    markdownLines.push([
        `- \`${getRelativePath(file)}\``,
        'implicitly inherits',
        implicitlyInherited.join(' and '),
        'from',
        `\`${getRelativePath(parentPresetFile)}\``,
        `(better explicitly reference \`{${parentPresetId}}\`)`
    ].join(' '))
}

markdownLines.sort()
console.log(markdownLines.join('\n'))
