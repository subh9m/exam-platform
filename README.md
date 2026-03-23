# 🚀 Exam Platform

A full-stack online examination system built with **Java (Spring Boot), React, and MongoDB**, featuring OTP-based authentication, role-based access, and a complete quiz lifecycle.

---

## 🧠 Overview

This platform allows:

- **Students** to register/login using OTP, attempt quizzes, and track performance  
- **Teachers** to create subjects, tests, and manage questions  
- Real-time **quiz evaluation, leaderboard, and results tracking**

Designed with a focus on **backend architecture, authentication flows, and real-world system design**

---

## ⚙️ Tech Stack

### Backend
- Java, Spring Boot  
- Spring Security (JWT Authentication)  
- MongoDB  
- REST APIs  

### Frontend
- React (Vite)  
- Context API (State Management)  
- Tailwind CSS  
- MUI (Snackbar, UI components)  

---

## 🔑 Features

### 👨‍🎓 Student
- OTP-based Registration & Login  
- Attempt subject-wise tests  
- Real-time score calculation  
- Leaderboard & attempt history  
- Detailed results tracking  

### 👨‍🏫 Teacher
- Create new subjects  
- Create and manage tests  
- Add/Edit/Delete questions  
- View student performance  
- Analyze results  

### 🔐 Authentication
- OTP-based email verification  
- JWT-based session management  
- Role-based access control (Student / Teacher)  

---

## 🔄 Workflow

### Authentication Flow
1. User enters email  
2. OTP generated and sent via email  
3. OTP verified  
4. JWT token issued  
5. Token used for secured API access  

---

### Quiz Flow
1. Student selects subject  
2. Views available tests  
3. Attempts quiz  
4. Submits answers  
5. Backend calculates score  
6. Result stored and shown  
7. Leaderboard updated  

---

## 🏗️ System Architecture

```
Frontend (React)
      ↓
REST API (Spring Boot)
      ↓
Service Layer (Business Logic)
      ↓
Repository Layer
      ↓
MongoDB
```

---

## 📁 Project Structure


```bash
ExamPlatform
├── backend
│   └── examplatform
│       ├── src
│       │   ├── main
│       │   │   ├── java/com/examplatform
│       │   │   │   ├── config
│       │   │   │   │   ├── DataSeeder.java
│       │   │   │   │   ├── SecurityConfig.java
│       │   │   │   │   └── WebConfig.java
│       │   │   │   ├── controller
│       │   │   │   │   ├── AuthController.java
│       │   │   │   │   ├── QuizController.java
│       │   │   │   │   ├── SubjectController.java
│       │   │   │   │   ├── TeacherController.java
│       │   │   │   │   └── TestController.java
│       │   │   │   ├── model
│       │   │   │   │   ├── User.java
│       │   │   │   │   ├── Subject.java
│       │   │   │   │   ├── Test.java
│       │   │   │   │   ├── Question.java
│       │   │   │   │   ├── QuizResult.java
│       │   │   │   │   └── OtpCode.java
│       │   │   │   ├── repository
│       │   │   │   │   ├── UserRepository.java
│       │   │   │   │   ├── SubjectRepository.java
│       │   │   │   │   ├── TestRepository.java
│       │   │   │   │   ├── QuestionRepository.java
│       │   │   │   │   ├── QuizResultRepository.java
│       │   │   │   │   └── OtpCodeRepository.java
│       │   │   │   ├── service
│       │   │   │   │   ├── UserService.java
│       │   │   │   │   ├── SubjectService.java
│       │   │   │   │   ├── QuizService.java
│       │   │   │   │   ├── OtpService.java
│       │   │   │   │   └── EmailService.java
│       │   │   │   ├── security
│       │   │   │   │   ├── JwtFilter.java
│       │   │   │   │   └── JwtUtil.java
│       │   │   │   └── ExamplatformApplication.java
│       │   │   └── resources
│       │   │       └── application.properties
│       │   └── test
│       │       └── java/com/examplatform
│       │           └── ExamplatformApplicationTests.java
│       └── pom.xml
│
├── frontend
│   ├── src
│   │   ├── api
│   │   │   └── api.js
│   │   ├── components


---

## 🔍 Key Concepts Used

- RESTful API Design  
- MVC Architecture  
- JWT Authentication  
- OTP-based Authentication  
- Role-Based Access Control  
- MongoDB Schema Design  
- React State Management (Context API)  

---

## ⚠️ Edge Cases Handled

- OTP expiry and retry limits  
- Invalid/expired JWT tokens  
- Duplicate user registration  
- Partial quiz submissions  
- Role-based access restrictions  

---

## 🚀 Future Improvements

- Google OAuth login  
- Refresh tokens for JWT  
- Redis caching for performance  
- Timer-based quiz enforcement  
- Anti-cheating mechanisms  

---

## 📌 Why This Project?

This project was built to:

- Simulate a **real-world exam system**
- Practice **backend-heavy development**
- Implement **authentication and system design concepts**
- Build something I can **defend in technical interviews**

---

## 📫 Connect

- LinkedIn: https://www.linkedin.com/in/subh9m/

---

## ⭐ If you like this project, consider giving it a star!
