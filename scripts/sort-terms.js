#!/usr/bin/env zx

// NOTE: uses https://github.com/google/zx and has to be called from id-tagging-schema root directory

const presetJsonFiles = await glob('./data/presets/**/*.json', {
    gitignore: true,
    absolute: true,
})

for (const file of presetJsonFiles) {
    const preset = JSON.parse(fs.readFileSync(file, 'utf-8'))
    const terms = preset.terms

    if (!terms) {
        continue
    }

    const expectedTerms = terms.map(term => term.toLowerCase()).sort()
    if (terms.every((term, index) => expectedTerms[index] === term)) {
        continue
    }

    console.log(file)
    console.log(terms, expectedTerms)

    preset.terms = expectedTerms
    fs.writeFileSync(file, JSON.stringify(preset, null, 4) + '\n', 'utf8')
}
