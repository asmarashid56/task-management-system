import { useEffect, useState } from "react";
import { getTask, shareTask, uploadAttachment } from "../services/api"; // ✅ import uploadAttachment

export default function TaskDetails({ id }) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shareError, setShareError] = useState("");
  const [shareSuccess, setShareSuccess] = useState("");
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

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

  // ✅ Handle Share Task
  const handleShareTask = async () => {
    if (!task) return;
    setShareError("");
    setShareSuccess("");
    try {
      const userId = prompt("Enter user ID or email to share with:");
      if (!userId) return;

      await shareTask(task._id, userId);
      setShareSuccess(`Task shared successfully with ${userId}`);
    } catch (err) {
      console.error(err);
      setShareError("Failed to share task. Please check permissions or user ID.");
    }
  };

  // ✅ Handle File Upload
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file first.");
      return;
    }
    try {
      setUploadStatus("Uploading...");
      const updatedTask = await uploadAttachment(task._id, file);
      setTask(updatedTask.data); // refresh task with new attachment
      setUploadStatus("Upload successful!");
      setFile(null);
    } catch (err) {
      console.error(err);
      setUploadStatus("Upload failed.");
    }
  };

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

      {/* ✅ Ownership info */}
      <p className="mt-2 text-sm text-gray-700">
        <span className="font-semibold">Owner:</span>{" "}
        {task.owner ? task.owner.toString() : "Unknown"}
      </p>

      {/* ✅ SharedWith info */}
      {task.sharedWith && task.sharedWith.length > 0 ? (
        <div className="mt-2 text-sm text-gray-700">
          <span className="font-semibold">Shared With:</span>
          <ul className="list-disc ml-5">
            {task.sharedWith.map((userId) => (
              <li key={userId}>{userId.toString()}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">Not shared with anyone</p>
      )}

      {/* ✅ Attachments list */}
      <div className="mt-4">
        <h4 className="font-semibold">Attachments:</h4>
        {task.attachments && task.attachments.length > 0 ? (
          <ul className="list-disc ml-5">
            {task.attachments.map((att, idx) => (
              <li key={idx}>
                <a
                  href={`http://localhost:3000${att.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {att.filename}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No attachments uploaded</p>
        )}
      </div>

      {/* ✅ Upload Attachment */}
      <div className="mt-4">
        <input type="file" onChange={handleFileChange} />
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-2"
        >
          Upload
        </button>
        {uploadStatus && <p className="mt-2 text-sm">{uploadStatus}</p>}
      </div>

      {/* ✅ Share Task Button */}
      <div className="mt-4">
        <button
          onClick={handleShareTask}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
        >
          Share Task
        </button>
      </div>

      {/* ✅ Success & Error Messages */}
      {shareSuccess && <p className="text-green-600 mt-2">{shareSuccess}</p>}
      {shareError && <p className="text-red-600 mt-2">{shareError}</p>}
    </div>
  );
}
