const urls = {
    carpet: {
        url: 'https://raw.githubusercontent.com/wiki/gnembon/fabric-carpet/Current-Available-Settings.md',
        splitString: '##'
    },
    carpetExtra: {
        url: 'https://raw.githubusercontent.com/gnembon/carpet-extra/master/README.md',
        splitString: '##'
    },
    rug: {
        url: 'https://raw.githubusercontent.com/RubixDev/fabric-rug/1.17/README.md',
        splitString: '###'
    }
}

let defaultValues = {}

let rules = {
    carpet: {},
    carpetExtra: {},
    rug: {}
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
            .filter(category => !['rug', 'extras'].includes(category))  // Filter out whole mod categories
            .map(category => category.charAt(0).toUpperCase() + category.slice(1))  // Capitalize every first letter

        return new Rule(type, name, value, options, strict, categories)
    }
}

window.onload = async function () {
    for (const [modname, mod] of urls.entries()) {
        await fetch(mod.url)
            .then(r => r.text())
            .then(r => {
                for (const rule of r.split(mod.splitString + ' ').slice(1)) {
                    const parsedRule = Rule.fromMarkdown(rule)
                    rules[modname][parsedRule.name] = parsedRule
                }
            })
    }
    console.log(rules)
    for (const mod of rules.values()) {
        for (const rule of mod.values()) {
            defaultValues[rule.name] = rule.value
        }
    }
    console.log(defaultValues)
}


// Prototypes
Object.prototype.entries = function () {
    return Object.entries(this)
}

Object.prototype.values = function () {
    return Object.values(this)
}

Array.prototype.last = function () {
    return this[this.length - 1]
}
