# Professional Prompt: React + Django UI for Research Agent

## Project Overview
You are tasked with building a professional React + Django UI integration for an existing LangChain-based research agent application. **The core research logic MUST NOT be modified.** Your role is to create a seamless frontend and backend integration layer that exposes the existing functionality through an intuitive UI.

---

## Core Architecture & Requirements

### Current Research Agent System (DO NOT MODIFY)
The existing `research-agent` contains:
- **Search Agent**: Web search capability using Tavily API
- **Reader Agent**: URL scraping and content extraction
- **Writer Chain**: Generates structured research reports (intro, findings, conclusion, sources)
- **Critic Chain**: Evaluates and critiques generated reports with quality scores (0-10)

### Project Structure to Create
```
Researcher/
├── research-agent/                 # ← KEEP UNCHANGED
│   ├── agents/
│   ├── chains/
│   ├── tools/
│   └── api/
│
├── frontend/                    # ← NEW: Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── styles/
│   │   └── App.js
│   ├── package.json
│   └── .env
│
└── django-backend/                 # ← NEW: Backend API (Django)
    ├── research_api/
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── api/
    │   ├── models.py
    │   ├── views.py
    │   ├── serializers.py
    │   ├── urls.py
    │   └── middleware.py
    ├── research_agent/             # ← Core code integration
    │   └── (symbolic link/import from research-agent)
    ├── manage.py
    ├── requirements.txt
    └── .env
```

---

## Phase 1: Django Backend API Layer

### Objective
Create a Django REST API that wraps the existing research-agent pipeline without modifying core code.

### Requirements

#### 1. **Integration Approach**
- Import `run_research_pipeline()` from `research-agent/chains/research_pipeline.py`
- Do NOT copy or duplicate core code - use direct imports
- Create API endpoints that call the pipeline synchronously/asynchronously

#### 2. **Django API Endpoints**

| Endpoint | Method | Purpose | Request Body | Response |
|----------|--------|---------|--------------|----------|
| `/api/research/` | POST | Initiate research | `{ "topic": "string" }` | `{ "task_id": "uuid", "status": "queued" }` |
| `/api/research/<task_id>/` | GET | Get research status & results | - | `{ "task_id", "topic", "status", "results": {...} }` |
| `/api/research/<task_id>/cancel/` | POST | Cancel research task | - | `{ "status": "cancelled" }` |
| `/api/research/history/` | GET | Get past research tasks | - | `[ {...}, {...} ]` |
| `/api/health/` | GET | API health check | - | `{ "status": "healthy" }` |

#### 3. **Django Models**
```python
# ResearchTask Model
- id (UUID Primary Key)
- topic (CharField)
- status (ChoiceField: queued, running, completed, failed, cancelled)
- created_at (DateTime)
- updated_at (DateTime)
- search_results (JSONField)
- scraped_content (JSONField)
- report (JSONField)
- critique (JSONField)
- error_message (TextField, nullable)

# ResearchStep Model (for tracking progress)
- task (ForeignKey to ResearchTask)
- step_name (CharField: search, scrape, write, critique)
- status (CharField: pending, running, completed, failed)
- timestamp (DateTime)
- result (JSONField, nullable)
```

#### 4. **Asynchronous Processing**
- Use Django-RQ or Celery for background task processing
- Emit WebSocket events for real-time progress updates:
  - `"research_started"` → Topic received
  - `"search_completed"` → Search results ready
  - `"scraping_completed"` → Content extracted
  - `"report_generated"` → Draft report ready
  - `"critique_completed"` → Final report with critique
  - `"research_completed"` → All steps finished
  - `"research_failed"` → Error occurred

#### 5. **Error Handling**
- Gracefully handle missing API keys (TAVILY_API_KEY, MISTRAL_API_KEY)
- Catch and log all exceptions from the research pipeline
- Return meaningful error messages to the frontend
- Implement retry logic for transient failures

#### 6. **CORS & Security**
- Enable CORS for React frontend
- Implement API rate limiting (max 10 requests/minute per user)
- Validate input: topic length (5-500 chars), type checking
- Add request/response logging

---

## Phase 2: React Frontend Application

