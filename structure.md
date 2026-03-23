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
│   │   │   ├── Navbar.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── Snackbar.jsx
│   │   │   ├── SubjectFab.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── PageTransition.jsx
│   │   ├── context
│   │   │   ├── ThemeContext.jsx
│   │   │   └── SnackbarContext.jsx
│   │   ├── data
│   │   │   └── subjects.js
│   │   ├── pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SubjectTests.jsx
│   │   │   ├── Quiz.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── TeacherSubject.jsx
│   │   │   ├── TeacherTestDetail.jsx
│   │   │   ├── TeacherResults.jsx
│   │   │   ├── TeacherStudentResults.jsx
│   │   │   ├── AttemptHistory.jsx
│   │   │   └── AttemptDetail.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
```
