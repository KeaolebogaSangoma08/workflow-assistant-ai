# AI Workplace Productivity Assistant

## Overview

The **AI Workplace Productivity Assistant** is a modern, AI-powered web application designed to help professionals automate everyday workplace tasks. The platform combines multiple AI tools into a single, intuitive dashboard, enabling users to write professional emails, summarize meetings, plan projects, conduct research, manage documents, and automate workflows more efficiently.

Built with a clean SaaS-inspired interface, the application focuses on improving productivity, reducing repetitive work, and streamlining collaboration in modern workplaces.

---

## Features

### AI Productivity Tools
- Smart Email Generator
- Meeting Notes Summarizer
- AI Task Planner
- AI Research Assistant
- AI Chatbot Interface

### AI Document Assistant
- Upload PDF, Word, Excel, PowerPoint, and text files
- Summarize documents
- Extract action items
- Answer questions about uploaded documents
- Compare documents
- Translate document content

### Multi-Language Support
- Switch the application interface between multiple languages
- Generate AI responses in the user's preferred language

### Smart Meeting Action Tracker
- Automatically extract:
  - Action items
  - Responsible person
  - Deadlines
  - Priority
  - Task status

### Voice Input
- Speech-to-text for prompts
- Hands-free interaction with AI tools

### AI Prompt Library
- Ready-made prompt templates
- Categories for HR, Marketing, IT, Finance, Sales, Customer Support, and more
- Save custom prompts

### AI Workflow Automation
Automate workplace processes such as:

Meeting Transcript
→ Summary
→ Action Items
→ Task Planner
→ Calendar Event
→ Follow-up Email

### Calendar Integration
- Google Calendar integration
- Outlook Calendar integration
- Schedule meetings and deadlines

### Global Search
Search across:
- Emails
- Documents
- Tasks
- Research
- Meeting notes
- Chat history

### Productivity Dashboard
Visual analytics including:
- Productivity score
- AI requests
- Documents analyzed
- Tasks completed
- Hours saved
- Weekly usage trends

### Export Options
Export AI-generated content to:
- PDF
- Microsoft Word (.docx)
- Microsoft Excel (.xlsx)
- Plain Text

### Editable AI Responses
Every AI-generated response can be:
- Edited
- Regenerated
- Copied
- Saved
- Downloaded
- Shared

### Responsible AI Disclaimer
Each AI tool includes a reminder encouraging users to verify AI-generated content before using it professionally.

### Responsive SaaS Dashboard
- Modern dashboard interface
- Sidebar navigation
- Mobile-first responsive design
- Dark and Light themes
- Smooth animations

---

## Tools Used

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- React Icons

### Backend
- Node.js
- Express.js

### AI Integration
- OpenAI API

### Database & Storage
- Supabase (or Firebase)

### Authentication
- Firebase Authentication

### File Upload
- React Dropzone

### Calendar Integration
- Google Calendar API
- Microsoft Outlook Calendar API

### Voice Recognition
- Web Speech API

### Export Libraries
- jsPDF
- docx
- SheetJS

### Deployment
- Vercel (Frontend)
- Railway or Render (Backend)

---


```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/ai-workplace-productivity-assistant.git
```

### 2. Navigate to the project

```bash
cd ai-workplace-productivity-assistant
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Install backend dependencies

```bash
cd server
npm install
```

### 5. Configure environment variables

Create a `.env` file in the project root.

Example:

```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
GOOGLE_CALENDAR_API_KEY=your_google_api_key
```

For the backend:

```env
OPENAI_API_KEY=your_openai_api_key
PORT=5000
```

---

### 6. Start the backend server

```bash
cd server
npm run dev
```

---

### 7. Start the frontend

```bash
npm run dev
```

---

### 8. Open the application

Visit:

```
http://localhost:5173
```

---

## Future Improvements

- AI-generated PowerPoint presentations
- Microsoft Teams integration
- Slack integration
- OCR for scanned documents
- Real-time collaboration
- Team workspaces
- Custom AI agents
- Mobile application
- Offline mode
- AI-powered project risk analysis

---

## License

This project is licensed under the MIT License.
