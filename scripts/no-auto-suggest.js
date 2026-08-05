#!/usr/bin/env zx

// NOTE: uses https://github.com/google/zx and has to be called from id-tagging-schema root directory

const fieldJsonFiles = await glob('./data/fields/**/*.json', {
    gitignore: true,
    absolute: true,
})

const autoSuggestFieldTypes = new Set(['combo', 'multiCombo', 'networkCombo', 'semiCombo', 'typeCombo'])

for (const file of fieldJsonFiles) {
    const field = JSON.parse(fs.readFileSync(file, 'utf-8'))

    if (field.autoSuggestions === false || !autoSuggestFieldTypes.has(field.type)) {
        continue
    }

    console.log(file)
}
