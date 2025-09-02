import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logoImage from "../../assets/img/20250701_wala_logo_02 1.png";
import streamNotFoundImage from "../../assets/img/StreamNotFound.jpg";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [connectionStatus1, setConnectionStatus1] = useState("Connecting...");
  const [connectionStatus2, setConnectionStatus2] = useState("Connecting...");
  const [streamError1, setStreamError1] = useState(false);
  const [streamError2, setStreamError2] = useState(false);
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const peerConnection1Ref = useRef(null);
  const peerConnection2Ref = useRef(null);

  const url1 = "https://live.liv007.site/C01/whep";
  const url2 = "https://live.liv007.site/MR01/whep";

  const initStream = async (url, videoRef, pcRef, setStatus, setError) => {
    try {
      setStatus("Connecting...");
      setError(false);
      if (pcRef.current) {
        pcRef.current.close();
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      pc.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
          setStatus("Connected");
          setError(false);
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (
          pc.iceConnectionState === "failed" ||
          pc.iceConnectionState === "disconnected"
        ) {
          setStatus("Disconnected");
          setError(true);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: pc.localDescription.sdp,
      });

      if (response.ok) {
        const sdp = await response.text();
        await pc.setRemoteDescription({ type: "answer", sdp });
      } else {
        setStatus("Failed");
        setError(true);
      }
    } catch (error) {
      console.error("Stream error:", error);
      setStatus("Error");
      setError(true);
    }
  };

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (!storedUsername) {
      navigate("/login");
    } else {
      setUsername(storedUsername);
    }

    // Initialize streams
    if (video1Ref.current && video2Ref.current) {
      initStream(
        url1,
        video1Ref,
        peerConnection1Ref,
        setConnectionStatus1,
        setStreamError1
      );
      initStream(
        url2,
        video2Ref,
        peerConnection2Ref,
        setConnectionStatus2,
        setStreamError2
      );
    }

    return () => {
      if (peerConnection1Ref.current) peerConnection1Ref.current.close();
      if (peerConnection2Ref.current) peerConnection2Ref.current.close();
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img src={logoImage} alt="Wala Logo" className="dashboard-logo" />
          <div className="header-text">
            <h1 className="welcome-title">Welcome back!</h1>
            <p className="username-text">{username}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Video Streams */}
        <div className="streams-section">
          <h2 className="section-title">Live Streams</h2>
          <div className="streams-grid">
            <div className="stream-card">
              <div className="stream-wrapper">
                {streamError1 ? (
                  <img
                    src={streamNotFoundImage}
                    alt="Stream Not Found"
                    className="stream-video"
                  />
                ) : (
                  <video
                    ref={video1Ref}
                    width="100%"
                    height="100%"
                    controls
                    autoPlay
                    muted
                    playsInline
                    className="stream-video"
                  />
                )}
                <div className="stream-overlay">
                  <div className="stream-header">
                    <div className="stream-title">Main Arena</div>
                    <div
                      className={`status-indicator ${connectionStatus1.toLowerCase()}`}
                    >
                      <div className="status-dot"></div>
                      {connectionStatus1}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="stream-card">
              <div className="stream-wrapper">
                {streamError2 ? (
                  <img
                    src={streamNotFoundImage}
                    alt="Stream Not Found"
                    className="stream-video"
                  />
                ) : (
                  <video
                    ref={video2Ref}
                    width="100%"
                    height="100%"
                    controls
                    autoPlay
                    muted
                    playsInline
                    className="stream-video"
                  />
                )}
                <div className="stream-overlay">
                  <div className="stream-header">
                    <div className="stream-title">Side Arena</div>
                    <div
                      className={`status-indicator ${connectionStatus2.toLowerCase()}`}
                    >
                      <div className="status-dot"></div>
                      {connectionStatus2}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
