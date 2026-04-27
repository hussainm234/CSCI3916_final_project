const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/v1/health', (_req, res) => {
	res.status(200).json({
		ok: true,
		service: 'budget-expense-tracker-api',
		timestamp: new Date().toISOString(),
	});
});

app.get('/', (_req, res) => {
	res.status(200).json({
		message: 'Budget Expense Tracker API is running',
		docsHint: 'Use /api/v1/health for a quick status check.',
	});
});

app.use((req, res) => {
	res.status(404).json({
		message: `Route not found: ${req.method} ${req.originalUrl}`,
	});
});

app.use((err, _req, res, _next) => {
	console.error('Unhandled error:', err);

	res.status(err.status || 500).json({
		message: err.message || 'Internal server error',
	});
});

module.exports = app;
