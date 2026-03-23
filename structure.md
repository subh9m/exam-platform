# Project Structure

ExamPlatform
├── .idea
│   ├── inspectionProfiles
│   │   └── Project_Default.xml
│   ├── .gitignore
│   ├── copilot.data.migration.ask2agent.xml
│   ├── ExamPlatform.iml
│   ├── material_theme_project_new.xml
│   ├── misc.xml
│   ├── modules.xml
│   └── workspace.xml
├── backend
│   ├── .idea
│   │   ├── .gitignore
│   │   ├── backend.iml
│   │   ├── compiler.xml
│   │   ├── copilot.data.migration.ask2agent.xml
│   │   ├── encodings.xml
│   │   ├── jarRepositories.xml
│   │   ├── material_theme_project_new.xml
│   │   ├── misc.xml
│   │   ├── modules.xml
│   │   ├── vcs.xml
│   │   └── workspace.xml
│   └── examplatform
│       ├── .idea
│       │   ├── .gitignore
│       │   ├── compiler.xml
│       │   ├── encodings.xml
│       │   ├── jarRepositories.xml
│       │   ├── misc.xml
│       │   └── workspace.xml
│       ├── .mvn
│       │   └── wrapper
│       │       └── maven-wrapper.properties
│       ├── src
│       │   ├── main
│       │   │   ├── java
│       │   │   │   └── com
│       │   │   │       └── examplatform
│       │   │   │           ├── config
│       │   │   │           │   ├── DataSeeder.java
│       │   │   │           │   ├── SecurityConfig.java
│       │   │   │           │   └── WebConfig.java
│       │   │   │           ├── controller
│       │   │   │           │   ├── AuthController.java
│       │   │   │           │   ├── QuizController.java
│       │   │   │           │   ├── SubjectController.java
│       │   │   │           │   ├── TeacherController.java
│       │   │   │           │   └── TestController.java
│       │   │   │           ├── model
│       │   │   │           │   ├── OtpCode.java
│       │   │   │           │   ├── Question.java
│       │   │   │           │   ├── QuizResult.java
│       │   │   │           │   ├── Subject.java
│       │   │   │           │   ├── Test.java
│       │   │   │           │   └── User.java
│       │   │   │           ├── repository
│       │   │   │           │   ├── OtpCodeRepository.java
│       │   │   │           │   ├── QuestionRepository.java
│       │   │   │           │   ├── QuizResultRepository.java
│       │   │   │           │   ├── SubjectRepository.java
│       │   │   │           │   ├── TestRepository.java
│       │   │   │           │   └── UserRepository.java
│       │   │   │           ├── security
│       │   │   │           │   ├── JwtFilter.java
│       │   │   │           │   └── JwtUtil.java
│       │   │   │           ├── service
│       │   │   │           │   ├── EmailService.java
│       │   │   │           │   ├── OtpService.java
│       │   │   │           │   ├── QuizService.java
│       │   │   │           │   ├── SubjectService.java
│       │   │   │           │   └── UserService.java
│       │   │   │           └── ExamplatformApplication.java
│       │   │   └── resources
│       │   │       └── application.properties
│       │   └── test
│       │       └── java
│       │           └── com
│       │               └── examplatform
│       │                   └── ExamplatformApplicationTests.java
│       ├── target
│       │   ├── classes
│       │   │   ├── com
│       │   │   │   └── examplatform
│       │   │   │       ├── config
│       │   │   │       │   ├── DataSeeder.class
│       │   │   │       │   ├── DataSeeder$QuestionSeed.class
│       │   │   │       │   ├── SecurityConfig.class
│       │   │   │       │   ├── WebConfig.class
│       │   │   │       │   └── WebConfig$1.class
│       │   │   │       ├── controller
│       │   │   │       │   ├── AuthController.class
│       │   │   │       │   ├── QuizController.class
│       │   │   │       │   ├── SubjectController.class
│       │   │   │       │   ├── TeacherController.class
│       │   │   │       │   └── TestController.class
│       │   │   │       ├── model
│       │   │   │       │   ├── OtpCode.class
│       │   │   │       │   ├── Question.class
│       │   │   │       │   ├── QuizResult.class
│       │   │   │       │   ├── Subject.class
│       │   │   │       │   ├── Test.class
│       │   │   │       │   └── User.class
│       │   │   │       ├── repository
│       │   │   │       │   ├── OtpCodeRepository.class
│       │   │   │       │   ├── QuestionRepository.class
│       │   │   │       │   ├── QuizResultRepository.class
│       │   │   │       │   ├── SubjectRepository.class
│       │   │   │       │   ├── TestRepository.class
│       │   │   │       │   └── UserRepository.class
│       │   │   │       ├── security
│       │   │   │       │   ├── JwtFilter.class
│       │   │   │       │   └── JwtUtil.class
│       │   │   │       ├── service
│       │   │   │       │   ├── EmailService.class
│       │   │   │       │   ├── OtpService.class
│       │   │   │       │   ├── QuizService.class
│       │   │   │       │   ├── SubjectService.class
│       │   │   │       │   └── UserService.class
│       │   │   │       └── ExamplatformApplication.class
│       │   │   └── application.properties
│       │   ├── generated-sources
│       │   │   └── annotations
│       │   ├── generated-test-sources
│       │   │   └── test-annotations
│       │   ├── maven-status
│       │   │   └── maven-compiler-plugin
│       │   │       ├── compile
│       │   │       │   └── default-compile
│       │   │       │       ├── createdFiles.lst
│       │   │       │       └── inputFiles.lst
│       │   │       └── testCompile
│       │   │           └── default-testCompile
│       │   │               ├── createdFiles.lst
│       │   │               └── inputFiles.lst
│       │   ├── surefire-reports
│       │   │   ├── com.examplatform.ExamplatformApplicationTests.txt
│       │   │   └── TEST-com.examplatform.ExamplatformApplicationTests.xml
│       │   └── test-classes
│       │       └── com
│       │           └── examplatform
│       │               └── ExamplatformApplicationTests.class
│       ├── .gitattributes
│       ├── .gitignore
│       ├── HELP.md
│       ├── mvnw
│       ├── mvnw.cmd
│       ├── pom.xml
│       ├── run.err
│       └── run.log
├── frontend
│   ├── public
│   │   ├── pete.png
│   │   └── vite.png
│   ├── src
│   │   ├── api
│   │   │   └── api.js
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── components
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PageTransition.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── Snackbar.jsx
│   │   │   └── SubjectFab.jsx
│   │   ├── context
│   │   │   ├── SnackbarContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── data
│   │   │   └── subjects.js
│   │   ├── pages
│   │   │   ├── AttemptDetail.jsx
│   │   │   ├── AttemptHistory.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Quiz.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── SubjectTests.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── TeacherResults.jsx
│   │   │   ├── TeacherStudentResults.jsx
│   │   │   ├── TeacherSubject.jsx
│   │   │   └── TeacherTestDetail.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   └── vite.config.js
└── structure.md
