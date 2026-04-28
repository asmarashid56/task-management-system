import { useEffect, useState } from "react";
import { getTasks, deleteTask, updateTask } from "../services/api";

function TaskList({ tasks: initialTasks = [], onSelect }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 New state for filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dueDate, setDueDate] = useState("");

  // ✅ Sync with parent-provided tasks (e.g., from App.js)
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // ✅ Optional: still allow fetching with filters if needed
  const loadTasks = async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      const res = await getTasks(filters);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      // Remove from local state immediately
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    }
  };

  const handleProgressChange = async (id, newProgress) => {
    try {
      await updateTask(id, { progress: newProgress });
      setTasks((prev) =>
        prev.map((t) =>
          t._id === id ? { ...t, progress: newProgress } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update progress");
    }
  };

  const applyFilters = () => {
    loadTasks({ search, status, dueDate });
  };

  if (loading) return <p className="text-blue-600">Loading tasks...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      {/* 🔹 Search and Filters */}
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-1/3"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={applyFilters}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Apply
        </button>
      </div>

      {/* 🔹 Task List */}
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks available</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="flex flex-col border p-2 rounded bg-white shadow-sm hover:bg-gray-50"
            >
              <div className="flex justify-between items-center">
                <span
                  onClick={() => onSelect(task._id)}
                  className="cursor-pointer font-medium text-gray-800 hover:text-blue-600"
                >
                  {task.title}
                </span>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>

              {/* 🔹 Progress Bar */}
              <div className="w-full bg-gray-200 rounded h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{ width: `${task.progress || 0}%` }}
                ></div>
              </div>

              {/* 🔹 Progress Slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={task.progress || 0}
                onChange={(e) =>
                  handleProgressChange(task._id, Number(e.target.value))
                }
                className="w-full mt-2"
              />
              <p className="text-sm text-gray-600">
                Progress: {task.progress || 0}%
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskList;