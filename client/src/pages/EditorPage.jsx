import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import io from 'socket.io-client';
import api from '../lib/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

let socket;

const EditorPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [project, setProject] = useState(null);
  const [code, setCode] = useState('// Start coding...');
  const [language, setLanguage] = useState('javascript');
  const [connectedUsers, setConnectedUsers] = useState([]);

  // Initialize Socket
  useEffect(() => {
    socket = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('token') }
    });

    socket.emit('join-room', { projectId });

    socket.on('receive-change', ({ code: newCode }) => {
      setCode(newCode);
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  // Load Project
  useEffect(() => {
    const loadProject = async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}`);
        setProject(data);
        setCode(data.currentCode || '// Start coding...');
        setLanguage(data.language || 'javascript');
      } catch (error) {
        toast.error('Failed to load project');
        navigate('/dashboard');
      }
    };
    loadProject();
  }, [projectId]);

  const handleCodeChange = (value) => {
    setCode(value);
    socket.emit('code-change', { projectId, code: value });
  };


  const handleSave = async () => {
  try {
    	await api.put(`/projects/${projectId}/save`, { currentCode: code });
    	toast.success('Project saved successfully!');
  	} catch (error) {
    	toast.error('Failed to save project');
  	}
	};

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">{project?.title}</h1>
          <p className="text-sm text-gray-400">Room: {project?.roomCode}</p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
          >
            Back to Dashboard
          </button>
			<button 
				onClick={handleSave}
				className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium">
				Save Project
			</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Sidebar - Connected Users */}
        <div className="w-72 bg-gray-900 border-l border-gray-700 p-4">
          <h3 className="font-semibold mb-4">Connected Users</h3>
          <div className="space-y-2">
            {connectedUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-2 text-green-400">
                🟢 {u.email}
              </div>
            ))}
            {connectedUsers.length === 0 && (
              <p className="text-gray-500">Waiting for others...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;