import express from "express";
import bodyParser from "body-parser";
import {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
} from "./data/tasks.js";

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Home Route
app.get("/", (req, res) => {
  res.render("home");
});

// About Route
app.get("/about", (req, res) => {
  res.render("about");
});

// Dashboard Route
app.get("/dashboard", (req, res) => {
  const tasks = getTasks();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.filter((task) => !task.completed).length;

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.render("dashboard", {
    totalTasks,
    completedTasks,
    pendingTasks,
    completionPercentage,
  });
});

// Tasks Route
app.get("/tasks", (req, res) => {
  const tasks = getTasks();
  const status = req.query.status;
  const search = req.query.search || "";

  let filteredTasks = tasks;

  if (status === "completed") {
    filteredTasks = tasks.filter((task) => task.completed);
  }

  if (status === "pending") {
    filteredTasks = tasks.filter((task) => !task.completed);
  }

  // Filter by search

  if (search) {
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase()),
    );
  }

  res.render("tasks", {
    tasks: filteredTasks,
    status,
    search,
  });
});

// Post Task Route
app.post("/tasks", (req, res) => {
  const title = (req.body.title || "").trim();
  const description = (req.body.description || "").trim();

  // Check Required Fields
  if (!title || !description) {
    return res.status(404).render("add-task", {
      error: "Title and description are required.",
      title,
      description,
    });
  }

  // Check maximum title length
  if (title.length > 100) {
    return res.status(404).render("add-task", {
      error: "Title must not exceed 100 characters.",
      title,
      description,
    });
  }

  // Check maximum description
  if (description.length > 1000) {
    return res.status(404).render("add-task", {
      error: "Description must not exceed 1000 characters.",
      title,
      description,
    });
  }

  addTask(title, description);

  res.redirect("/tasks");
});

// Add Task Route
app.get("/tasks/new", (req, res) => {
  res.render("add-task", {
    error: null,
    title: "",
    description: "",
  });
});

// individual task route
app.get("/tasks/:id", (req, res) => {
  const tasks = getTasks();
  const taskId = Number(req.params.id);

  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return res.status(404).render("404");
  }

  res.render("task-details", {
    task,
  });
});

// Edit Task Route
app.get("/tasks/:id/edit", (req, res) => {
  const tasks = getTasks();
  const taskId = Number(req.params.id);

  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return res.status(404).render("404");
  }

  res.render("edit-task", {
    task,
    error: null,
  });
});

app.post("/tasks/:id", (req, res) => {
  const taskId = Number(req.params.id);

  const tasks = getTasks();
  const existingTask = tasks.find((task) => task.id === taskId);

  // Check whether the task exist
  if (!existingTask) {
    return res.status(404).render("404");
  }

  const title = (req.body.title || "").trim();
  const description = (req.body.description || "").trim();

  let error = null;

  // Validate required fields
  if (!title || !description) {
    error = "Title and description are required.";
  }

  // Validate title length
  if (title.length > 100) {
    error = "Title must not exceeds 100 characters";
  }

  // Validate description
  if (description.length > 1000) {
    error = "Description must not exceeds 1000 characters";
  }

  // Return to the edit form if validation fails
  if (error) {
    return res.status(400).render("edit-task", {
      task: {
        ...existingTask,
        title,
        description,
      },
      error,
    });
  }

  // Update the task
  updateTask(taskId, title, description);

  // Return to task list
  res.redirect("/tasks");
});

// Delete
app.post("/tasks/:id/delete", (req, res) => {
  const taskId = Number(req.params.id);

  const tasks = getTasks();

  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return res.status(404).render("404");
  }

  deleteTask(taskId);

  res.redirect("/tasks");
});

// Toggle
app.post("/tasks/:id/toggle", (req, res) => {
  const taskId = Number(req.params.id);

  const tasks = getTasks();

  const task = tasks.find((task) => task.id === taskId);

  if (!task) {
    return res.status(404).render("404");
  }

  toggleTask(taskId);

  res.redirect("/tasks");
});

// 404 Route
app.use((req, res) => {
  res.status(404).render("404");
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
