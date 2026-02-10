# chemical-equipment-visualizer
# Chemical Equipment Parameter Visualizer  
(Hybrid Web + Desktop Application)

## Project Overview
This project is a hybrid application that runs as both a Web Application and a Desktop Application.
It allows users to upload CSV files containing chemical equipment parameters and visualize
summary statistics and equipment distribution.

## Tech Stack
- Backend: Django + Django REST Framework
- Web Frontend: React.js + Chart.js
- Desktop App: PyQt5 + Matplotlib
- Database: SQLite
- Data Processing: Pandas

## Features
- CSV file upload
- Data parsing and analytics
- Summary statistics (count, averages)
- Equipment type distribution visualization
- Stores last 5 uploaded datasets
- Shared backend for web and desktop apps

## Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Web Application Setup
cd web-frontend
npm install
npm start

Desktop Application (PyQt5)

The desktop application is built using PyQt5 and connects to the same Django REST API
used by the web application.

Features

Upload CSV files to the backend

View summary statistics

Visualize equipment type distribution using Matplotlib

Run Desktop App
cd desktop
pip install -r requirements.txt
python main.py

Authentication Note

For demonstration purposes, authentication is disabled for the CSV upload API
to allow seamless access from both Web and Desktop clients.
Token-based authentication can be enabled easily for production use.

Sample Data

Use sample_equipment_data.csv for testing.

Demo

A short demo video (2–3 minutes) demonstrates:

CSV upload from Web Application

Data visualization using charts

CSV upload from Desktop Application

Shared backend API

## Live Application

Frontend (Render):
https://chemical-equipment-visualizer-ui.onrender.com

Backend API (Render):
https://chemical-equipment-visualizer-mdxc.onrender.com



