import { useEffect, useState } from "react";
import api from "../lib/axios";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title) return toast.error("Title is required");

    try {
      const { data } = await api.post("/projects", { title, description });
      setProjects([data, ...projects]);
      setTitle("");
      setDescription("");
      toast.success("Project created successfully!");
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  const handleJoinByCode = async () => {
    if (!roomCode) return toast.error("Enter room code");

    try {
      const { data } = await api.post("/projects/join-room", { roomCode });
      toast.success("Joined project successfully!");
      fetchProjects();
      setRoomCode("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-400">CollabCode</h1>

          <div className="flex items-center gap-4">
            <span>
              Welcome,{" "}
              <span className="font-semibold">{user?.name || "User"}</span>
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Join Existing Project */}
        <div className="bg-gray-900 p-6 rounded-xl mb-8">
          <h2 className="text-lg font-semibold mb-3">Join Existing Project</h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter Room Code (e.g. ABCD12)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3 bg-gray-800 rounded-lg"
              maxLength={6}
            />
            <button
              onClick={handleJoinByCode}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Join
            </button>
          </div>
        </div>

        {/* Create Project */}
        <div className="bg-gray-900 p-6 rounded-xl mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <form onSubmit={handleCreateProject} className="flex gap-4">
            <input
              type="text"
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-800 rounded-lg focus:outline-none"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-800 rounded-lg focus:outline-none"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Create
            </button>
          </form>
        </div>

        {/* Projects List */}
        <h2 className="text-2xl font-semibold mb-6">Your Projects</h2>

        {loading ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-400">No projects yet. Create one above!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-gray-900 p-6 rounded-xl hover:border-blue-500 border border-transparent transition"
              >
                <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {project.description || "No description"}
                </p>

                <div className="flex justify-between items-center text-sm mt-4">
                  <div>
                    <span className="text-gray-400">Room:</span>
                    <span className="font-mono ml-1">{project.roomCode}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/editor/${project._id}`,
                        );
                        toast.success("Invite link copied!");
                      }}
                      className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                    >
                      Copy Invite
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(project.roomCode);
                        toast.success("Room code copied!");
                      }}
                      className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/editor/${project._id}`)}
                  className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Open Editor →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
