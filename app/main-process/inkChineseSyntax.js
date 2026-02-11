let enabled = false;

function setEnabled(value) {
    enabled = !!value;
}

function isEnabled() {
    return enabled;
}

module.exports = {
    setEnabled,
    isEnabled
};
