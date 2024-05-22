
exports.middleware = () => (req, res, next) => {
    if (req.get('appVersion')) {
        const systemVersion = process.env.MIN_ALLOWED_VERSION.split('.');
        const appVersion = req.get('appVersion').split('.');

        console.log({appVersion})
        console.log({systemVersion})
        let version = 0;
        let system = 0;
        let multiplier = 100;
        let systemMultiplier = 100;
        for (let i = 0; i < appVersion.length; i++) {
            version += appVersion[i] * multiplier;
            multiplier = multiplier / 10;
        }

        for (let i = 0; i < systemVersion.length; i++) {
            system += systemVersion[i] * systemMultiplier;
            systemMultiplier = systemMultiplier / 10;
        }
        console.log({system})
        console.log({version})
        if (system <= version) {
            next();
        } else {
            res.status(426).send();
        }
    } else {
        next();
    }
};
