import { useState } from "react";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TaskDetails from "./components/TaskDetails";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import "./App.css";

function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Management System</h1>
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        )}
      </header>

      {/* Main content */}
      <main className="p-6">
        {!isLoggedIn ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LoginForm onLogin={() => setIsLoggedIn(true)} />
            <RegisterForm />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side: Form + List */}
            <div className="space-y-6">
              <TaskForm />
              <TaskList onSelect={setSelectedId} />
            </div>

            {/* Right side: Details */}
            <div>
              <TaskDetails id={selectedId} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
