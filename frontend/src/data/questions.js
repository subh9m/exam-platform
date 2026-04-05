export const questionBank = {
  DSA: [
    {
      questionText: "What is the time complexity of binary search in a sorted array?",
      options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
      correctAnswer: "O(log n)",
    },
    {
      questionText: "Which data structure follows LIFO order?",
      options: ["Queue", "Stack", "Heap", "Graph"],
      correctAnswer: "Stack",
    },
    {
      questionText: "Which traversal of a BST gives sorted order?",
      options: ["Preorder", "Inorder", "Postorder", "Level order"],
      correctAnswer: "Inorder",
    },
    {
      questionText: "What is the worst-case complexity of quicksort?",
      options: ["O(n)", "O(n log n)", "O(n^2)", "O(log n)"],
      correctAnswer: "O(n^2)",
    },
    {
      questionText: "BFS uses which data structure internally?",
      options: ["Stack", "Queue", "Set", "Tree"],
      correctAnswer: "Queue",
    },
    {
      questionText: "A min-heap is best used for?",
      options: ["Fast max lookup", "Priority queue", "Hashing", "Graph traversal"],
      correctAnswer: "Priority queue",
    },
    {
      questionText: "Which algorithm is used for shortest path with non-negative weights?",
      options: ["Kruskal", "Prim", "Dijkstra", "DFS"],
      correctAnswer: "Dijkstra",
    },
    {
      questionText: "In linked list insertion at head, complexity is?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctAnswer: "O(1)",
    },
    {
      questionText: "Which structure helps detect cycles in DFS recursion?",
      options: ["Queue", "Visited + recursion stack", "Priority queue", "Map only"],
      correctAnswer: "Visited + recursion stack",
    },
    {
      questionText: "Merge sort is based on which paradigm?",
      options: ["Greedy", "Dynamic programming", "Divide and conquer", "Backtracking"],
      correctAnswer: "Divide and conquer",
    },
    {
      questionText: "Which search works on unsorted data without preprocessing?",
      options: ["Binary search", "Jump search", "Linear search", "Interpolation search"],
      correctAnswer: "Linear search",
    },
    {
      questionText: "Which graph representation is space efficient for sparse graphs?",
      options: ["Adjacency matrix", "Adjacency list", "Incidence matrix", "Edge table with matrix"],
      correctAnswer: "Adjacency list",
    },
    {
      questionText: "Amortized time complexity of append in dynamic arrays is usually?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
      correctAnswer: "O(1)",
    },
    {
      questionText: "Which algorithm detects cycle in linked list using two pointers?",
      options: ["Dijkstra", "KMP", "Floyd cycle detection", "Bellman-Ford"],
      correctAnswer: "Floyd cycle detection",
    },
    {
      questionText: "Kruskal's algorithm is primarily used to find?",
      options: ["Shortest path tree", "Minimum spanning tree", "Topological order", "Strong components"],
      correctAnswer: "Minimum spanning tree",
    },
  ],
  DBMS: [
    {
      questionText: "What is normalization in DBMS?",
      options: ["Data backup", "Reducing redundancy", "Sorting records", "Encryption"],
      correctAnswer: "Reducing redundancy",
    },
    {
      questionText: "What does a primary key ensure?",
      options: ["Nullable values", "Duplicate rows", "Unique row identity", "Sorted output"],
      correctAnswer: "Unique row identity",
    },
    {
      questionText: "Which clause filters aggregated groups?",
      options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"],
      correctAnswer: "HAVING",
    },
    {
      questionText: "A foreign key is used to?",
      options: ["Encrypt table", "Join related tables", "Sort rows", "Index all columns"],
      correctAnswer: "Join related tables",
    },
    {
      questionText: "3NF removes which dependency?",
      options: ["Functional dependency", "Partial dependency", "Transitive dependency", "Multivalued dependency"],
      correctAnswer: "Transitive dependency",
    },
    {
      questionText: "Which SQL command retrieves rows?",
      options: ["INSERT", "UPDATE", "SELECT", "DELETE"],
      correctAnswer: "SELECT",
    },
    {
      questionText: "An index mainly improves?",
      options: ["Write speed", "Read/query speed", "Data encryption", "Normalization"],
      correctAnswer: "Read/query speed",
    },
    {
      questionText: "ACID property A stands for?",
      options: ["Availability", "Atomicity", "Aggregation", "Autonomy"],
      correctAnswer: "Atomicity",
    },
    {
      questionText: "Which join returns matching rows from both tables?",
      options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN only"],
      correctAnswer: "INNER JOIN",
    },
    {
      questionText: "Which normal form removes repeating groups?",
      options: ["1NF", "2NF", "3NF", "BCNF"],
      correctAnswer: "1NF",
    },
    {
      questionText: "A transaction rollback means?",
      options: ["Commit changes", "Revert uncommitted changes", "Archive data", "Reindex tables"],
      correctAnswer: "Revert uncommitted changes",
    },
    {
      questionText: "MongoDB is classified as?",
      options: ["Relational DB", "Document DB", "Column DB", "Graph DB only"],
      correctAnswer: "Document DB",
    },
    {
      questionText: "ACID property I stands for?",
      options: ["Iteration", "Isolation", "Indexing", "Integrity"],
      correctAnswer: "Isolation",
    },
    {
      questionText: "Which SQL command removes table structure and data permanently?",
      options: ["DELETE", "TRUNCATE", "DROP", "REMOVE"],
      correctAnswer: "DROP",
    },
    {
      questionText: "A candidate key is best described as?",
      options: ["Any foreign key", "A minimal unique key", "A nullable key", "A multi-valued key"],
      correctAnswer: "A minimal unique key",
    },
  ],
  OS: [
    {
      questionText: "What is a process?",
      options: ["Compiled binary", "Program in execution", "Disk partition", "Thread scheduler"],
      correctAnswer: "Program in execution",
    },
    {
      questionText: "Deadlock occurs when?",
      options: ["CPU idle", "Circular resource wait", "Memory full", "IO bound only"],
      correctAnswer: "Circular resource wait",
    },
    {
      questionText: "Which scheduling can cause starvation?",
      options: ["Round Robin", "FCFS", "Priority", "FIFO queue only"],
      correctAnswer: "Priority",
    },
    {
      questionText: "Virtual memory allows?",
      options: ["Unlimited CPU", "Larger logical memory", "No paging", "No context switch"],
      correctAnswer: "Larger logical memory",
    },
    {
      questionText: "Kernel is responsible for?",
      options: ["Text editing", "Hardware/resource management", "Email delivery", "UI theming"],
      correctAnswer: "Hardware/resource management",
    },
    {
      questionText: "Context switch is switching between?",
      options: ["Users", "Processes/threads", "Files", "Disks"],
      correctAnswer: "Processes/threads",
    },
    {
      questionText: "Paging uses fixed-size blocks called?",
      options: ["Segments", "Pages", "Clusters", "Frames only in disk"],
      correctAnswer: "Pages",
    },
    {
      questionText: "Semaphore is used for?",
      options: ["Compression", "Synchronization", "Routing", "Encryption"],
      correctAnswer: "Synchronization",
    },
    {
      questionText: "Thrashing is due to?",
      options: ["Excessive paging", "CPU overheating", "Deadlock", "Network congestion"],
      correctAnswer: "Excessive paging",
    },
    {
      questionText: "Round Robin uses what key parameter?",
      options: ["Priority", "Time quantum", "Burst sort only", "Deadline only"],
      correctAnswer: "Time quantum",
    },
    {
      questionText: "A thread shares with same process threads?",
      options: ["Everything except stack", "Nothing", "Different code", "Different heap"],
      correctAnswer: "Everything except stack",
    },
    {
      questionText: "Which is non-preemptive?",
      options: ["SRTF", "Round Robin", "FCFS", "Priority preemptive"],
      correctAnswer: "FCFS",
    },
    {
      questionText: "Belady's anomaly is associated with which page replacement algorithm?",
      options: ["LRU", "Optimal", "FIFO", "Clock"],
      correctAnswer: "FIFO",
    },
    {
      questionText: "In Unix-like systems, which system call creates a child process?",
      options: ["spawn", "fork", "exec", "cloneThread"],
      correctAnswer: "fork",
    },
    {
      questionText: "Mutual exclusion ensures that?",
      options: ["All processes run together", "Only one process enters critical section at a time", "No context switching", "No deadlocks occur"],
      correctAnswer: "Only one process enters critical section at a time",
    },
  ],
  CN: [
    {
      questionText: "OSI layer for routing is?",
      options: ["Transport", "Network", "Session", "Data Link"],
      correctAnswer: "Network",
    },
    {
      questionText: "Default HTTPS port is?",
      options: ["80", "443", "21", "25"],
      correctAnswer: "443",
    },
    {
      questionText: "Connection-oriented protocol is?",
      options: ["UDP", "TCP", "ICMP", "IP"],
      correctAnswer: "TCP",
    },
    {
      questionText: "Subnetting helps in?",
      options: ["Encrypting traffic", "Network segmentation", "DNS resolution only", "CPU scheduling"],
      correctAnswer: "Network segmentation",
    },
    {
      questionText: "Layer-2 device is?",
      options: ["Router", "Switch", "Gateway", "Firewall"],
      correctAnswer: "Switch",
    },
    {
      questionText: "DNS translates?",
      options: ["IP to MAC", "Domain to IP", "HTTP to TCP", "ARP to IP"],
      correctAnswer: "Domain to IP",
    },
    {
      questionText: "Packet loss at transport is recovered by?",
      options: ["UDP retries", "TCP retransmission", "IP reroute always", "ARP refresh"],
      correctAnswer: "TCP retransmission",
    },
    {
      questionText: "MAC address operates at?",
      options: ["Application", "Network", "Data Link", "Physical only"],
      correctAnswer: "Data Link",
    },
    {
      questionText: "HTTP is built over?",
      options: ["UDP", "TCP", "ICMP", "ARP"],
      correctAnswer: "TCP",
    },
    {
      questionText: "CIDR notation /24 means?",
      options: ["24 hosts", "24 network bits", "24 routers", "24 ports"],
      correctAnswer: "24 network bits",
    },
    {
      questionText: "Which protocol resolves MAC from IP?",
      options: ["DNS", "ARP", "DHCP", "NAT"],
      correctAnswer: "ARP",
    },
    {
      questionText: "NAT is used to?",
      options: ["Encrypt packets", "Translate private/public IP", "Route by MAC", "Reduce latency"],
      correctAnswer: "Translate private/public IP",
    },
    {
      questionText: "TCP connection establishment uses which mechanism?",
      options: ["Two-way handshake", "Three-way handshake", "Four-way handshake", "Broadcast ack"],
      correctAnswer: "Three-way handshake",
    },
    {
      questionText: "TTL field in IP packets mainly prevents?",
      options: ["Packet encryption", "Routing loops", "Port conflicts", "Checksum errors"],
      correctAnswer: "Routing loops",
    },
    {
      questionText: "DHCP is responsible for?",
      options: ["Static routing", "Automatic IP assignment", "Domain encryption", "MAC translation"],
      correctAnswer: "Automatic IP assignment",
    },
  ],
  OOP: [
    {
      questionText: "Bundling data and methods is?",
      options: ["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"],
      correctAnswer: "Encapsulation",
    },
    {
      questionText: "Overriding means?",
      options: ["Same method in same class", "Subclass redefining parent method", "Constructor chaining", "Private inheritance"],
      correctAnswer: "Subclass redefining parent method",
    },
    {
      questionText: "One interface, many forms is?",
      options: ["Composition", "Abstraction", "Polymorphism", "Aggregation"],
      correctAnswer: "Polymorphism",
    },
    {
      questionText: "Inheritance helps with?",
      options: ["Encryption", "Code reuse", "Indexing", "Serialization"],
      correctAnswer: "Code reuse",
    },
    {
      questionText: "Abstraction means?",
      options: ["Expose internals", "Hide implementation details", "Avoid classes", "Avoid methods"],
      correctAnswer: "Hide implementation details",
    },
    {
      questionText: "Constructor is called when?",
      options: ["Object creation", "Method override", "Class import", "GC run"],
      correctAnswer: "Object creation",
    },
    {
      questionText: "Method overloading is?",
      options: ["Same name, different parameters", "Same name, same params", "Only inheritance", "Only interfaces"],
      correctAnswer: "Same name, different parameters",
    },
    {
      questionText: "Association between objects implies?",
      options: ["No relation", "Has-a relation", "Is-a relation only", "Compile error"],
      correctAnswer: "Has-a relation",
    },
    {
      questionText: "A class is?",
      options: ["An object instance", "Blueprint for objects", "A database table only", "A thread"],
      correctAnswer: "Blueprint for objects",
    },
    {
      questionText: "Interface primarily provides?",
      options: ["State storage", "Behavior contract", "Database mapping", "Thread lock"],
      correctAnswer: "Behavior contract",
    },
    {
      questionText: "Access modifier for widest visibility is?",
      options: ["private", "protected", "public", "package-private"],
      correctAnswer: "public",
    },
    {
      questionText: "Final class in Java can be?",
      options: ["Inherited", "Not inherited", "Instantiated only once", "Abstract"],
      correctAnswer: "Not inherited",
    },
    {
      questionText: "Runtime polymorphism in OOP is mainly achieved through?",
      options: ["Method overriding", "Method overloading", "Constructors", "Static binding"],
      correctAnswer: "Method overriding",
    },
    {
      questionText: "The this keyword in OOP usually refers to?",
      options: ["Parent class object", "Current object", "Class loader", "Static context only"],
      correctAnswer: "Current object",
    },
    {
      questionText: "An abstract class can contain?",
      options: ["Only abstract methods", "Only concrete methods", "Both abstract and concrete methods", "No methods"],
      correctAnswer: "Both abstract and concrete methods",
    },
  ],
  JAVA: [
    {
      questionText: "Keyword used for class inheritance in Java is?",
      options: ["implements", "extends", "inherits", "instanceof"],
      correctAnswer: "extends",
    },
    {
      questionText: "JVM stands for?",
      options: ["Java Variable Machine", "Java Virtual Machine", "Just Verified Module", "Java Vendor Model"],
      correctAnswer: "Java Virtual Machine",
    },
    {
      questionText: "Which collection disallows duplicates?",
      options: ["List", "Set", "Queue", "ArrayList"],
      correctAnswer: "Set",
    },
    {
      questionText: "final variable can be?",
      options: ["Reassigned many times", "Assigned once", "Null only", "Static only"],
      correctAnswer: "Assigned once",
    },
    {
      questionText: "Unchecked exception example?",
      options: ["IOException", "SQLException", "RuntimeException", "ClassNotFoundException"],
      correctAnswer: "RuntimeException",
    },
    {
      questionText: "String in Java is?",
      options: ["Mutable", "Immutable", "Numeric", "Primitive"],
      correctAnswer: "Immutable",
    },
    {
      questionText: "Java supports multiple inheritance via?",
      options: ["Classes", "Interfaces", "Constructors", "Packages"],
      correctAnswer: "Interfaces",
    },
    {
      questionText: "Entry method in Java app is?",
      options: ["start", "run", "main", "init"],
      correctAnswer: "main",
    },
    {
      questionText: "Array index in Java starts at?",
      options: ["1", "0", "-1", "Depends"],
      correctAnswer: "0",
    },
    {
      questionText: "Wrapper for int primitive is?",
      options: ["Integer", "Int", "Number", "Long"],
      correctAnswer: "Integer",
    },
    {
      questionText: "Which package is imported by default?",
      options: ["java.util", "java.lang", "java.io", "java.net"],
      correctAnswer: "java.lang",
    },
    {
      questionText: "Garbage collection in Java handles?",
      options: ["Compilation", "Memory reclamation", "Network routing", "Thread scheduling"],
      correctAnswer: "Memory reclamation",
    },
    {
      questionText: "HashMap in Java allows?",
      options: ["No nulls at all", "One null key and multiple null values", "Only null keys", "Only null values"],
      correctAnswer: "One null key and multiple null values",
    },
    {
      questionText: "If two objects are equal by equals(), then hashCode() should be?",
      options: ["Different always", "Same", "Zero", "Random"],
      correctAnswer: "Same",
    },
    {
      questionText: "Average random access complexity in ArrayList is?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
      correctAnswer: "O(1)",
    },
  ],
  COA: [
    {
      questionText: "ALU stands for?",
      options: ["Arithmetic Logic Unit", "Array Logic Unit", "Advanced Load Unit", "Address Link Unit"],
      correctAnswer: "Arithmetic Logic Unit",
    },
    {
      questionText: "Fastest memory among these is?",
      options: ["RAM", "Cache", "SSD", "HDD"],
      correctAnswer: "Cache",
    },
    {
      questionText: "Control unit does what?",
      options: ["Stores files", "Coordinates CPU operations", "Renders UI", "Encrypts data"],
      correctAnswer: "Coordinates CPU operations",
    },
    {
      questionText: "CPU pipelining improves?",
      options: ["Latency only", "Instruction throughput", "Disk speed", "GPU clocks"],
      correctAnswer: "Instruction throughput",
    },
    {
      questionText: "ISA means?",
      options: ["Instruction Set Architecture", "Integrated System Access", "Instruction Sync Array", "I/O Sequence Adapter"],
      correctAnswer: "Instruction Set Architecture",
    },
    {
      questionText: "Program Counter holds?",
      options: ["Current data", "Next instruction address", "Stack top", "Cache line"],
      correctAnswer: "Next instruction address",
    },
    {
      questionText: "Registers are?",
      options: ["Slow memory", "Small fastest CPU storage", "Disk partitions", "Network buffers"],
      correctAnswer: "Small fastest CPU storage",
    },
    {
      questionText: "Two's complement is used for?",
      options: ["Floating point only", "Signed integer representation", "Character encoding", "Address mapping"],
      correctAnswer: "Signed integer representation",
    },
    {
      questionText: "Cache hit means?",
      options: ["Data found in cache", "Data lost", "Cache full", "CPU halted"],
      correctAnswer: "Data found in cache",
    },
    {
      questionText: "Word size of CPU affects?",
      options: ["Only display", "Data processed per operation", "Network speed", "Disk IOPS"],
      correctAnswer: "Data processed per operation",
    },
    {
      questionText: "Primary memory is?",
      options: ["RAM", "HDD", "SSD", "Tape"],
      correctAnswer: "RAM",
    },
    {
      questionText: "Instruction cycle includes fetch, decode, and?",
      options: ["Encrypt", "Execute", "Compress", "Transmit"],
      correctAnswer: "Execute",
    },
    {
      questionText: "Von Neumann bottleneck refers to limitation of?",
      options: ["GPU cores", "Shared instruction-data bus bandwidth", "Cache associativity", "Clock frequency only"],
      correctAnswer: "Shared instruction-data bus bandwidth",
    },
    {
      questionText: "Endianness in computer architecture describes?",
      options: ["Instruction format", "Byte order in memory", "Clock polarity", "Cache replacement policy"],
      correctAnswer: "Byte order in memory",
    },
    {
      questionText: "Interrupt-driven I/O improves performance by reducing?",
      options: ["Compilation time", "Polling overhead", "Cache misses", "Disk capacity"],
      correctAnswer: "Polling overhead",
    },
  ],
  AI: [
    {
      questionText: "Heuristic search means?",
      options: ["Random search", "Guided by estimate", "Only brute-force", "Only DFS"],
      correctAnswer: "Guided by estimate",
    },
    {
      questionText: "Common classification algorithm is?",
      options: ["K-Means", "Decision Tree", "PCA", "Apriori"],
      correctAnswer: "Decision Tree",
    },
    {
      questionText: "Overfitting is when model?",
      options: ["Fails on training data", "Performs poorly on unseen data", "Uses small dataset", "Trains slowly"],
      correctAnswer: "Performs poorly on unseen data",
    },
    {
      questionText: "Supervised learning needs?",
      options: ["Unlabeled data", "Labeled examples", "No data", "Only rewards"],
      correctAnswer: "Labeled examples",
    },
    {
      questionText: "Loss function measures?",
      options: ["Prediction error", "Model size", "Dataset size", "Training time"],
      correctAnswer: "Prediction error",
    },
    {
      questionText: "A* search combines?",
      options: ["g(n) only", "h(n) only", "g(n)+h(n)", "Random scoring"],
      correctAnswer: "g(n)+h(n)",
    },
    {
      questionText: "Recall measures?",
      options: ["True positives found", "Precision of negatives", "Training speed", "Model size"],
      correctAnswer: "True positives found",
    },
    {
      questionText: "K-Means is used for?",
      options: ["Classification", "Clustering", "Regression only", "Search trees"],
      correctAnswer: "Clustering",
    },
    {
      questionText: "Bias-variance tradeoff concerns?",
      options: ["Network bandwidth", "Generalization behavior", "Disk cache", "Compiler optimization"],
      correctAnswer: "Generalization behavior",
    },
    {
      questionText: "Confusion matrix is for?",
      options: ["Sorting arrays", "Evaluating classifiers", "Database joins", "Route planning"],
      correctAnswer: "Evaluating classifiers",
    },
    {
      questionText: "Gradient descent updates parameters by?",
      options: ["Random jumps", "Opposite gradient direction", "Only increasing values", "Static assignment"],
      correctAnswer: "Opposite gradient direction",
    },
    {
      questionText: "Reinforcement learning uses?",
      options: ["Label pairs", "Reward signals", "Only clustering", "No feedback"],
      correctAnswer: "Reward signals",
    },
    {
      questionText: "Precision in classification is defined as?",
      options: ["TP / (TP + FP)", "TP / (TP + FN)", "TN / (TN + FP)", "(TP + TN) / total"],
      correctAnswer: "TP / (TP + FP)",
    },
    {
      questionText: "Underfitting is commonly associated with?",
      options: ["High variance", "High bias", "Data leakage", "Over-parameterization"],
      correctAnswer: "High bias",
    },
    {
      questionText: "Validation set is mainly used to?",
      options: ["Train final model weights", "Tune model hyperparameters", "Replace test set", "Store raw data"],
      correctAnswer: "Tune model hyperparameters",
    },
  ],
  SE: [
    {
      questionText: "SDLC stands for?",
      options: ["Software Development Life Cycle", "System Data Logic Chain", "Secure Dev Layer Control", "Source Design Life Cycle"],
      correctAnswer: "Software Development Life Cycle",
    },
    {
      questionText: "Incremental model delivers software in?",
      options: ["One release only", "Small increments", "No releases", "Random phases"],
      correctAnswer: "Small increments",
    },
    {
      questionText: "Unit testing targets?",
      options: ["Entire system", "Small isolated units", "Only UI", "Only database"],
      correctAnswer: "Small isolated units",
    },
    {
      questionText: "Requirement traceability ensures?",
      options: ["No docs", "Reqs linked across lifecycle", "No testing", "No design"],
      correctAnswer: "Reqs linked across lifecycle",
    },
    {
      questionText: "Technical debt is?",
      options: ["Cloud bill", "Future rework from shortcuts", "Hardware tax", "Licensing fee"],
      correctAnswer: "Future rework from shortcuts",
    },
    {
      questionText: "Agile emphasizes?",
      options: ["Rigid long cycles", "Iterative collaboration", "No customer feedback", "No testing"],
      correctAnswer: "Iterative collaboration",
    },
    {
      questionText: "Regression testing checks?",
      options: ["New feature only", "Old features still work", "Load only", "Security only"],
      correctAnswer: "Old features still work",
    },
    {
      questionText: "Code review primarily improves?",
      options: ["Team size", "Code quality", "CPU speed", "Database size"],
      correctAnswer: "Code quality",
    },
    {
      questionText: "UAT stands for?",
      options: ["Unified App Test", "User Acceptance Testing", "Usage Analysis Test", "Update Automation Tool"],
      correctAnswer: "User Acceptance Testing",
    },
    {
      questionText: "Waterfall model is?",
      options: ["Highly iterative", "Sequential phase model", "No documentation", "Only for AI"],
      correctAnswer: "Sequential phase model",
    },
    {
      questionText: "CI in DevOps means?",
      options: ["Continuous Integration", "Code Inspection", "Configuration Isolation", "Component Iteration"],
      correctAnswer: "Continuous Integration",
    },
    {
      questionText: "A bug lifecycle starts when bug is?",
      options: ["Deleted", "Reported", "Merged", "Compiled"],
      correctAnswer: "Reported",
    },
    {
      questionText: "A sprint in Scrum is typically?",
      options: ["An unplanned task", "A time-boxed iteration", "A release freeze", "A defect backlog"],
      correctAnswer: "A time-boxed iteration",
    },
    {
      questionText: "Smoke testing is performed to?",
      options: ["Measure performance under load", "Verify critical build stability quickly", "Validate UX design", "Check only database schema"],
      correctAnswer: "Verify critical build stability quickly",
    },
    {
      questionText: "Version control primarily helps teams by?",
      options: ["Increasing CPU speed", "Tracking and merging code changes", "Replacing testing", "Eliminating bugs entirely"],
      correctAnswer: "Tracking and merging code changes",
    },
  ],
};
