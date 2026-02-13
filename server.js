import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { sequelizeDB1, sequelizeDB2 } from './src/config/database.js';
import './src/models/index.js'; // Ensure associations are initialized
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';

// Import Routes
import reportRoutes from './routes/reportRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import contactSearchRoutes from './routes/contactSearchRoutes.js';
import supportRoutes from './routes/supportRoutes.js';


const app = express();
const port = process.env.PORT || 3000;

// Update CORS to be more restrictive if in production
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Swagger Setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CAMS Support Portal API',
            version: '1.0.0',
            description: 'API for CAMS Support Portal',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
            },
        ],
    },
    apis: ['./server.js', './routes/*.js'], // Scan routes for Swagger docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Test Database Connections
sequelizeDB1.authenticate()
    .then(() => logger.info("✅ Database 1 (CSP) connected successfully!"))
    .catch(err => logger.error(`❌ Database 1 connection failed: ${err.message}`));

sequelizeDB2.authenticate()
    .then(() => logger.info("✅ Database 2 (CBSDB) connected successfully!"))
    .catch(err => logger.error(`❌ Database 2 connection failed: ${err.message}`));

// --- API ROUTES ---
app.use('/api', reportRoutes);
app.use('/api', clientRoutes);
app.use('/api', contactSearchRoutes);
app.use('/api', supportRoutes);


// Error Handling Middleware
app.use(errorHandler);

app.listen(port, () => {
    logger.info(`🚀 Server running on http://localhost:${port}`);
});
