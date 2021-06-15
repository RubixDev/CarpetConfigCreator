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
    print(data)
    for (const mod of data.values()) {
        for (const rule of mod.rules.values()) {
            defaultValues[rule.name] = rule.value
        }
    }
    defaultValues = defaultValues.sorted()
    print(defaultValues)

    // Create radio buttons for the mods
    const radioButtons = document.getElementById('radioButtons')
    const modButtonDiv = radioButtons.firstElementChild

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
}

class Mod {
    constructor(id, name, rules) {
        this.id = id
        this.name = name
        this.rules = rules
    }

    getCategories() {
        let categories = []
        for (const rule of this.rules.values()) {
            for (const category of rule.categories) {
                if (!categories.includes(category)) {
                    categories.push(category)
                }
            }
        }
        return categories.sort()
    }
}

class Rule {
    constructor(type, name, value, options, isStrict, categories) {
        this.type = type
        this.name = name
        this.value = value
        this.options = options
        this.isStrict = isStrict
        this.categories = categories
    }

    static fromMarkdown(markdown) {
        let type = markdown
            .split('Type: ')
            .last()
            .split('\n')[0]
            .replaceAll('`', '')
            .replaceAll(' ', '')
        let name = markdown
            .split('\n')[0]
        let value = markdown
            .split('Default value: ')
            .last()
            .split('\n')[0]
            .replaceAll('`', '')
            .replaceAll(' ', '')
        let options = markdown
            .split('options: ')
            .last()
            .split('\n')[0]
            .replaceAll('`', '')
            .replaceAll(' ', '')
            .split(',')
        let strict = markdown
            .split(' options')[0]
            .split(' ')
            .last()
            .toLowerCase() === 'required'
        let categories = markdown
            .split('Categories: ')
            .last()
            .split('\n')[0]
            .replaceAll('`', '')
            .replaceAll(' ', '')
            .toLowerCase()
            .split(',')
            .filter(category => !excludedCategories.includes(category))  // Filter out categories of whole mods
            .map(category => category.charAt(0).toUpperCase() + category.slice(1))  // Capitalize every first letter

        return new Rule(type, name, value, options, strict, categories)
    }
}

function getSelectedMod() {
    for (const modId of data.keys()) {
        if (document.getElementById(modId).checked) return data[modId]
    }
    return false
}

function addRadioChangeListener(radioButtons, func) {
    for (const radioButton of radioButtons) {
        radioButton.addEventListener('click', function () {
            func()
        })
    }
}


// Helper functions
function print(...data) {
    console.log(...data)
}

Object.prototype.entries = function () {
    return Object.entries(this)
}

Object.prototype.values = function () {
    return Object.values(this)
}

Object.prototype.keys = function () {
    return Object.keys(this)
}

Object.prototype.sorted = function () {
    return this.keys().sort().reduce((obj, key) => {
            obj[key] = this[key]
            return obj
        }, {})
}

Array.prototype.last = function () {
    return this[this.length - 1]
}
