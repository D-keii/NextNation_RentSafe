# RentSafe Project

A full-stack property rental application with a **React frontend** and **Flask backend**.

## Table of Contents

- [Project Overview](#project-overview)
- [Technologies](#technologies)
- [Setup & Installation](#setup--installation)
  - [Backend (Flask)](#backend-flask)
  - [Frontend (React)](#frontend-react)
- [Running the Project](#running-the-project)
- [Environment Variables](#environment-variables)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)

---

## Project Overview

RentSafe allows users to browse rental properties, apply for listings, save favorites, and manage applications. The project is split into:

- **Backend**: Flask REST API with SQLite/PostgreSQL (can be changed).
- **Frontend**: React application with React Router, Tailwind CSS, and Axios for API calls.

---

## Technologies

- **Frontend:** React, Tailwind CSS, React Router, Axios, Lucide-React
- **Backend:** Python, Flask, Flask SQLAlchemy, Flask CORS
- **Database:** SQLite (default)
- **Others:** JSON for configuration and data storage

---

## Setup & Installation

### Backend (Flask)

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/rentsafe.git
    cd rentsafe/backend
    ```

2. **Create a virtual environment:**
    ```bash
    python -m venv venv
    ```

3. **Activate the virtual environment:**
    - Windows:
      ```bash
      venv\Scripts\activate
      ```
    - macOS/Linux:
      ```bash
      source venv/bin/activate
      ```

4. **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

5. **Run the Flask server:**
    ```bash
     python .\app.py
    ```
    By default, the backend runs on `http://127.0.0.1:8889`.

---

### Frontend (React)

1. **Navigate to the frontend folder:**
    ```bash
    cd ../frontend
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Start the React development server:**
    ```bash
    npm start
    ```
    By default, the frontend runs on `http://localhost:5173` and will proxy API requests to Flask if configured.

---

## Running the Project

1. Start the **backend** first:
    ```bash
    cd backend
    flask run
    ```

2. Start the **frontend** in a separate terminal:
    ```bash
    cd frontend
    npm start
    ```

3. Open your browser and navigate to:
    ```
    http://localhost:5173
    ```

---

