import logger from '../utils/logger.js';

const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });

        // Pass parsed data back to req to ensure types are correct (coerced numbers etc)
        if (parsed.body) req.body = parsed.body;
        if (parsed.query) {
            // Note: In Express 5, req.query is often a getter. 
            // We modify the object properties instead of reassigning the whole object.
            Object.assign(req.query, parsed.query);
        }
        if (parsed.params) {
            Object.assign(req.params, parsed.params);
        }

        next();
    } catch (e) {
        logger.warn(`Validation error: ${e.message}`);

        const errorIssues = e.issues || e.errors;
        const details = errorIssues ? errorIssues.map(err => ({
            path: err.path.join('.'),
            message: err.message
        })) : [{ message: e.message }];

        return res.status(400).json({
            error: "Validation failed",
            details
        });
    }
};

export default validate;
