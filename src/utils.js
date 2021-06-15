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

function toggleField(hideObject, showObject) {
    hideObject.disabled = true
    hideObject.style.display = 'none'
    showObject.disabled = false
    showObject.style.display = 'inline'
    showObject.focus()
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
