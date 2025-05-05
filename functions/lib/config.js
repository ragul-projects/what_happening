"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
// Load environment variables
(0, dotenv_1.config)();
exports.env = {
    adminPassword: process.env.ADMIN_PASSWORD || 'kit@123',
    databaseUrl: process.env.DATABASE_URL || '',
    nodeEnv: process.env.NODE_ENV || 'development'
};
//# sourceMappingURL=config.js.map