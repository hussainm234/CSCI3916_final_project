"# CSCI3916_final_project"

Project Name: Budget Expense Tracker with Multi-Currency Support

Team Members: Hossein Mohammadi, Mehar Sidhu

High Level Concept: A personal finance web app where users log daily expenses by category, set monthly budget limits, and visualize spending through charts. Expenses can be logged in any currency and automatically converted to a home currency using a live exchange rate API.

API: Create an Expense API that accepts expense submissions including amount, currency, and category. When a foreign currency is detected, the API will call ExchangeRate-API to convert the amount to the user's home currency and store both values. The API will also expose a reporting endpoint that compares monthly spending vs. budget limits per category, returning a warning flag if a budget is exceeded.

Front End: A simple dashboard displaying spending vs. budget per category using color-coded bar charts (green/yellow/red). Includes an expense entry form where users select a currency, enter an amount, and choose a category — the converted home-currency amount is shown in real time before submitting. A settings panel allows users to set their home currency and monthly budget limits per category.

Database: The database will contain:

A Categories collection with category name, monthly budget limit, and user reference
An Expenses collection with amount, original currency, converted amount, exchange rate used, category, date, and optional note
An Exchange Rate Log collection with base currency, target currency, rate, and timestamp to cache lookups and reduce redundant API calls

backend hosting render link: https://csci3916-final-project.onrender.com
