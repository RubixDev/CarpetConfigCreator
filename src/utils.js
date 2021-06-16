// Prototypes
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

// General
function print(...data) {
    console.log(...data)
}

function addRadioChangeListener(radioButtons, func) {
    for (const radioButton of radioButtons) {
        radioButton.addEventListener('click', function () {
            func()
        })
    }
}

function downloadTextFile(filename, content) {
    const temp = document.createElement('a')
    temp.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
    temp.download = filename
    temp.style.display = 'none'
    document.body.appendChild(temp)
    temp.click()
    document.body.removeChild(temp)
}

// Website specific
function getSelectedMod() {
    for (const modId of data.keys()) {
        if (document.getElementById(modId).checked) return data[modId]
    }
    return null
}

function getSelectedCategory() {
    for (const category of getSelectedMod().getCategories()) {
        if (document.getElementById(category.toLowerCase()).checked) return category
    }
    if (document.getElementById('all').checked) return 'all'
    return null
}

function setRuleValue(ruleName, value) {
    if (value === '') return
    data[getSelectedMod().id].rules[ruleName].value = value
    print(`Set value of rule ${ruleName} to ${value}`)
}
