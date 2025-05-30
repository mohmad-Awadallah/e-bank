# e-Bank Application

![Project Architecture](https://img.shields.io/badge/architecture-multitier-blue)
![Backend](https://img.shields.io/badge/backend-springboot-brightgreen)
![Frontend](https://img.shields.io/badge/frontend-next.js-000000)
![Mobile](https://img.shields.io/badge/mobile-react%20native-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

A modern banking application with web and mobile interfaces, built with Spring Boot backend, Next.js frontend, and React Native mobile app.

## 🌟 Key Features

* **User Authentication**: Secure JWT-based authentication
* **Account Management**: Create and manage bank accounts
* **Transaction Processing**: Real-time money transfers
* **Multi-platform**: Web and mobile interfaces
* **API Documentation**: Comprehensive Swagger docs

## 📁 Project Structure

```
e-bank/
├── backend/          # Spring Boot backend (Java)
│   ├── src/main/resources/application.yml # Config
├── frontend/        # Next.js 14+ frontend
│   ├── app/         # App Router directory
│   ├── public/      # Static assets
│   ├── next.config.ts # Next.js config
├── mobile/          # React Native/Expo mobile app
├── images/      # Screenshots and project images  
├── docker-compose.yml # Docker configuration
└── README.md        # Project documentation
```

## 📸 Screenshots & Project Images

Below are some screenshots from the web and mobile applications.

![Screenshot](https://github.com/mohmad-Awadallah/e-bank/blob/main/images/Screenshot%20from%202025-05-22%2000-51-46.png)
![Screenshot](https://github.com/mohmad-Awadallah/e-bank/blob/main/images/Screenshot%20from%202025-05-22%2000-52-15.png)
![Screenshot](https://github.com/mohmad-Awadallah/e-bank/blob/main/images/Screenshot%20from%202025-05-22%2000-47-51.png)
![Screenshot](https://github.com/mohmad-Awadallah/e-bank/blob/main/images/Screenshot%20from%202025-05-22%2000-53-23.png)
![Screenshot](https://github.com/mohmad-Awadallah/e-bank/blob/main/images/Screenshot%20from%202025-05-22%2000-54-27.png)
![Screenshot](https://github.com/mohmad-Awadallah/e-bank/blob/main/images/Screenshot%20from%202025-05-22%2000-55-29.png)
![Screenshot](https://github.com/mohmad-Awadallah/e-bank/blob/main/images/Screenshot%20from%202025-05-22%2000-56-58.png)
![Screenshot](https://github.com/mohmad-Awadallah/e-bank/blob/main/images/Screenshot%20from%202025-05-22%2000-58-50.png)
![Screenshot](https://github.com/mohmad-Awadallah/e-bank/blob/main/images/Screenshot%20from%202025-05-22%2001-01-10.png)
![Screenshot](https://github.com/mohmad-Awadallah/e-bank/blob/main/images/Screenshot%20from%202025-05-22%2001-03-47.png)
![Screenshot](https://github.com/mohmad-Awadallah/e-bank/blob/main/images/Screenshot%20from%202025-05-22%2001-04-15.png)
![Screenshot](https://github.com/mohmad-Awadallah/e-bank/blob/main/images/fcce6525-7ae1-4114-aab5-2095a4d62534.jpeg)

---

## 🛠️ Technology Stack

### Backend

* **Core**: Java 17+, Spring Boot 3.x
* **Security**: Spring Security, JWT
* **Database**: MySQL with Hibernate
* **Cache**: Redis
* **API Docs**: OpenAPI 3 (Swagger)

### Frontend

* **Framework**: Next.js 14+ (App Router)
* **Language**: TypeScript 5.x
* **Styling**: TailwindCSS 3.x + CSS Modules
* **State**: React Context/Redux Toolkit
* **HTTP**: Axios
* **Server Actions**: Next.js API Routes

### Mobile

* **Framework**: React Native
* **Tools**: Expo SDK
* **Language**: TypeScript
* **Navigation**: React Navigation

## 🚀 Getting Started

### Prerequisites

* Docker 20.10+ (for containerized deployment)
* JDK 17+ (for backend development)
* Node.js 18+ LTS
* npm 9+ or yarn
* MySQL 8.0+
* Redis 7.2-alpine

### 🐳 Docker Setup

```bash
docker-compose up -d --build
```

Services will be available at:

* Backend: [http://localhost:8080](http://localhost:8080)
* Frontend: [http://localhost:3000](http://localhost:3000)
* MySQL: port 3306
* Redis: port 6379

### 🛠️ Manual Installation

#### Backend

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
# Next.js will run on http://localhost:3000
```

#### Mobile

```bash
cd mobile
npm install
npx expo start --tunnel
```

## 📚 API Documentation

Access API docs after starting backend:

* Swagger UI: [http://localhost:8080/swagger-ui/index.html#/](http://localhost:8080/swagger-ui/index.html#/)
* Next.js API Routes: [http://localhost:3000](http://localhost:3000)
