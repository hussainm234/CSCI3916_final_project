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

			// Drop the stale global unique index on categories.name if it exists.
			// The correct per-user compound index (name_1_user_1) handles uniqueness instead.
			try {
				await mongoose.connection.collection('categories').dropIndex('name_1');
				console.log('Dropped stale categories name_1 index.');
			} catch (e) {
				// Index doesn't exist — nothing to do
			}
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