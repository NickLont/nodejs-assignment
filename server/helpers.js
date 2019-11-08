exports.isValidDate = (timestamp) => {
    return (new Date(timestamp)).getTime() > 0
}