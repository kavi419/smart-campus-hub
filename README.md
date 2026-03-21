# Smart Campus Operations Hub

A full-stack web application for campus operations management.

## 📁 Project Structure

```
smart-campus-hub/
├── backend/                          # Spring Boot REST API
│   ├── src/main/java/com/it3030/backend/
│   │   ├── SmartCampusBackendApplication.java  # Main app class
│   │   ├── HelloController.java                # API endpoints
│   │   └── SecurityConfig.java                 # Security configuration
│   ├── src/main/resources/
│   │   └── application.properties              # DB & server config
│   └── pom.xml                       # Maven dependencies
│
├── frontend/                         # React + Vite application
│   ├── src/
│   │   ├── App.jsx                  # Main React component
│   │   └── main.jsx                 # Entry point
│   ├── vite.config.js               # Vite configuration (with API proxy)
│   ├── package.json                 # npm dependencies
│   └── index.html                   # HTML entry point
│
└── .gitignore                        # Git ignore rules for Java, Node, VS Code
```

## 🚀 Quick Start

### Prerequisites
- **Java 21** (or higher)
- **Node.js 20+** and npm
- **Maven** (or use `mvnw.cmd` included in backend)
- MySQL (optional - currently using embedded config)

### Step 1: Start the Backend

Open **PowerShell/Terminal** and run:

```powershell
cd c:\Users\Admin\Desktop\smart-campus-hub\backend
mvn clean spring-boot:run
```

**Expected Output:**
```
... 
Tomcat started on port(s): 8080 (http)
Started SmartCampusBackendApplication
```

The API will be available at: **http://localhost:8080/api/hello**

### Step 2: Start the Frontend

Open **Another PowerShell/Terminal** and run:

```powershell
cd c:\Users\Admin\Desktop\smart-campus-hub\frontend
npm run dev
```

**Expected Output:**
```
VITE v... dev server running at:
  
  ➜  Local:   http://localhost:5173/
```

### Step 3: Test the Full-Stack Connection

Open your browser and navigate to: **http://localhost:5173**

You should see:
```
Smart Campus Operations Hub

Backend Response:
✓ Hello from Smart Campus Backend!
```

## ✨ What's Inside

### Backend (Spring Boot)
- **SmartCampusBackendApplication.java** - Main Spring Boot application class
- **HelloController.java** - REST controller with `/api/hello` endpoint (GET)
- **SecurityConfig.java** - Security & CORS configuration (permits all requests for testing)
- **application.properties** - Server port (8080), database config

**Maven Dependencies:**
- Spring Boot Web Starter
- Spring Data JPA
- Spring Security
- OAuth2 Client
- MySQL Driver

### Frontend (React + Vite)
- **App.jsx** - React component that fetches data from `/api/hello` using fetch API
- **vite.config.js** - Vite config with dev server proxy (routes `/api/*` to `http://localhost:8080`)
- **axios** - HTTP client library installed (available for use)

## 📝 Available Commands

### Backend:
```powershell
# Run the Spring Boot app
mvn spring-boot:run

# Build the project
mvn clean package

# Run tests
mvn test
```

### Frontend:
```powershell
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hello` | Returns: "Hello from Smart Campus Backend!" |

## 🔐 Security Notes

- **Current Config**: SecurityConfig permits all requests (for development/testing)
- **CORS Enabled**: Frontend can call backend seamlessly
- **Next Steps**: Implement proper JWT/OAuth2 authentication for production

## 🗄️ Database Configuration

Currently configured for MySQL:
- **Database**: `smart_campus_db`
- **Host**: `localhost:3306`
- **Username**: `root`
- **Password**: (empty)
- **Auto-DDL**: `update` (tables created automatically)

To use a different database, update `backend/src/main/resources/application.properties`.

## 🛠️ Git Repository

The project is initialized as a Git repository with:
- Comprehensive `.gitignore` for Java, Node.js, and VS Code
- Initial commit: "Initial commit: Full-stack scaffolding with Spring Boot backend and React+Vite frontend"

## 📚 Next Steps

1. **Implement Authentication**: Update SecurityConfig for JWT/OAuth2
2. **Database Design**: Create JPA entities and repositories
3. **API Development**: Build RESTful endpoints
4. **Frontend Components**: Create React components for campus operations
5. **Testing**: Write unit and integration tests
6. **Deployment**: Configure for production environments

## 📧 Support

For IT3030 - PAF Assignment 2026 questions, refer to course materials.

---

**Last Updated**: March 21, 2026
**Status**: ✅ Ready for Development
