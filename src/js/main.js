const excludedCategories = ['rug', 'extras', 'tis']

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
    },
    tis: {
        url: 'https://raw.githubusercontent.com/TISUnion/Carpet-TIS-Addition/master/README.md',
        splitString: '##',
        name: 'TIS Addition',
        startSplit: '# Rule List',
        endSplit: '---------'
    }
}

let defaultValues = {}

let data = {}

window.onload = async function () {
    await fetchRules()

    updateModRadios()
    updateCategorySelect()
    updateruleTable()

    document.getElementById('selections').lastElementChild.addEventListener('change', updateruleTable)

    addTooltipHoverListeners()
}

async function fetchRules() {
    for (const [modId, mod] of modInfo.entries()) {
        data[modId] = new Mod(modId, mod.name, {})
        await fetch(mod.url)
            .then(r => r.text())
            .then(r => {
                if (mod.startSplit) r = r.split(mod.startSplit).last()
                if (mod.endSplit) r = r.split(mod.endSplit)[0]
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
    const modButtonDiv = document.getElementById('selections').firstElementChild

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
    addRadioChangeListener(document.getElementsByName('mod'), updateCategorySelect)
}

function updateCategorySelect() {
    const categorySelect = document.getElementById('selections').lastElementChild
    categorySelect.innerHTML = ''

    const modCategories = getSelectedMod().getCategories()

    const allCategoriesOption = document.createElement('option')
    allCategoriesOption.selected = true
    allCategoriesOption.innerText = 'All'
    categorySelect.appendChild(allCategoriesOption)

    for (const category of modCategories) {
        const categoryOption = document.createElement('option')
        categoryOption.innerText = category
        categorySelect.appendChild(categoryOption)
    }
    updateruleTable()
}

function updateruleTable() {
    const ruleTable = document.getElementById('ruleTable')
    ruleTable.innerHTML = '<tr><th>Rule Name</th><th>Default value</th><th>Input</th></tr>'
    resetAllInputs()
    const selectedCategory = getSelectedCategory()

    for (const rule of getSelectedMod().rules.values()) {
        if (selectedCategory !== 'All' && !rule.categories.includes(selectedCategory)) continue

        const ruleTableRow = document.createElement('tr')

        const ruleNameTableData = document.createElement('td')
        const ruleNameText = document.createElement('code')
        ruleNameText.innerText = rule.name
        ruleNameText.setAttribute('tooltip', rule.description + (rule.extraDescription === null ? '' : `\n\n${rule.extraDescription}`))
        ruleNameText.setAttribute('tooltip-location', 'right')
        ruleNameText.addEventListener('mouseover', function () {
            ruleNameText.style.zIndex = 100
        })
        ruleNameText.addEventListener('mouseout', function () {
            ruleNameText.style.zIndex = 10
        })
        ruleNameTableData.appendChild(ruleNameText)
        ruleTableRow.appendChild(ruleNameTableData)

        const ruleDefaultValueTableData = document.createElement('td')
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
        ruleDefaultValueTableData.appendChild(ruleDefaultValueButton)
        ruleTableRow.appendChild(ruleDefaultValueTableData)

        const ruleInputTableData = document.createElement('td')
        ruleInputTableData.appendChild(createRuleInputElement(rule))
        ruleTableRow.appendChild(ruleInputTableData)

        ruleTable.appendChild(ruleTableRow)
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

function addTooltipHoverListeners() {
    for (const tooltipElement of document.getElementsByAttribute('tooltip')) {
        tooltipElement.addEventListener('mouseover', function () {
            tooltipElement.style.zIndex = 100
        })
        tooltipElement.addEventListener('mouseout', function () {
            tooltipElement.style.zIndex = 10
        })
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
