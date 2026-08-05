#!/usr/bin/env zx

// NOTE: uses https://github.com/google/zx and has to be called from id-tagging-schema root directory

const presetJsonFiles = await glob('./data/presets/**/*.json', {
    gitignore: true,
    absolute: true,
})

/** @param {string} name */
function getPaddedSlashesString(name) {
    if (name.startsWith('{') && name.endsWith('}')) {
        return name
    }

    return name.replace(/\s*\/\s*/g, ' / ')
}

for (const file of presetJsonFiles) {
    const preset = JSON.parse(fs.readFileSync(file, 'utf-8'))

    const expectedName = getPaddedSlashesString(preset.name)
    const expectedAliases = preset.aliases?.map(getPaddedSlashesString)

    if (
        expectedName === preset.name &&
        (!preset.aliases ||
            preset.aliases.every((alias, index) => expectedAliases[index] === alias)
        )
    ) {
        continue
    }

    console.log(file)

    preset.name = expectedName
    preset.aliases = expectedAliases
    fs.writeFileSync(file, JSON.stringify(preset, null, 4) + '\n', 'utf8')
}
