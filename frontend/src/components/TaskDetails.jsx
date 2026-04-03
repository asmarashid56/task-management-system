import { useEffect, useState } from "react";
import { getTask } from "../services/api";

export default function TaskDetails({ id }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const res = await getTask(id);
        setTask(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load task");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  if (!id) return <p className="text-gray-500">Select a task to view details</p>;
  if (loading) return <p className="text-blue-600">Loading task...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!task) return <p className="text-gray-500">No task found</p>;

  return (
    <div className="border p-4 rounded bg-white shadow">
      <h3 className="text-xl font-bold mb-2">{task.title}</h3>
      <p className="mb-2">{task.description || "No description provided"}</p>
      <p className="mb-1">
        <span className="font-semibold">Status:</span> {task.status}
      </p>
      <p>
        <span className="font-semibold">Due:</span>{" "}
        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
      </p>
    </div>
  );
}
