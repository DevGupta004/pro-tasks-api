// taskController.js
const mysql = require("mysql");

// Initialize MySQL connection
let connection;

// Function to establish the initial connection
function connect() {
  connection = mysql.createConnection({
    host: "194.163.35.1",
    user: "u287158188_pro_focus",
    password: "Dk555666@",
    database: "u287158188_pro_focus",
    connectTimeout: 5000 // Example: Increase the connection timeout to 5 seconds
  });

  connection.connect((err) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      // Retry connection after a delay
      setTimeout(connect, 5000); // Retry connection after 5 seconds
    } else {
      console.log("MySQL connected...");
    }
  });

  // Add error event handler to MySQL connection
  connection.on("error", (err) => {
    console.error("MySQL connection error:", err);
    if (err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
      // Handle the protocol enqueue after fatal error
      handleProtocolEnqueueAfterFatalError();
    } else {
      // For other errors, attempt to reconnect
      reconnect();
    }
  });
}

// Function to handle the protocol enqueue after fatal error
function handleProtocolEnqueueAfterFatalError() {
  // Wait for a brief moment before attempting to reconnect
  setTimeout(reconnect, 1000); // Retry connection after 1 second
}

// Function to reconnect to the database
function reconnect() {
  console.log("Reconnecting to the database...");
  // Destroy the existing connection
  if (connection) {
    connection.destroy();
  }
  // Re-establish the connection
  connect();
}

// Initial connection attempt
connect();

// // Check if user_id column exists in tasks table and add it if not
// connection.query("SHOW COLUMNS FROM tasks LIKE 'userId'", (error, results) => {
//   if (error) throw error;

//   console.log("resultsresults", results);
//   if (results.length === 0) {
//     // userId column doesn't exist, add it
//     connection.query("ALTER TABLE tasks ADD COLUMN userId VARCHAR(255)", (error) => {
//       if (error) throw error;
//       console.log("user_id column added to tasks table");
//     });
//   }
// });

// // Drop existing tasks table
// connection.query("DROP TABLE IF EXISTS tasks", (error) => {
//   if (error) throw error;
//   console.log("Existing tasks table dropped");

//   // Create new tasks table
//   const createTableQuery = `
//     CREATE TABLE tasks (
//       taskId INT AUTO_INCREMENT PRIMARY KEY,
//       userId VARCHAR(255),
//       taskName VARCHAR(255),
//       description TEXT,
//       completed BOOLEAN,
//       UNIQUE KEY unique_task (userId, taskName)
//     )
//   `;
//   connection.query(createTableQuery, (error) => {
//     if (error) throw error;
//     console.log("New tasks table created");
//   });
// });

// Controller functions

/**
 * Get tasks by user ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getTasksByUserId = (req, res) => {
  const userId = req.params.userId;
  const query = `SELECT * FROM tasks WHERE userId = ?`;
  connection.query(query, [userId], (error, results) => {
    if (error) {
      if (error.code === "ECONNRESET") {
        // Connection reset error
        return res.status(500).send("Database connection reset");
      } else {
        // Other error
        throw error;
      }
    }
    res.json(results);
  });
};

exports.createTask = (req, res) => {
  const { userId, taskName, description, completed } = req.body;
  const query = `INSERT INTO tasks (userId, taskName, description, completed) VALUES (?, ?, ?, ?)`;
  connection.query(
    query,
    [userId, taskName, description, completed],
    (error, results) => {
      if (error) {
        if (error.code === "ECONNRESET") {
          // Connection reset error
          return res.status(500).send("Database connection reset");
        } else if (error.code === "ER_DUP_ENTRY") {
          // Duplicate entry error
          return res.status(400).send("Task already exists");
        } else {
          // Other error
          throw error;
        }
      }
      res.status(201).send("Task created successfully");
    }
  );
};

exports.updateTask = (req, res) => {
  const taskId = req.params.taskId;
  const { taskName } = req.body;
  const query = `UPDATE tasks SET taskName = ? WHERE taskId = ?`;
  connection.query(query, [taskName, taskId], (error, results) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        // Duplicate entry error
        return res.status(400).send("Task already exists. Can't update duplicate entry");
      } else {
        // Other error
        throw error;
      }
    }
    res.send("Task updated successfully");
  });
};

exports.deleteTask = (req, res) => {
  const taskId = req.params.taskId;
  const query = `DELETE FROM tasks WHERE taskId = ?`;
  connection.query(query, [taskId], (error, results) => {
    if (error) throw error;
    res.send("Task deleted successfully");
  });
};
