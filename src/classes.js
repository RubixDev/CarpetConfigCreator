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
    constructor(type, name, value, options, isStrict, categories, input = undefined) {
        this.type = type
        this.name = name
        this.value = value
        this.options = options
        this.isStrict = isStrict
        this.categories = categories
        this.input = input
    }

    getDefaultValue() {
        return defaultValues[this.name]
    }

    isDefaultValue() {
        return new RegExp(`^${this.value}([.,]0+)?$`).test(this.getDefaultValue())
    }

    static fromMarkdown(markdown) {
        let type = markdown
            .split('Type: ')
            .last()
            .split('\n')[0]
            .replaceAll('`', '')
            .replaceAll(' ', '')
            .toLowerCase()
        let name = markdown
            .split('\n')[0]
        let value = markdown
            .split('Default value: ')
            .last()
            .split('\n')[0]
            .replaceAll('`', '')
            .replaceAll(' ', '')
            .toLowerCase()
        let options = markdown
            .split('options: ')
            .last()
            .split('\n')[0]
            .replaceAll('`', '')
            .split(', ')
            .map(option => option.replaceAll(' ', ''))
            .filter(option => option.length > 0)
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

class StrictBooleanInput {
    constructor(ruleName, defaultValue) {
        this.ruleName = ruleName
        this.defaultValue = defaultValue
    }

    reset() {
        const inputElement = document.getElementById(this.ruleName + '__input')
        inputElement.checked = this.defaultValue === 'true'
        resetRuleValue(this.ruleName)
    }

    htmlElement() {
        const ruleName = this.ruleName

        const inputElement = document.createElement('input')
        inputElement.type = 'checkbox'
        inputElement.id = ruleName + '__input'
        if (getRuleValue(ruleName) === 'true') inputElement.checked = true
        inputElement.addEventListener('change', function () {
            setRuleValue(ruleName, inputElement.checked.toString())
            updateResetButton(ruleName)
        })
        return inputElement
    }
}

class StrictNonBooleanInput {
    constructor(ruleName, ruleOptions, defaultValue) {
        this.ruleName = ruleName
        this.ruleOptions = ruleOptions
        this.defaultValue = defaultValue
    }

    reset() {
        const inputElement = document.getElementById(this.ruleName + '__input')
        for (const option of inputElement.children) {
            option.selected = this.defaultValue === option.innerText.toLowerCase()
        }
        resetRuleValue(this.ruleName)
    }

    htmlElement() {
        const ruleName = this.ruleName

        const inputElement = document.createElement('select')
        inputElement.id = ruleName + '__input'
        for (const option of this.ruleOptions) {
            const optionElement = document.createElement('option')
            optionElement.innerText = option
            if (getRuleValue(ruleName) === option.toLowerCase()) optionElement.selected = true
            inputElement.appendChild(optionElement)
        }
        inputElement.addEventListener('change', function () {
            setRuleValue(ruleName, inputElement.value)
            updateResetButton(ruleName)
        })
        return inputElement
    }
}

class StrictNoOptionsInput {
    constructor(ruleName, ruleType, defaultValue) {
        this.ruleName = ruleName
        this.ruleType = ruleType
        this.defaultValue = defaultValue
    }

    reset() {
        const inputElement = document.getElementById(this.ruleName + '__input')
        inputElement.value = this.defaultValue
        resetRuleValue(this.ruleName)
    }

    htmlElement() {
        const ruleName = this.ruleName

        const inputElement = document.createElement('input')
        inputElement.id = ruleName + '__input'
        if (this.ruleType === 'string') {
            inputElement.type = 'text'
        } else {
            inputElement.type = 'number'
            if (this.ruleType === 'double') {
                inputElement.step = '0.1'
            }
        }
        inputElement.value = getRuleValue(ruleName)
        inputElement.addEventListener('input', function () {
            setRuleValue(ruleName, inputElement.value)
            updateResetButton(ruleName)
        })

        return inputElement
    }
}

class NonStrictInput {
    constructor(ruleName, ruleType, ruleOptions, defaultValue) {
        this.ruleName = ruleName
        this.ruleType = ruleType
        this.ruleOptions = ruleOptions
        this.defaultValue = defaultValue
    }

    reset() {
        const inputElement = document.getElementById(this.ruleName + '__input')
        for (const option of inputElement.firstElementChild.children) {
            option.selected = testRuleDefaultValue(option.innerText.toLowerCase(), this.defaultValue)
        }
        inputElement.lastElementChild.disabled = true
        resetRuleValue(this.ruleName)
    }

    htmlElement() {
        const ruleName = this.ruleName

        const inputElement = document.createElement('span')
        inputElement.id = ruleName + '__input'

        const inputSelect = document.createElement('select')
        inputSelect.innerHTML += '<option value="custom">[type a custom value]</option>'
        const customOption = document.createElement('option')
        customOption.value = 'custom'
        customOption.innerText = '[type a custom value]'
        for (const option of this.ruleOptions) {
            const optionElement = document.createElement('option')
            optionElement.innerText = option
            if (testRuleDefaultValue(option.toLowerCase(), getRuleValue(ruleName))) optionElement.selected = true
            inputSelect.appendChild(optionElement)
        }
        inputElement.appendChild(inputSelect)

        const inputText = document.createElement('input')
        if (this.ruleType === 'string') {
            inputText.type = 'text'
        } else {
            inputText.type = 'number'
            if (this.ruleType === 'double') {
                inputText.step = '0.1'
            }
        }
        if (!this.ruleOptions.includesValue(getRuleValue(ruleName))) {
            customOption.selected = true
            inputText.value = getRuleValue(ruleName)
        } else {
            inputText.disabled = true
        }
        inputElement.appendChild(inputText)

        inputSelect.addEventListener('change', function () {
            inputText.disabled = inputSelect.value !== 'custom'
            if (inputSelect.value === 'custom') {
                setRuleValue(ruleName, inputText.value)
            } else {
                setRuleValue(ruleName, inputSelect.value)
            }
            updateResetButton(ruleName)
        })
        inputText.addEventListener('input', function () {
            setRuleValue(ruleName, inputText.value)
            updateResetButton(ruleName)
        })

        return inputElement
    }
}
