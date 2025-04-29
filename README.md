🛡️ Deadlock Detection System

📜 Overview
This project implements a Deadlock Detection System using Resource Allocation Graph (RAG) and Wait-For Graph (WFG) methods in Python.

It models resource requests and allocations among multiple processes and detects potential deadlocks in the system dynamically.

✨ Features
✅ Detect Deadlocks based on Resource Allocation and Wait-For Graph.

✅ Graph-based visualization of processes and resources (optional extension).

✅ User-friendly input for processes, resources, and allocation matrices.

✅ Efficient detection algorithm based on cycle detection.

✅ Extensible code structure for adding deadlock prevention or recovery mechanisms.

🛠️ Tech Stack
Language: Python 3.x

Libraries:

collections

(Optional for visualization: networkx, matplotlib)

🚀 How to Run
Clone the repository:

bash
Copy
Edit
git clone https://github.com/roshan-poudhyal/Deadlock-detection.git
cd Deadlock-detection
Run the Deadlock Detection Script:

bash
Copy
Edit
python deadlock_detection.py
(replace deadlock_detection.py with your main file name if different)

Provide Input:
The program expects input like:

List of processes and resources

Resource Allocation and Request matrices

View Results:
The system will output whether a deadlock exists and highlight the deadlocked processes (if any).

📈 Example
Example input for processes and resources:

text
Copy
Edit
Processes: P1, P2, P3
Resources: R1, R2

Allocation Matrix:
P1 -> R1
P2 -> R2

Request Matrix:
P1 -> R2
P2 -> R1
Output:

text
Copy
Edit
Deadlock detected among processes: P1, P2
📦 Project Structure
bash
Copy
Edit
Deadlock-detection/
│
├── deadlock_detection.py  # Main deadlock detection logic
├── README.md              # Project documentation
└── LICENSE                # Project license (MIT)
🧠 Concepts Used
Resource Allocation Graph (RAG)

Wait-For Graph (WFG)

Cycle Detection in Directed Graphs (using DFS)

🎯 Future Improvements
Add deadlock prevention (Banker's Algorithm)

Implement visualization of the graph using NetworkX

Build a GUI interface for easier interaction

Real-time monitoring of deadlocks in systems

📄 License
This project is licensed under the MIT License.
