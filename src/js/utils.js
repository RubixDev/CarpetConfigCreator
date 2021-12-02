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

String.prototype.removeTrailingSpaces = function () {
    let out = this
    while (out.slice(-1) === ' ') {
        out = out.slice(0, -1)
    }
    return out
}

Document.prototype.getElementsByAttribute = function (attributeName) {
    const out = []
    for (const element of document.getElementsByTagName('*')) {
        if (!element.hasAttribute(attributeName)) continue
        out.push(element)
    }
    return out
}

Array.prototype.last = function () {
    return this[this.length - 1]
}

Array.prototype.includesValue = function (testValue) {
    for (const e of this) {
        if (testRuleDefaultValue(e, testValue)) return true
    }
    return false
}

// General
function print(...data) {
    console.log(...data)
}

function alertPrint(message = undefined) {
    print(message)
    if (message === undefined) {
        alert()
    } else {
        alert(message)
    }
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
function getAllRules() {
    const out = {}
    for (const mod of data.values()) {
        for (const [ruleName, rule] of mod.rules.entries()) {
            out[ruleName] = rule
        }
    }
    return out.sorted()
}

function getSelectedMod() {
    const mod = document.getElementById('modSelect').value
    return mod === 'all' ? new Mod('all', 'All', getAllRules()) : data[mod]
}

function getSelectedCategory() {
    return document.getElementById('categorySelect').value
}

function setRuleValue(ruleName, value) {
    getSelectedMod().rules[ruleName].value = value
    print(`Set value of rule ${ruleName} to ${value}`)
}

function getRuleValue(ruleName) {
    return getSelectedMod().rules[ruleName].value
}

function updateResetButton(ruleName) {
    const resetButton = document.getElementById(ruleName + '__reset')
    resetButton.disabled = testRuleDefaultValue(getRuleValue(ruleName), defaultValues[ruleName])
}

function resetRuleValue(ruleName) {
    for (const mod of data.values()) {
        if (!mod.rules.keys().includes(ruleName)) continue
        mod.rules[ruleName].value = defaultValues[ruleName]
    }
}

function resetAll() {
    for (const mod of data.values()) {
        for (const rule of mod.rules.values()) {
            resetRuleValue(rule.name)
            if ([null, undefined].includes(rule.input)) continue
            rule.input.reset()
            updateResetButton(rule.name)
        }
    }
}

function resetAllInputs() {
    for (const mod of data.values()) {
        for (const rule of mod.rules.values()) {
            rule.input = null
        }
    }
}

function testRuleDefaultValue(testValue, defaultValue) {
    return new RegExp(`^${testValue}([.,]0+)?$`).test(defaultValue)
}
