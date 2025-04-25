import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

// List of supported languages
const LANGUAGES = [
  "python3",
  "java",
  "cpp",
  "c"
];

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const codeRef = useRef(null);

  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== Location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  if (!Location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post("http://localhost:5000/compile", {
        code: codeRef.current,
        language: selectedLanguage,
      });
      console.log("Backend response:", response.data);
      setOutput(response.data.output || JSON.stringify(response.data));
    } catch (error) {
      console.error("Error compiling code:", error);
      setOutput(error.response?.data?.error || "An error occurred");
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

  return (
    <div className="container-fluid vh-100 d-flex flex-column" style={{ backgroundColor: "#2f4f7f" }}>
      <div className="row flex-grow-1">
        {/* Client panel */}
        <div className="col-md-2 bg-dark text-light d-flex flex-column" style={{ borderRight: "1px solid #3498db" }}>
        <h1 className="p-4 mb-4" style={{ color: "#3498db" }}>CodeCollaby</h1>
          <hr style={{ marginTop: "-3rem", borderColor: "#3498db" }} />

          {/* Client list container */}
          <div className="d-flex flex-column flex-grow-1 overflow-auto">
            <span className="mb-2" style={{ color: "#3498db" }}>Members</span>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          <hr style={{ borderColor: "#3498db" }} />
          {/* Buttons */}
          <div className="mt-auto mb-3">
            <button 
              className="btn btn-primary w-100 mb-2" 
              onClick={copyRoomId}
              style={{ backgroundColor: "#3498db", borderColor: "#3498db" }}
            >
              Copy Room ID
            </button>
            <button 
              className="btn btn-danger w-100" 
              onClick={leaveRoom}
              style={{ backgroundColor: "#e74c3c", borderColor: "#e74c3c" }}
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="col-md-10 text-light d-flex flex-column">
          {/* Language selector */}
          <div className="bg-dark p-2 d-flex justify-content-end" style={{ borderBottom: "1px solid #3498db" }}>
            <select
              className="form-select w-auto"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{ backgroundColor: "#2f4f7f", color: "#fff", border: "1px solid #3498db" }}
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
      </div>

      {/* Compiler toggle button */}
      <button
        className="btn btn-primary position-fixed bottom-0 end-0 m-3"
        onClick={toggleCompileWindow}
        style={{ zIndex: 1050, backgroundColor: "#3498db", borderColor: "#3498db" }}
      >
        {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
      </button>

      {/* Compiler section */}
      <div
        className={`bg-dark text-light p-3 ${
          isCompileWindowOpen ? "d-block" : "d-none"
        }`}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: isCompileWindowOpen ? "30vh" : "0",
          transition: "height 0.3s ease-in-out",
          overflowY: "auto",
          zIndex: 1040,
          borderTop: "1px solid #3498db"
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0" style={{ color: "#3498db" }}>Compiler Output ({selectedLanguage})</h5>
          <div>
            <button
              className="btn btn-success me-2"
              onClick={runCode}
              disabled={isCompiling}
              style={{ backgroundColor: "#2ecc71", borderColor: "#2ecc71" }}
            >
              {isCompiling ? "Compiling..." : "Run Code"}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={toggleCompileWindow}
              style={{ backgroundColor: "#95a5a6", borderColor: "#95a5a6" }}
            >
              Close
            </button>
          </div>
        </div>
        <pre className="bg-secondary p-3 rounded" style={{ backgroundColor: "#2f4f7f", border: "1px solid #3498db" }}>
          {output || "Output will appear here after compilation"}
        </pre>
      </div>
    </div>
  );
}

export default EditorPage;
