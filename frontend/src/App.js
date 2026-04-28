import { useState, useEffect } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TaskDetails from "./components/TaskDetails";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Notifications from "./components/Notifications";
import AnalyticsDashboard from "./components/AnalyticsDashboard"; // ✅ import dashboard
import { getMyTasks, getSharedTasks } from "./services/api";
import "./App.css";

function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [myTasks, setMyTasks] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);

  // ✅ Dark Mode state
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setSelectedId(null);
    setMyTasks([]);
    setSharedTasks([]);
  };

  // ✅ Fetch tasks whenever user logs in
  useEffect(() => {
    const fetchTasks = async () => {
      if (isLoggedIn) {
        try {
          const my = await getMyTasks();
          const shared = await getSharedTasks();
          setMyTasks(my.data);
          setSharedTasks(shared.data);
        } catch (err) {
          console.error("Error fetching tasks:", err);
        }
      }
    };
    fetchTasks();
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Management System</h1>
        <div className="flex gap-3">
          {/* ✅ Dark Mode Toggle */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-800"
          >
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Notifications globally visible when logged in */}
      {isLoggedIn && (
        <div className="absolute top-20 right-5 z-50">
          <Notifications />
        </div>
      )}

      {/* Main content */}
      <main className="p-6">
        {!isLoggedIn ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LoginForm onLogin={() => setIsLoggedIn(true)} />
            <RegisterForm />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: Form + Lists */}
            <div className="space-y-6">
              <TaskForm />

              <h2 className="text-xl font-semibold">My Tasks</h2>
              <TaskList tasks={myTasks} onSelect={setSelectedId} />

              <h2 className="text-xl font-semibold">Shared With Me</h2>
              <TaskList tasks={sharedTasks} onSelect={setSelectedId} />
            </div>

            {/* Right side: Details + Analytics */}
            <div className="space-y-6">
              <TaskDetails id={selectedId} />

              {/* ✅ Analytics Dashboard */}
              <AnalyticsDashboard />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
