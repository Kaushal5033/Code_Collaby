import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is required");
      return;
    }

    // redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
    toast.success("Room is created");
  };

  // when enter then also join
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100" style={{ backgroundColor: "#2f4f7f" }}>
      <div className="col-12 col-md-8 col-lg-6 col-xl-5">
        <div className="card shadow-lg p-4 mb-5 bg-dark rounded" style={{ border: "1px solid #3498db", borderRadius: "10px" }}>
          <div className="card-body text-center">
            <h1 className="card-title p-3 mb-4" style={{ color: "#3498db" }}>CodeCollaby</h1>
            <h4 className="card-title mb-4" style={{ color: "#fff" }}>Enter the ROOM ID</h4>

            <div className="form-group mb-3">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="form-control"
                placeholder="ROOM ID"
                style={{ backgroundColor: "#2f4f7f", color: "#fff", border: "1px solid #3498db", borderRadius: "5px" }}
                onKeyUp={handleInputEnter}
              />
            </div>
            <div className="form-group mb-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
                placeholder="USERNAME"
                style={{ backgroundColor: "#2f4f7f", color: "#fff", border: "1px solid #3498db", borderRadius: "5px" }}
                onKeyUp={handleInputEnter}
              />
            </div>
            <button
              onClick={joinRoom}
              className="btn btn-primary btn-lg btn-block"
              style={{ backgroundColor: "#3498db", borderColor: "#3498db", borderRadius: "5px" }}
            >
              JOIN
            </button>
            <p className="mt-3" style={{ color: "#fff" }}>
              Don't have a room ID? create{" "}
              <span
                onClick={generateRoomId}
                className="text-primary p-2"
                style={{ cursor: "pointer", color: "#3498db" }}
              >
                New Room
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
