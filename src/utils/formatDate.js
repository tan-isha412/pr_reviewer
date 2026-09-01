function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toISOString().slice(0, 10);
}

export default formatDate;
