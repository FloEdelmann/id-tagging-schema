#!/usr/bin/env zx

// NOTE: uses https://github.com/google/zx and has to be called from id-tagging-schema root directory

const fieldJsonFiles = await glob('./data/fields/**/*.json', {
    gitignore: true,
    absolute: false,
})

const files = {}

for (const file of fieldJsonFiles) {
    const field = JSON.parse(fs.readFileSync(file, 'utf-8'))

    field.customValues ??= true // https://github.com/ideditor/schema-builder#customvalues

    if (field.type !== 'combo' || field.customValues) {
        continue
    }

    const optionsCount = field.strings?.options
        ? Object.keys(field.strings.options).length
        : (field.options?.length ?? 0)

    if (optionsCount === 0 || optionsCount > 3) {
        continue
    }

    files[optionsCount] ??= []
    files[optionsCount].push(file)
}

console.log(files)
