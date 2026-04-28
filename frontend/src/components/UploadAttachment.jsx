import React, { useState } from "react";
import { uploadAttachment } from "../services/api";

const UploadAttachment = ({ taskId }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      setStatus("Please select a file first.");
      return;
    }
    try {
      setStatus("Uploading...");
      await uploadAttachment(taskId, file);
      setStatus("Upload successful!");
    } catch (err) {
      setStatus("Upload failed.");
      console.error(err);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{status}</p>
    </div>
  );
};

export default UploadAttachment;