### Objective
Create an intuitive, professional React UI that allows users to:
1. Input research topics
2. Monitor research progress in real-time
3. View structured reports with quality scores
4. Access research history
5. Download/share reports

### Requirements

#### 1. **Page Structure**

##### Home / Research Page
- **Input Section**: 
  - Text input field for research topic
  - Submit button with loading state
  - Recent searches quick-access buttons
  - Input validation feedback
  
- **Progress Section** (appears after submission):
  - Multi-step progress indicator showing: Search → Scrape → Write → Critique
  - Real-time status messages from WebSocket
  - Loading animations for each step
  - Estimated time remaining
  
- **Results Section** (appears after completion):
  - Structured report display with sections: intro, findings, conclusion, sources
  - Quality score badge (0-10) with color coding (red 0-3, yellow 4-6, green 7-10)
  - Critique section (expandable)
  - Action buttons: Download PDF, Copy to Clipboard, Share, Save to History

##### History Page
- Table/grid view of past research tasks
- Filters: by topic, date range, quality score
- Search functionality
- Click to view full report details
- Option to re-run research on same topic
- Delete/archive old research

##### Settings Page (Optional)
- API configuration (endpoint URL)
- Display preferences (theme, language)
- Export research data

#### 2. **UI/UX Components**

**Core Components**:
- `ResearchForm` - Input & validation
- `ProgressTracker` - Multi-step progress display
- `ReportViewer` - Formatted report display
- `CritiquePanel` - Critique & scoring display
- `ResearchHistory` - Past research list
- `LoadingSpinner` - Animated loading indicator
- `NotificationToast` - Success/error messages
- `ExportMenu` - PDF, copy, share options

**Design Principles**:
- Clean, minimalist design with professional color palette (blue/gray primary)
- Responsive layout (mobile-first) - works on desktop, tablet, mobile
- Accessibility: proper contrast ratios, ARIA labels, keyboard navigation
- Micro-interactions: smooth transitions, feedback animations
- Dark mode support

#### 3. **State Management**
- Use Context API or Redux for:
  - Current research state (topic, status, results)
  - Research history
  - UI state (loading, error messages)
  - User preferences (theme, language)

#### 4. **WebSocket Integration**
- Real-time progress updates from Django backend
- Connection status indicator
- Auto-reconnect on disconnection
- Handle connection errors gracefully

#### 5. **Local Storage & Persistence**
- Save draft topics (auto-save)
- Cache research history
- Store user preferences
- Implement search history

#### 6. **Performance Optimization**
- Code splitting & lazy loading for pages
- Image optimization
- Debounce search input
- Memoize expensive computations
- Virtual scrolling for large history lists

---

## Phase 3: Integration Guidelines

### Django-React Communication

#### API Response Format (Standard)
```json
{
  "success": true,
  "data": {
    "task_id": "uuid",
    "topic": "string",
    "status": "completed",
    "results": {
      "search_results": "...",
      "scraped_content": "...",
      "report": "...",
      "critique": "..."
    },
    "metadata": {
      "created_at": "ISO timestamp",
      "completed_at": "ISO timestamp",
      "duration_seconds": 45
    }
  },
  "error": null
}
```

#### Error Response Format
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "RESEARCH_FAILED",
    "message": "Web search failed due to API error",
    "details": "..."
  }
}
```

### Environment Configuration

**Django (.env)**
```
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOWED_ORIGINS=http://localhost:3000

TAVILY_API_KEY=your-key
MISTRAL_API_KEY=your-key
DATABASE_URL=sqlite:///db.sqlite3

