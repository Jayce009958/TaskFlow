import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const taskFile = path.join(__dirname, "tasks.json");

export function getTasks() {
  const data = fs.readFileSync(taskFile, "utf8");
  return JSON.parse(data);
}

export function saveTasks(tasks) {
  fs.writeFileSync(taskFile, JSON.stringify(tasks, null, 4));
}

export function addTask(title, description) {
  const tasks = getTasks();

  const newId =
    tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;

  const newTask = {
    id: newId,
    title: title,
    description: description,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks(tasks);
}

export function updateTask(id, title, description) {
  const tasks = getTasks();

  const task = tasks.find((task) => task.id === id);

  if (task) {
    task.title = title;
    task.description = description;

    saveTasks(tasks);
  }
}

export function deleteTask(id) {
  const tasks = getTasks();

  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    saveTasks(tasks);
  }
}

export function toggleTask(id) {
  const tasks = getTasks();

  const task = tasks.find((task) => task.id === id);

  if (task) {
    task.completed = !task.completed;

    saveTasks(tasks);
  }
}
