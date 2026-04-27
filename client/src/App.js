import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = '/api/v1';

function App() {
	const [status, setStatus] = useState('Checking API...');

	useEffect(() => {
		let mounted = true;

		async function checkApiHealth() {
			try {
				const response = await axios.get(`${API_BASE_URL}/health`);
				if (!mounted) {
					return;
				}
				setStatus(`API connected: ${response.data.service}`);
			} catch (error) {
				if (!mounted) {
					return;
				}
				setStatus('API not reachable yet. Start backend with npm run dev in /server.');
			}
		}

		checkApiHealth();

		return () => {
			mounted = false;
		};
	}, []);

	return (
		<main className="app-shell">
			<section className="card">
				<h1>Budget Expense Tracker</h1>
				<p className="subtitle">Manual React + Webpack setup is running.</p>
				<p className="status">{status}</p>

				<h2>Next Build Targets</h2>
				<ul>
					<li>Create categories and settings endpoints</li>
					<li>Build expense submission form with conversion preview</li>
					<li>Render dashboard charts for monthly budget status</li>
				</ul>
			</section>
		</main>
	);
}

export default App;
