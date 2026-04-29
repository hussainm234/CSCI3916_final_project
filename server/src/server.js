const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

const rootEnvPath = path.join(__dirname, '..', '.env');
const srcEnvPath = path.join(__dirname, '.env');

if (fs.existsSync(rootEnvPath)) {
	dotenv.config({ path: rootEnvPath });
} else if (fs.existsSync(srcEnvPath)) {
	dotenv.config({ path: srcEnvPath });
}

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function startServer() {
	try {
		if (MONGODB_URI) {
			await mongoose.connect(MONGODB_URI);
			console.log('MongoDB connected.');
		} else {
			console.warn('MONGODB_URI not set. Starting API without DB connection for now.');
		}

		app.listen(PORT, () => {
			console.log(`Server running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error('Failed to start server:', error.message);
		process.exit(1);
	}
}

startServer();
