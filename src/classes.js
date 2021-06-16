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