function requireEnv(names) {
    const missing = names.filter((name) => !process.env[name]);
    if (missing.length > 0) {
        console.error(`Missing required environment variable(s): ${missing.join(", ")}`);
        process.exit(1);
    }
}

export default requireEnv;
