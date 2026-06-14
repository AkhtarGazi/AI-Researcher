# Researcher AI Workspace

A professional, workspace-centric application combining a Django backend with a React frontend.

## Project Structure

- `frontend/`: React application (Vite-based).
- `django-backend/`: Django REST API and WebSocket services.

## Workflow & Setup

### 1. Backend Setup (Django)
1. Navigate to the backend directory:
   ```bash
   cd django-backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows:** `venv\Scripts\activate`
   - **Unix/macOS:** `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Configure environment variables:
   - Create a `.env` file in the `django-backend/` root.
   - Add necessary secrets (DATABASE_URL, SECRET_KEY, etc.).
6. Run migrations:
   ```bash
   python manage.py migrate
   ```
7. Start the server:
   ```bash
   python manage.py runserver
   ```

### 2. Frontend Setup (React)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file in the `frontend/` root if needed.
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Development Workflow
- **Environment Variables:** Keep sensitive data in `.env` files. These are ignored by Git.
- **Dependencies:** Always run `npm install` or `pip install` after pulling changes that modify `package.json` or `requirements.txt`.
- **Backend API:** Ensure the Django server is running before starting the frontend to enable API communication.
