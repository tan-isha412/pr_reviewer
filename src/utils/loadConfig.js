function loadConfig(names) {
    const config = {};
    const missing = [];
    for (const name of names) {
        const value = process.env[name];
        if (!value) missing.push(name);
        config[name] = value;
    }
    if (missing.length > 0) {
        throw new Error(`Missing required config: ${missing.join(", ")}`);
    }
    return config;
}

export default loadConfig;
