package com.examplatform.config;

import com.examplatform.model.Question;
import com.examplatform.model.Subject;
import com.examplatform.model.Test;
import com.examplatform.repository.QuestionRepository;
import com.examplatform.repository.SubjectRepository;
import com.examplatform.repository.TestRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final String SYSTEM_USER = "System";

    private final SubjectRepository subjectRepository;
    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;

    public DataSeeder(
            SubjectRepository subjectRepository,
            TestRepository testRepository,
            QuestionRepository questionRepository
    ) {
        this.subjectRepository = subjectRepository;
        this.testRepository = testRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    public void run(String... args) {
        Map<String, String> defaultSubjects = new LinkedHashMap<>();
        defaultSubjects.put("DSA", "Data structures, algorithms, and complexity fundamentals.");
        defaultSubjects.put("DBMS", "Database concepts, SQL, indexing, and normalization.");
        defaultSubjects.put("OS", "Operating systems, scheduling, memory, and processes.");
        defaultSubjects.put("CN", "Computer networks, protocols, routing, and transport.");
        defaultSubjects.put("OOP", "Object-oriented programming principles and design.");
        defaultSubjects.put("JAVA", "Core Java language and standard library basics.");
        defaultSubjects.put("COA", "Computer organization, instruction cycles, and architecture.");
        defaultSubjects.put("AI", "Artificial intelligence basics, search, and learning methods.");
        defaultSubjects.put("SE", "Software engineering process, models, testing, and quality.");

        for (Map.Entry<String, String> subjectEntry : defaultSubjects.entrySet()) {
            String subjectName = subjectEntry.getKey();
            String subjectDescription = subjectEntry.getValue();

            seedSubject(subjectName, subjectDescription);

            String normalizedSubject = subjectName.trim().toLowerCase();
            for (int i = 1; i <= 3; i++) {
            String testName = subjectName + " Basics Test " + i;
            seedTestAndQuestions(normalizedSubject, testName, i);
            }
        }
        }

        private void seedSubject(String name, String description) {
        if (subjectRepository.existsByNameIgnoreCase(name)) {
            return;
        }

        Subject subject = new Subject();
        subject.setName(name);
        subject.setDescription(description);
        subject.setCreatedBy(SYSTEM_USER);
        subject.setCreatedAt(new Date());
        subjectRepository.save(subject);
        }

        private void seedTestAndQuestions(String normalizedSubject, String testName, int seedIndex) {
        Test test;
        if (testRepository.existsBySubjectAndTestNameIgnoreCase(normalizedSubject, testName)) {
            test = testRepository.findBySubject(normalizedSubject)
                .stream()
                .filter(t -> t.getTestName() != null && t.getTestName().equalsIgnoreCase(testName))
                .findFirst()
                .orElse(null);
        } else {
            test = new Test(normalizedSubject, testName, SYSTEM_USER, new Date());
            test = testRepository.save(test);
        }

        if (test == null || test.getId() == null) {
            return;
        }

        List<Question> existingQuestions = questionRepository.findByTestId(test.getId());
        if (!existingQuestions.isEmpty()) {
            if (!shouldReplaceSeedQuestions(test, existingQuestions)) {
                return;
            }
            questionRepository.deleteByTestId(test.getId());
        }

        List<QuestionSeed> questionSeeds = getQuestionBank(normalizedSubject);
        String testId = test.getId();
        List<Question> questions = questionSeeds.stream()
            .map(seed -> buildQuestion(normalizedSubject, testId, testName, seedIndex, seed))
            .toList();

        questionRepository.saveAll(questions);
        }

        private List<QuestionSeed> getQuestionBank(String normalizedSubject) {
        return switch (normalizedSubject.toUpperCase()) {
            case "DSA" -> List.of(
                new QuestionSeed(
                    "What is the time complexity of binary search in a sorted array?",
                    List.of("O(log n)", "O(n)", "O(n log n)", "O(1)"),
                    "O(log n)",
                    "Binary search halves the search space on each step."
                ),
                new QuestionSeed(
                    "Which data structure follows LIFO order?",
                    List.of("Queue", "Stack", "Heap", "Graph"),
                    "Stack",
                    "LIFO means Last In First Out, which is the behavior of a stack."
                ),
                new QuestionSeed(
                    "Which traversal of a BST gives sorted order?",
                    List.of("Preorder", "Inorder", "Postorder", "Level order"),
                    "Inorder",
                    "Inorder traversal of BST visits keys in ascending order."
                ),
                new QuestionSeed(
                    "What is the worst-case time complexity of quicksort?",
                    List.of("O(n)", "O(n log n)", "O(n^2)", "O(log n)"),
                    "O(n^2)",
                    "Worst case appears when pivots repeatedly create unbalanced partitions."
                ),
                new QuestionSeed(
                    "Which structure is ideal for BFS traversal?",
                    List.of("Stack", "Queue", "Priority Queue", "Set"),
                    "Queue",
                    "BFS explores level by level using a queue."
                )
            );
            case "DBMS" -> List.of(
                new QuestionSeed(
                    "What is normalization in DBMS?",
                    List.of("Data backup", "Process of reducing redundancy", "Sorting rows", "Encrypting tables"),
                    "Process of reducing redundancy",
                    "Normalization organizes data to reduce duplication and anomalies."
                ),
                new QuestionSeed(
                    "What does a primary key do?",
                    List.of("Stores duplicates", "Identifies each row uniquely", "Sorts records", "Creates backups"),
                    "Identifies each row uniquely",
                    "Primary key enforces uniqueness and non-null for entity identity."
                ),
                new QuestionSeed(
                    "Which SQL clause filters groups after aggregation?",
                    List.of("WHERE", "ORDER BY", "HAVING", "LIMIT"),
                    "HAVING",
                    "HAVING applies conditions on grouped/aggregated data."
                ),
                new QuestionSeed(
                    "What is a foreign key?",
                    List.of("A key in another database", "A key linking two tables", "A duplicate key", "A hashed key"),
                    "A key linking two tables",
                    "Foreign key references primary key in another table."
                ),
                new QuestionSeed(
                    "Which normal form removes transitive dependency?",
                    List.of("1NF", "2NF", "3NF", "BCNF"),
                    "3NF",
                    "3NF removes transitive dependency on non-key attributes."
                )
            );
            case "OS" -> List.of(
                new QuestionSeed(
                    "What is a process in operating systems?",
                    List.of("A compiled file", "A program in execution", "A memory segment", "A thread group only"),
                    "A program in execution",
                    "A process is an active instance of a program with execution context."
                ),
                new QuestionSeed(
                    "What is deadlock?",
                    List.of("CPU overload", "Infinite loop", "Processes waiting forever for resources", "Cache miss"),
                    "Processes waiting forever for resources",
                    "Deadlock occurs when circular wait prevents progress."
                ),
                new QuestionSeed(
                    "Which scheduling algorithm can cause starvation?",
                    List.of("Round Robin", "FCFS", "Priority Scheduling", "FIFO"),
                    "Priority Scheduling",
                    "Low-priority processes may starve in strict priority scheduling."
                ),
                new QuestionSeed(
                    "What does virtual memory enable?",
                    List.of("Faster CPU", "Larger logical memory than physical RAM", "No context switch", "No page faults"),
                    "Larger logical memory than physical RAM",
                    "Virtual memory maps logical addresses and uses disk as extension."
                ),
                new QuestionSeed(
                    "Which OS component handles hardware interrupts?",
                    List.of("Shell", "Kernel", "Compiler", "Loader"),
                    "Kernel",
                    "Kernel controls interrupt handling and low-level resource management."
                )
            );
            case "CN" -> List.of(
                new QuestionSeed(
                    "Which layer of OSI handles routing?",
                    List.of("Transport", "Network", "Data Link", "Session"),
                    "Network",
                    "Routing decisions are made at the network layer."
                ),
                new QuestionSeed(
                    "What is the default port for HTTPS?",
                    List.of("80", "20", "443", "53"),
                    "443",
                    "HTTPS uses port 443 by convention."
                ),
                new QuestionSeed(
                    "Which protocol is connection-oriented?",
                    List.of("UDP", "TCP", "IP", "ICMP"),
                    "TCP",
                    "TCP establishes connection and provides reliability."
                ),
                new QuestionSeed(
                    "What is subnetting used for?",
                    List.of("Encrypting packets", "Dividing networks into smaller segments", "Increasing CPU speed", "DNS resolution"),
                    "Dividing networks into smaller segments",
                    "Subnetting improves address management and network efficiency."
                ),
                new QuestionSeed(
                    "Which device primarily operates at Layer 2?",
                    List.of("Router", "Switch", "Gateway", "Repeater"),
                    "Switch",
                    "Switches forward frames using MAC addresses."
                )
            );
            case "OOP" -> List.of(
                new QuestionSeed(
                    "Which OOP concept bundles data and methods together?",
                    List.of("Polymorphism", "Encapsulation", "Inheritance", "Abstraction"),
                    "Encapsulation",
                    "Encapsulation combines state and behavior within a class."
                ),
                new QuestionSeed(
                    "What is method overriding?",
                    List.of("Same method in same class", "Subclass redefining parent method", "Multiple constructors", "Private inheritance"),
                    "Subclass redefining parent method",
                    "Overriding provides specialized implementation in derived classes."
                ),
                new QuestionSeed(
                    "Which principle allows one interface to have many forms?",
                    List.of("Abstraction", "Encapsulation", "Polymorphism", "Composition"),
                    "Polymorphism",
                    "Polymorphism allows common interface with different implementations."
                ),
                new QuestionSeed(
                    "What does inheritance support?",
                    List.of("Runtime memory cleanup", "Code reuse via parent-child relation", "Query optimization", "Packet switching"),
                    "Code reuse via parent-child relation",
                    "Inheritance enables reusing and extending behavior from base classes."
                ),
                new QuestionSeed(
                    "What is abstraction?",
                    List.of("Hiding implementation details", "Avoiding classes", "Avoiding methods", "Avoiding objects"),
                    "Hiding implementation details",
                    "Abstraction exposes essential behavior while hiding internal complexity."
                )
            );
            case "JAVA" -> List.of(
                new QuestionSeed(
                    "Which keyword is used to inherit a class in Java?",
                    List.of("implements", "inherits", "extends", "instanceof"),
                    "extends",
                    "Java uses extends for class inheritance."
                ),
                new QuestionSeed(
                    "What is JVM?",
                    List.of("Java Variable Method", "Java Virtual Machine", "Java Verified Module", "Just Virtual Memory"),
                    "Java Virtual Machine",
                    "JVM executes Java bytecode across platforms."
                ),
                new QuestionSeed(
                    "Which collection does not allow duplicate elements?",
                    List.of("List", "Map", "Set", "Queue"),
                    "Set",
                    "Set collections enforce uniqueness for elements."
                ),
                new QuestionSeed(
                    "What does final keyword indicate for a variable?",
                    List.of("It is static", "It can be changed often", "It cannot be reassigned", "It is private"),
                    "It cannot be reassigned",
                    "final variable can be assigned once."
                ),
                new QuestionSeed(
                    "Which exception is unchecked?",
                    List.of("IOException", "SQLException", "RuntimeException", "ClassNotFoundException"),
                    "RuntimeException",
                    "RuntimeException and its subclasses are unchecked."
                )
            );
            case "COA" -> List.of(
                new QuestionSeed(
                    "What does ALU stand for?",
                    List.of("Arithmetic Logic Unit", "Array Logic Utility", "Advanced Load Unit", "Address Link Unit"),
                    "Arithmetic Logic Unit",
                    "ALU performs arithmetic and logical operations in CPU."
                ),
                new QuestionSeed(
                    "Which memory is fastest among these?",
                    List.of("RAM", "SSD", "Cache", "HDD"),
                    "Cache",
                    "Cache memory is closest to CPU and has lowest access latency."
                ),
                new QuestionSeed(
                    "What is the role of the control unit?",
                    List.of("Store data", "Execute arithmetic", "Direct operations of processor", "Manage files"),
                    "Direct operations of processor",
                    "Control unit coordinates instruction execution flow."
                ),
                new QuestionSeed(
                    "What is pipelining in CPU?",
                    List.of("Compressing data", "Parallel instruction stage processing", "Encrypting instructions", "Increasing clock physically"),
                    "Parallel instruction stage processing",
                    "Pipelining overlaps instruction stages for better throughput."
                ),
                new QuestionSeed(
                    "What does ISA represent?",
                    List.of("Instruction Set Architecture", "Internal System Access", "Integrated Storage Array", "Instruction Scheduling Algorithm"),
                    "Instruction Set Architecture",
                    "ISA defines machine instructions, registers, and behavior."
                )
            );
            case "AI" -> List.of(
                new QuestionSeed(
                    "What is heuristic search?",
                    List.of("Random search", "Search guided by domain knowledge", "Only depth-first", "Only breadth-first"),
                    "Search guided by domain knowledge",
                    "Heuristics estimate promising paths to reach goal faster."
                ),
                new QuestionSeed(
                    "Which algorithm is commonly used for classification?",
                    List.of("K-Means", "Linear Regression", "Decision Tree", "Apriori"),
                    "Decision Tree",
                    "Decision trees are widely used for classification tasks."
                ),
                new QuestionSeed(
                    "What is overfitting?",
                    List.of("Model underperforms on training data", "Model performs well on training but poorly on unseen data", "Data normalization", "Feature scaling"),
                    "Model performs well on training but poorly on unseen data",
                    "Overfitting means poor generalization beyond training data."
                ),
                new QuestionSeed(
                    "What is supervised learning based on?",
                    List.of("Unlabeled data", "Labeled input-output pairs", "Only reinforcement", "Only clustering"),
                    "Labeled input-output pairs",
                    "Supervised learning learns mapping from labeled examples."
                ),
                new QuestionSeed(
                    "What is the purpose of a loss function?",
                    List.of("Store model", "Measure prediction error", "Increase memory", "Create features"),
                    "Measure prediction error",
                    "Loss quantifies how far predictions are from true values."
                )
            );
            case "SE" -> List.of(
                new QuestionSeed(
                    "What is SDLC?",
                    List.of("Software Development Life Cycle", "System Data Level Code", "Secure Development Layer Control", "Source Deployment Logic Chain"),
                    "Software Development Life Cycle",
                    "SDLC describes phases from requirement to maintenance."
                ),
                new QuestionSeed(
                    "Which model delivers software in small increments?",
                    List.of("Waterfall", "Spiral", "Incremental", "V-Model"),
                    "Incremental",
                    "Incremental model builds and delivers in iterative increments."
                ),
                new QuestionSeed(
                    "What is unit testing?",
                    List.of("Testing whole system", "Testing individual components", "User acceptance testing", "Security auditing"),
                    "Testing individual components",
                    "Unit testing validates small isolated pieces of code."
                ),
                new QuestionSeed(
                    "What does requirement traceability ensure?",
                    List.of("Faster CPU", "Requirements are linked across lifecycle", "No documentation", "No testing"),
                    "Requirements are linked across lifecycle",
                    "Traceability maps requirements to design, code, and tests."
                ),
                new QuestionSeed(
                    "What is technical debt?",
                    List.of("Database backup", "Cost of quick design choices to be fixed later", "Hardware cost", "Team size"),
                    "Cost of quick design choices to be fixed later",
                    "Technical debt is future rework caused by short-term tradeoffs."
                )
            );
            default -> List.of(
                new QuestionSeed(
                    "What is the core concept of " + normalizedSubject.toUpperCase() + "?",
                    List.of("Concept A", "Concept B", "Concept C", "Concept D"),
                    "Concept A",
                    "Default seeded question for this subject."
                ),
                new QuestionSeed(
                    "Which statement best describes " + normalizedSubject.toUpperCase() + " fundamentals?",
                    List.of("Statement A", "Statement B", "Statement C", "Statement D"),
                    "Statement B",
                    "Default seeded question for this subject."
                ),
                new QuestionSeed(
                    "Choose the correct option related to " + normalizedSubject.toUpperCase() + ".",
                    List.of("Option A", "Option B", "Option C", "Option D"),
                    "Option C",
                    "Default seeded question for this subject."
                ),
                new QuestionSeed(
                    "Identify the valid point about " + normalizedSubject.toUpperCase() + ".",
                    List.of("Point A", "Point B", "Point C", "Point D"),
                    "Point D",
                    "Default seeded question for this subject."
                ),
                new QuestionSeed(
                    "Which is true in context of " + normalizedSubject.toUpperCase() + "?",
                    List.of("True A", "True B", "True C", "True D"),
                    "True A",
                    "Default seeded question for this subject."
                )
            );
        };
        }

        private Question buildQuestion(
            String subject,
            String testId,
            String testName,
            int testIndex,
            QuestionSeed questionSeed
        ) {
        Question q = new Question();
        q.setSubject(subject);
        q.setTestId(testId);
        q.setCreatedBy(SYSTEM_USER);
        q.setType("MCQ");
        q.setQuestionText(questionSeed.questionText() + " [" + testName + "]");
        q.setOptions(questionSeed.options());
        q.setCorrectAnswer(questionSeed.correctAnswer());
        q.setExplanation(questionSeed.explanation() + " (Test set " + testIndex + ")");
        return q;
        }

        private boolean shouldReplaceSeedQuestions(Test test, List<Question> existingQuestions) {
        if (test == null || !SYSTEM_USER.equalsIgnoreCase(test.getCreatedBy())) {
            return false;
        }

        if (existingQuestions.size() != 5) {
            return true;
        }

        return existingQuestions.stream().anyMatch(this::isLegacySeedQuestion);
        }

        private boolean isLegacySeedQuestion(Question question) {
        if (question == null) {
            return false;
        }

        String explanation = question.getExplanation() == null ? "" : question.getExplanation();
        if (explanation.startsWith("Default seeded explanation")) {
            return true;
        }

        List<String> options = question.getOptions();
        return options != null && options.stream().anyMatch(option -> option != null && option.matches("Option [A-D]"));
        }

        private record QuestionSeed(
            String questionText,
            List<String> options,
            String correctAnswer,
            String explanation
        ) {}
}
