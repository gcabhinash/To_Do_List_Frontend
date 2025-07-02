import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const fetchTasks = async (token) => {
    const response = await fetch(
      "https://to-do-list-backend-fxk9.onrender.com/tasks",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    setTasks(Array.isArray(data) ? data : data.tasks || []);
  };

  const updateTaskText = async (id, newText) => {
    const response = await fetch(
      `https://to-do-list-backend-fxk9.onrender.com/tasks/${id}/text`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newText }),
      }
    );
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
    setEditingTaskId(null);
    setEditingText("");
  };

  const updateTaskPriority = async (id, newPriority) => {
    const response = await fetch(
      `https://to-do-list-backend-fxk9.onrender.com/${id}/priority`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priority: newPriority }),
      }
    );
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
  };

  const updateTaskStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    const response = await fetch(
      `https://to-do-list-backend-fxk9.onrender.com/${id}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      }
    );
    const updatedTask = await response.json();
    setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
  };

  const deleteTask = async (id) => {
    await fetch(`https://to-do-list-backend-fxk9.onrender.com/tasks/${id}` , {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setTasks(tasks.filter((task) => task._id !== id));
  };

  const addTask = async (text) => {
    const response = await fetch(
      "https://to-do-list-backend-fxk9.onrender.com/tasks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, status: "pending", priority: "medium" }),
      }
    );
    const newTask = await response.json();
    setTasks([...tasks, newTask]);
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setTasks([]);
  };

  useEffect(() => {
    if (token) fetchTasks(token);
  }, [token]);

  const filteredTasks = tasks.filter(
    (task) =>
      (filterStatus === "all" || task.status === filterStatus) &&
      (filterPriority === "all" || task.priority === filterPriority)
  );

  const MainApp = () => (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <ul className="flex space-x-4">
          <li>
            <a className="px-4 py-2 rounded-full font-semibold bg-orange-100 text-orange-700 shadow-sm hover:bg-orange-600 hover:text-white">Home</a>
          </li>
        </ul>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full shadow"
        >
          Logout
        </button>
      </nav>
      <main className="flex-1 p-8">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-orange-600">MERN To-Do App</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTask(e.target[0].value);
            e.target[0].value = "";
          }}
          className="mb-6 flex gap-2 justify-center"
        >
          <input
            type="text"
            className="p-3 border-2 border-orange-300 rounded-lg w-2/3 focus:ring-2 focus:ring-orange-400"
            placeholder="Add a task"
          />
          <button type="submit" className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg">
            Add
          </button>
        </form>
        <div className="mb-6 flex gap-4 justify-center">
          <select
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400"
            value={filterStatus}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <select
            onChange={(e) => setFilterPriority(e.target.value)}
            className="p-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400"
            value={filterPriority}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <ul className="space-y-4">
          {filteredTasks.map((task) => (
            <li
              key={task._id}
              className="p-4 bg-white rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex-1">
                {editingTaskId === task._id ? (
                  <div className="flex gap-2">
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="p-2 border rounded w-full"
                    />
                    <button onClick={() => updateTaskText(task._id, editingText)} className="bg-green-500 px-3 py-1 rounded text-white">Save</button>
                    <button onClick={() => { setEditingTaskId(null); setEditingText(""); }} className="bg-gray-400 px-3 py-1 rounded text-white">Cancel</button>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <span className="text-lg text-orange-800">{task.text}</span>
                    <button onClick={() => { setEditingTaskId(task._id); setEditingText(task.text); }} className="text-sm text-blue-600 hover:underline">Edit</button>
                  </div>
                )}
                <span className="text-sm text-gray-500 ml-2">({task.status}, {task.priority})</span>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => updateTaskStatus(task._id, task.status)}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors duration-200 ${task.status === "pending" ? "bg-yellow-400 text-yellow-900" : "bg-green-400 text-green-900"}`}
                >
                  {task.status === "pending" ? "Mark Complete" : "Mark Pending"}
                </button>
                <select
                  value={task.priority}
                  onChange={(e) => updateTaskPriority(task._id, e.target.value)}
                  className="p-2 border-2 border-orange-300 rounded-lg"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button
                  onClick={() => deleteTask(task._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </main>
      <footer className="bg-orange-500 text-white p-4 mt-auto text-center">
        © 2025 Your To-Do App
      </footer>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={token ? <MainApp /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
