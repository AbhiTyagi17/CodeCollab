import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import io from "socket.io-client";
import api from "../lib/axios";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

let socket;

const EditorPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [project, setProject] = useState(null);
  const [code, setCode] = useState("// Start coding...");
  const [language, setLanguage] = useState("javascript");
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [output, setOutput] = useState("");
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [input, setInput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Socket Connection
  useEffect(() => {
    socket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
    });

    socket.emit("join-room", { projectId });

    socket.on("receive-change", ({ code: newCode }) => {
      setCode(newCode);
    });

    socket.on("user-joined", ({ user }) => {
      setConnectedUsers((prev) => [...prev, user]);
      toast.success(`${user.email} joined`);
    });

    socket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("error", ({ message }) => {
      toast.error(message);
      navigate("/dashboard");
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, [projectId, navigate]);

  // Load Project
  useEffect(() => {
    const loadProject = async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}`);
        setProject(data);
        setCode(data.currentCode || "// Start coding...");
        setLanguage(data.language || "javascript");
      } catch (error) {
        toast.error("Failed to load project");
        navigate("/dashboard");
      }
    };
    loadProject();
  }, [projectId, navigate]);

  // Load Previous Messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await api.get(`/projects/messages/${projectId}`);
        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages");
      }
    };
    if (projectId) loadMessages();
  }, [projectId]);

  const handleCodeChange = (value) => {
    const newCode = value || "";
    setCode(newCode);
    if (socket) socket.emit("code-change", { projectId, code: newCode });
  };

  const handleSave = async () => {
    try {
      await api.put(`/projects/${projectId}/save`, { currentCode: code });
      toast.success("✅ Project saved!");
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  const handleExecute = async () => {
  if (!code.trim()) return toast.error("No code to execute");

  setIsExecuting(true);
  setOutput("Executing...");

  try {
    const { data } = await api.post('/projects/execute', {
      code,
      language,
      input
    });

    setOutput(data.output || data.error || "No output");
  } catch (error) {
    setOutput("Execution Error: " + (error.response?.data?.message || error.message));
  } finally {
    setIsExecuting(false);
  }
};

  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit("send-message", {
      roomId: projectId,
      message: newMessage.trim(),
    });
    setNewMessage("");
  };

  const loadVersions = async () => {
  try {
    const { data } = await api.get(`/projects/versions/${projectId}`);
    setVersions(data);
  } catch (error) {
    toast.error("Failed to load versions");
  }
};

const saveVersion = async () => {
  try {
    await api.post('/projects/versions', {
      projectId,
      codeSnapshot: code
    });
    toast.success("Version saved successfully!");
    loadVersions(); // Refresh list
  } catch (error) {
    toast.error("Failed to save version");
  }
};

const restoreVersion = async (versionId) => {
  if (!confirm("Restore this version? Current code will be replaced.")) return;
  
  try {
    await api.post(`/projects/versions/${versionId}/restore`);
    toast.success("Version restored!");
    // Reload project
    const { data } = await api.get(`/projects/${projectId}`);
    setCode(data.currentCode);
  } catch (error) {
    toast.error("Failed to restore version");
  }
};

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">
            {project?.title || "Loading..."}
          </h1>
          <p className="text-sm text-gray-400">Room: {project?.roomCode}</p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 px-4 py-2 rounded-lg text-white border border-gray-700"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition"
          >
            💾 Save Project
          </button>

          <button
  onClick={() => {
    setShowVersions(!showVersions);
    if (!showVersions) loadVersions();
  }}
  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
>
  📜 Versions
</button>

          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Monaco Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              automaticLayout: true,
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {/* Right Sidebar - Chat */}
        <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
          {/* Users List (Small) */}
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-semibold mb-3">👥 Online</h3>
            <div className="text-sm text-green-400">
              🟢 You
              {connectedUsers.map((u, i) => (
                <div key={i}>🟢 {u.email}</div>
              ))}
            </div>
          </div>

          {showVersions && (
  <div className="absolute right-0 top-16 w-96 bg-gray-900 border-l border-gray-700 h-full p-4 overflow-auto">
    <h3 className="font-bold mb-4">Version History</h3>
    <button onClick={saveVersion} className="w-full mb-4 bg-purple-600 py-2 rounded-lg">
      Save Current as New Version
    </button>
    
    {versions.map((v) => (
      <div key={v._id} className="bg-gray-800 p-3 rounded mb-3">
        <p className="text-xs text-gray-400">{new Date(v.createdAt).toLocaleString()}</p>
        <button
          onClick={() => restoreVersion(v._id)}
          className="text-blue-400 hover:underline text-sm mt-2"
        >
          Restore this version
        </button>
      </div>
    ))}
  </div>
)}

          {/* Chat Messages */}
          <div
            className="flex-1 p-4 overflow-y-auto space-y-3"
            style={{ maxHeight: "calc(100vh - 180px)" }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.senderId === user?._id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-lg ${msg.senderId === user?._id ? "bg-blue-600" : "bg-gray-700"}`}
                >
                  <small className="opacity-70">{msg.senderName}</small>
                  <p>{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 px-4 py-2 rounded-lg focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 px-5 rounded-lg hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
{/* Bottom Console */}
<div className="h-72 bg-gray-900 border-t border-gray-700 flex flex-col">
  <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700 bg-gray-800">
    <h3 className="font-semibold">Output Console</h3>
    <button
      onClick={handleExecute}
      disabled={isExecuting}
      className="px-6 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
    >
      {isExecuting ? "Running..." : "▶ Run Code"}
    </button>
  </div>

  {/* Input Area */}
  <div className="p-3 border-b border-gray-700 bg-gray-950">
    <p className="text-xs text-gray-400 mb-1">Input (stdin)</p>
    <textarea
      value={input}
      onChange={(e) => setInput(e.target.value)}
      className="w-full h-16 bg-gray-800 p-3 rounded text-sm font-mono resize-y"
      placeholder="Enter input here..."
    />
  </div>

  {/* Output Area */}
  <div className="flex-1 p-4 overflow-auto font-mono text-sm whitespace-pre-wrap bg-gray-950">
    {output || "Run your code to see output here..."}
  </div>
</div>

        </div>
      </div>
    </div>
  );
};

export default EditorPage;
