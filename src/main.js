const excludedCategories = ['rug', 'extras']

const modInfo = {
    carpet: {
        url: 'https://raw.githubusercontent.com/wiki/gnembon/fabric-carpet/Current-Available-Settings.md',
        splitString: '##',
        name: 'Carpet'
    },
    carpetExtra: {
        url: 'https://raw.githubusercontent.com/gnembon/carpet-extra/master/README.md',
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
    // Parse markdown rule lists
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

    // Create radio buttons for the mods
    const modButtonDiv = document.getElementById('radioButtons').firstElementChild

    for (let modIndex = 0; modIndex < data.keys().length; modIndex++) {
        const mod = data[data.keys()[modIndex]]

        const input = document.createElement('input')
        input.type = 'radio'
        input.id = mod.id
        input.name = 'mod'
        if (modIndex === 0) input.setAttribute('checked', '')
        modButtonDiv.appendChild(input)

        const label = document.createElement('label')
        label.htmlFor = mod.id
        label.innerText = mod.name
        modButtonDiv.appendChild(label)
    }

    addRadioChangeListener(document.getElementsByName('mod'), updateCategories)

    // Create radio buttons for the categories
    updateCategories()

    // Create list with rules
    updateRuleList()
}

function updateCategories() {
    const categoryButtonDiv = document.getElementById('radioButtons').lastElementChild
    categoryButtonDiv.innerHTML = ''

    const modCategories = getSelectedMod().getCategories()

    const allCategoriesInput = document.createElement('input')
    allCategoriesInput.type = 'radio'
    allCategoriesInput.id = 'all'
    allCategoriesInput.name = 'category'
    allCategoriesInput.setAttribute('checked', '')
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
    const selectedCategory = getSelectedCategory()

    for (const rule of getSelectedMod().rules.values()) {
        if (selectedCategory !== 'all' && !rule.categories.includes(selectedCategory)) continue

        const ruleListItem = document.createElement('li')

        const ruleNameSpan = document.createElement('span')
        ruleNameSpan.innerText = rule.name
        ruleListItem.appendChild(ruleNameSpan)

        const ruleDefaultValueSpan = document.createElement('span')
        ruleDefaultValueSpan.innerText = 'Default value: ' + rule.value
        ruleListItem.appendChild(ruleDefaultValueSpan)

        const ruleValueInput = createRuleInputElement(rule)
        ruleListItem.appendChild(ruleValueInput)

        ruleList.appendChild(ruleListItem)
    }
}

function createRuleInputElement(rule) {
    let input

    if (rule.isStrict) {
        switch (rule.type) {
            case 'boolean':
                input = document.createElement('input')
                input.type = 'checkbox'
                //input.id = rule.name + '__input'
                if (rule.value === 'true') input.setAttribute('checked', '')
                break
            case 'int':
            case 'double':
            case 'string':
                input = document.createElement('select')
                for (const option of rule.options) {
                    const optionElement = document.createElement('option')
                    optionElement.innerText = option
                    if (rule.value === option.toLowerCase()) optionElement.setAttribute('selected', '')
                    input.appendChild(optionElement)
                }
                break
            default:
                input = document.createElement('span')
                input.innerText = 'Unknown value type'
                print('Unknown value type', rule)
        }
    } else {
        const dataListsDiv = document.getElementById('dataLists')

        switch (rule.type) {
            case 'string':
                input = document.createElement('span')

                const inputSelect = document.createElement('select')
                inputSelect.innerHTML += '<option value="custom">[type a custom value]</option>'
                for (const option of rule.options) {
                    const optionElement = document.createElement('option')
                    optionElement.innerText = option
                    if (rule.value === option.toLowerCase()) optionElement.setAttribute('selected', '')
                    inputSelect.appendChild(optionElement)
                }
                input.appendChild(inputSelect)

                const inputText = document.createElement('input')
                inputText.type = 'text'
                inputText.style.display = 'none'
                inputText.setAttribute('disabled', '')
                inputText.addEventListener('click', function () {
                    if (inputText.value === '') toggleField(inputText, inputText.previousSibling)
                })
                inputText.addEventListener('blur', function () {
                    if (inputText.value === '') toggleField(inputText, inputText.previousSibling)
                })
                input.appendChild(inputText)

                inputSelect.addEventListener('change', function () {
                    if (inputSelect.options[inputSelect.selectedIndex].value === 'custom') {
                        toggleField(inputSelect, inputSelect.nextSibling)
                    }
                })
                break
            default:
                input = document.createElement('span')
                input.innerText = 'Unknown value type'
        }
    }

    return input
}
