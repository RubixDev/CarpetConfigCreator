const excludedCategories = ['rug', 'extras']

const modInfo = {
    carpet: {
        url: 'https://raw.githubusercontent.com/wiki/gnembon/fabric-carpet/Current-Available-Settings.md',
        splitString: '##',
        name: 'Carpet'
    },
    carpetExtra: {
        url: 'https://raw.githubusercontent.com/gnembon/carpet-extra/1.17/README.md',
        splitString: '##',
        name: 'Carpet Extra'
    },
    rug: {
        url: 'https://raw.githubusercontent.com/RubixDev/fabric-rug/1.17/README.md',
        splitString: '###',
        name: 'Rug'
    }
}

let defaultValues = {}

let data = {}

window.onload = async function () {
    await fetchRules()

    updateModRadios()
    updateCategoryRadios()
    updateRuleList()
}

async function fetchRules() {
    for (const [modId, mod] of modInfo.entries()) {
        data[modId] = new Mod(modId, mod.name, {})
        await fetch(mod.url)
            .then(r => r.text())
            .then(r => {
                for (const rule of r.split(mod.splitString + ' ').slice(1)) {
                    const parsedRule = Rule.fromMarkdown(rule)
                    data[modId].rules[parsedRule.name] = parsedRule
                }
            })
        data[modId].rules = data[modId].rules.sorted()
    }
    print('Parsed data', data)
    for (const mod of data.values()) {
        for (const rule of mod.rules.values()) {
            defaultValues[rule.name] = rule.value
        }
    }
    defaultValues = defaultValues.sorted()
    print('Parsed default values', defaultValues)
}

function updateModRadios() {
    const modButtonDiv = document.getElementById('radioButtons').firstElementChild

    for (let modIndex = 0; modIndex < data.keys().length; modIndex++) {
        const mod = data[data.keys()[modIndex]]

        const input = document.createElement('input')
        input.type = 'radio'
        input.id = mod.id
        input.name = 'mod'
        if (modIndex === 0) input.checked = true
        modButtonDiv.appendChild(input)

        const label = document.createElement('label')
        label.htmlFor = mod.id
        label.innerText = mod.name
        modButtonDiv.appendChild(label)
    }
    addRadioChangeListener(document.getElementsByName('mod'), updateCategoryRadios)
}

function updateCategoryRadios() {
    const categoryButtonDiv = document.getElementById('radioButtons').lastElementChild
    categoryButtonDiv.innerHTML = ''

    const modCategories = getSelectedMod().getCategories()

    const allCategoriesInput = document.createElement('input')
    allCategoriesInput.type = 'radio'
    allCategoriesInput.id = 'all'
    allCategoriesInput.name = 'category'
    allCategoriesInput.checked = true
    categoryButtonDiv.appendChild(allCategoriesInput)

    const allCategoriesLabel = document.createElement('label')
    allCategoriesLabel.htmlFor = 'all'
    allCategoriesLabel.innerText = 'All'
    categoryButtonDiv.appendChild(allCategoriesLabel)

    for (let categoryIndex = 0; categoryIndex < modCategories.length; categoryIndex++) {
        const category = modCategories[categoryIndex]

        const input = document.createElement('input')
        input.type = 'radio'
        input.id = category.toLowerCase()
        input.name = 'category'
        categoryButtonDiv.appendChild(input)

        const label = document.createElement('label')
        label.htmlFor = category.toLowerCase()
        label.innerText = category
        categoryButtonDiv.appendChild(label)
    }
    addRadioChangeListener(document.getElementsByName('category'), updateRuleList)
    updateRuleList()
}

function updateRuleList() {
    const ruleList = document.getElementById('ruleList')
    ruleList.innerHTML = ''
    resetAllInputs()
    const selectedCategory = getSelectedCategory()

    for (const rule of getSelectedMod().rules.values()) {
        if (selectedCategory !== 'all' && !rule.categories.includes(selectedCategory)) continue

        const ruleListItem = document.createElement('li')

        const ruleNameText = document.createElement('code')
        ruleNameText.innerText = rule.name
        ruleNameText.setAttribute('tooltip', rule.description + (rule.extraDescription === null ? '' : `\n\n${rule.extraDescription}`))
        ruleNameText.setAttribute('tooltip-location', 'right')
        ruleListItem.appendChild(ruleNameText)

        const ruleDefaultValueButton = document.createElement('button')
        if (rule.isDefaultValue()) {
            ruleDefaultValueButton.disabled = true
        }
        ruleDefaultValueButton.id = rule.name + '__reset'
        ruleDefaultValueButton.innerText = rule.getDefaultValue()
        ruleDefaultValueButton.addEventListener('click', function () {
            rule.input.reset()
            ruleDefaultValueButton.disabled = true
        })
        ruleListItem.appendChild(ruleDefaultValueButton)

        const ruleValueInput = createRuleInputElement(rule)
        ruleListItem.appendChild(ruleValueInput)

        ruleList.appendChild(ruleListItem)
    }
}

function createRuleInputElement(rule) {
    if (!['int', 'double', 'string', 'boolean'].includes(rule.type)) {
        const input = document.createElement('span')
        input.innerText = 'Unknown value type'
        print('Unknown value type', rule)
        return input
    }

    if (rule.options.length === 0) {
        rule.input = new StrictNoOptionsInput(rule.name, rule.type, rule.getDefaultValue())
        return rule.input.htmlElement()
    } else if (rule.isStrict) {
        if (rule.type === 'boolean') {
            rule.input = new StrictBooleanInput(rule.name, rule.getDefaultValue())
            return rule.input.htmlElement()
        } else {
            rule.input = new StrictNonBooleanInput(rule.name, rule.options, rule.getDefaultValue())
            return rule.input.htmlElement()
        }
    } else {
        rule.input = new NonStrictInput(rule.name, rule.type, rule.options, rule.getDefaultValue())
        return rule.input.htmlElement()
    }
}

function exportConfigFile() {
    const out = []

    for (const mod of data.values()) {
        for (const rule of mod.rules.values()) {
            if (rule.isDefaultValue() || rule.value === '') continue
            out.push(`${rule.name} ${rule.value}`)
        }
    }

    if (out.length === 0) {
        alertPrint('No changes made, so config file would be empty!')
        return
    }

    print('Exporting config file:\n\t' + out.sort().join('\n\t'))
    downloadTextFile('carpet.conf', out.join('\n'))
}
