const express = require('express');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 3000;


// MySQL Connection
const db = mysql.createConnection({
  host: '194.163.35.1',
  user: 'u287158188_pro_focus',
  password: 'Dk555666@',
  database: 'u287158188_pro_focus'
});

// // MySQL Connection
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Dk123456789@',
//     database: 'taskdb'
// });

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});

// Create tasks table if not exists
const createTasksTable = () => {
    const sql = `
        CREATE TABLE IF NOT EXISTS tasks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            taskName VARCHAR(255) NOT NULL,
            description TEXT,
            completed BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error creating tasks table:', err);
        } else {
            console.log('Tasks table created or already exists');
        }
    });
};

createTasksTable();

// Middleware
app.use(express.json());

// Routes
// Add a new task
app.post('/api/tasks', (req, res) => {
    const { taskName, description, completed } = req.body;
    const sql = 'INSERT INTO tasks (taskName, description, completed) VALUES (?, ?, ?)';
    db.query(sql, [taskName, description, completed], (err, result) => {
        if (err) {
            console.error('Error adding task:', err);
            res.status(500).send('Error adding task');
        } else {
            res.status(201).send('Task added');
        }
    });
});

// Get all tasks
app.get('/api/tasks', (req, res) => {
    const sql = 'SELECT * FROM tasks';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            res.status(500).send('Error fetching tasks');
        } else {
            res.json(result);
        }
    });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
