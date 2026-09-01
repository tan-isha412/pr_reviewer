function assertParams(params, required) {
    const missing = required.filter(name => params[name] === undefined || params[name] === null);
    if (missing.length > 0) {
        throw new Error(`Missing required parameter(s): ${missing.join(", ")}`);
    }
}

export default assertParams;