REDIS_URL=redis://localhost:6379/0  # For task queue
```

**React (.env)**
```
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_API_TIMEOUT=300000
REACT_APP_ENVIRONMENT=development
```

---

## Phase 4: Implementation Checklist

### Backend (Django)
- [ ] Create Django project structure
- [ ] Set up database models for ResearchTask & ResearchStep
- [ ] Create API serializers for all data formats
- [ ] Implement REST endpoints (/api/research/*, /api/health/)
- [ ] Create service layer to call `run_research_pipeline()` from research-agent
- [ ] Implement task queue (RQ/Celery) for async processing
- [ ] Set up WebSocket connection for real-time updates
- [ ] Add CORS middleware
- [ ] Implement error handling & logging
- [ ] Add API rate limiting
- [ ] Create management commands for cleanup
- [ ] Write unit tests
- [ ] Document API with OpenAPI/Swagger

### Frontend (React)
- [ ] Initialize React project (Create React App / Vite)
- [ ] Set up component folder structure
- [ ] Create core components (Form, ProgressTracker, ReportViewer, etc.)
- [ ] Implement Context API / Redux for state management
- [ ] Set up API service layer with axios/fetch
- [ ] Implement WebSocket client
- [ ] Create page layouts (Home, History, Settings)
- [ ] Add responsive design (mobile-first)
- [ ] Implement dark mode
- [ ] Set up error boundary & error handling
- [ ] Add local storage persistence
- [ ] Implement PDF export functionality
- [ ] Add loading & success animations
- [ ] Write component tests
- [ ] Optimize performance

### Deployment
- [ ] Configure Django for production (HTTPS, security headers)
- [ ] Set up static file serving
- [ ] Build React for production
- [ ] Configure Docker containers (optional)
- [ ] Set up CI/CD pipeline

---

## Important Constraints

### DO NOT MODIFY
- ✗ `research-agent/agents/agents.py`
- ✗ `research-agent/chains/research_pipeline.py`
- ✗ `research-agent/tools/`
- ✗ Any core research logic

### DO MODIFY/CREATE
- ✓ Create new Django project
- ✓ Create new React application
- ✓ Create Django API layer to wrap the pipeline
- ✓ Create integration service that calls core functions
- ✓ Add configurations and environment setup

---

## Code Organization

```
django-backend/
├── api/
│   ├── views.py              # API endpoints
│   ├── serializers.py        # Data serialization
│   ├── models.py             # Database models
│   ├── services.py           # Business logic (calls research-agent)
│   ├── tasks.py              # Celery/RQ tasks
│   ├── consumers.py          # WebSocket consumers
│   └── middleware.py         # CORS, logging, rate limiting
```

```
react-agent/
├── src/
│   ├── components/
│   │   ├── ResearchForm.jsx
│   │   ├── ProgressTracker.jsx
│   │   ├── ReportViewer.jsx
│   │   ├── CritiquePanel.jsx
│   │   └── ...
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── HistoryPage.jsx
│   │   └── SettingsPage.jsx
│   ├── services/
│   │   ├── api.js            # API client
│   │   ├── websocket.js      # WebSocket client
│   │   └── storage.js        # Local storage utilities
│   ├── context/
│   │   └── ResearchContext.js
│   └── styles/
│       └── index.css
```

---

## Success Metrics

1. **Functionality**: All API endpoints working, real-time updates flowing correctly
2. **Performance**: API response < 2s, UI renders in < 1s
3. **UX**: Smooth animations, clear progress feedback, intuitive navigation
4. **Reliability**: Error handling for all edge cases, graceful degradation
5. **Code Quality**: Clean, documented, testable, no core logic duplication
6. **Accessibility**: WCAG 2.1 AA compliance minimum

---

## Notes for AI/Developer

1. **Integration is Key**: The value is in how seamlessly you integrate the existing pipeline, NOT in modifying it
2. **Real-time UX**: Users should see progress step-by-step, not just a final result
3. **Error Resilience**: Network failures, API errors, timeouts - handle all gracefully
4. **Professional Quality**: This is a production-ready application, not a demo
5. **Documentation**: Code comments, API docs, setup instructions are essential
6. **Testing**: Write tests for API endpoints and critical React components
7. **Performance**: Optimize for both backend processing time and frontend rendering

---

## Success Delivery Checklist

- [ ] Django API fully functional with all endpoints
- [ ] React frontend responsive and polished
- [ ] Real-time WebSocket communication working
- [ ] Error handling comprehensive
- [ ] Complete documentation provided
- [ ] Environment setup instructions clear
- [ ] No modifications to core research-agent code
- [ ] Project runs locally without errors
- [ ] API rate limiting & security measures in place
- [ ] Code follows best practices & is production-ready
