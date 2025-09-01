import React, { useEffect, useRef, useState } from "react";
import { Box, Text, VStack, HStack, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const [gameInfo, setGameInfo] = useState({
    roundId: "",
    roundStatus: "",
    drawResult: "",
    time: "",
    countdown: "",
  });
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  const peerConnection1Ref = useRef(null);
  const peerConnection2Ref = useRef(null);
  const socketRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const url1 = "https://live.liv007.site/MR01/whep";
  const url2 = "https://live.liv007.site/MR01Full/whep";
  const wss1 = "wss://api.stagecode.online:8443/ws";

  const LTT = {
    roundstatus0: "Maintaining",
    roundstatus1: "Countdown",
    roundstatus2: "Racing",
    roundstatus3: "Done",
    roundstatus4: "Waiting",
    roundstatus5: "Cancel",
  };

  let timeDiff = 0;
  let tableInfo = [];
  const tableId = "MR01";

  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  // Session validation function (similar to getPlayerInfo from public_func.js)
  const validateSession = async () => {
    const sessId = localStorage.getItem("sess_id");

    if (!sessId) {
      handleLogout();
      return;
    }

    try {
      const response = await fetch(
        "https://apisingle.stagecode.online/getPlayerInfo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sess_id: sessId,
          }),
        }
      );

      const result = await response.json();

      if (result.code !== "B100") {
        // Session expired - show message and redirect to login
        alert("Session expired. Please login again.");
        handleLogout();
      }
    } catch (error) {
      console.error("Session validation error:", error);
      // On network error, don't logout automatically
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("sess_id");
    // navigate("/login");
  };

  const showTime = () => {
    const date = new Date();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();

    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;

    const time = h + ":" + m + ":" + s;
    setGameInfo((prev) => ({ ...prev, time }));
  };

  const testConnection = async (url, video, peerConnectionRef) => {
    setConnectionStatus(`Testing connection to: ${url}`);
    console.log(`Testing connection to: ${url}`);

    try {
      // Close any existing connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Create a new RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
        iceTransportPolicy: "all",
        bundlePolicy: "max-bundle",
        rtcpMuxPolicy: "require",
      });

      peerConnectionRef.current = pc;

      // Add transceivers
      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });

      // Event handlers
      pc.ontrack = (event) => {
        console.log("Track received:", event.track.kind);
        if (!video.srcObject) {
          video.srcObject = event.streams[0];
        }
        setConnectionStatus(`Connected to: ${url}`);
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state: ${pc.iceConnectionState}`);
        setConnectionStatus(`ICE state: ${pc.iceConnectionState}`);
      };

      pc.onicecandidateerror = (event) => {
        console.warn(
          `ICE candidate error: ${event.errorCode} - ${event.errorText}`
        );
      };

      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE gathering
      await new Promise((resolve) => {
        const checkState = () => {
          if (pc.iceGatheringState === "complete") {
            resolve();
          }
        };

        const iceGatheringTimeout = setTimeout(() => {
          resolve();
        }, 2000);

        pc.addEventListener("icegatheringstatechange", () => {
          checkState();
          if (pc.iceGatheringState === "complete") {
            clearTimeout(iceGatheringTimeout);
          }
        });

        checkState();
      });

      // Send offer to server
      console.log(`Sending SDP offer to ${url}`);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: pc.localDescription.sdp,
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status} ${response.statusText}`
        );
      }

      // Get SDP answer
      const sdp = await response.text();
      console.log(`Received SDP answer from ${url}:`, sdp);

      // Set remote description
      await pc.setRemoteDescription({
        type: "answer",
        sdp: sdp,
      });

      return true;
    } catch (error) {
      console.error(`Error with ${url}:`, error);
      setConnectionStatus(`Error: ${error.message}`);
      return false;
    }
  };

  const initWebSocket = () => {
    socketRef.current = new WebSocket(wss1);

    socketRef.current.addEventListener("message", (event) => {
      const jds = JSON.parse(event.data);

      // Handle time synchronization
      if (jds["ts"]) {
        const serverTime = new Date(jds["ts"]);
        const clientTime = new Date();
        timeDiff = serverTime - clientTime;
        console.log("Time difference(msec):", timeDiff);
        return;
      }

      Object.values(jds).forEach((jd) => {
        tableInfo[jd.tableid] = jd;

        if (jd.tableid === tableId) {
          const tt = tableInfo[tableId];

          setGameInfo((prev) => ({
            ...prev,
            roundId: tt.trid,
            roundStatus: LTT[`roundstatus${tt.roundstatus}`] || "Unknown",
          }));

          if (tt["roundstatus"] === 1) {
            // Betting phase
            let countdown = Math.floor(
              new Date(tt["stopdate"]) -
                new Date(
                  new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Hong_Kong",
                  })
                ) +
                timeDiff
            );

            if (countdown < 1000) countdown = 0;

            setGameInfo((prev) => ({
              ...prev,
              countdown: new Date(countdown).toISOString().substr(14, 5),
            }));

            // Auto countdown
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }

            countdownIntervalRef.current = setInterval(() => {
              countdown = Math.floor(
                new Date(tt["stopdate"]) - new Date() + timeDiff
              );

              if (countdown < 1000) {
                clearInterval(countdownIntervalRef.current);
                setGameInfo((prev) => ({
                  ...prev,
                  countdown: "00:00",
                  roundStatus: LTT["roundstatus2"],
                }));
              } else {
                setGameInfo((prev) => ({
                  ...prev,
                  countdown: new Date(countdown).toISOString().substr(14, 5),
                }));
              }
            }, 500);
          } else if (tt["roundstatus"] === 2) {
            // Racing phase
            clearInterval(countdownIntervalRef.current);
            setGameInfo((prev) => ({
              ...prev,
              countdown: "00:00",
              drawResult: "-",
            }));
          } else if (tt["roundstatus"] === 3) {
            // Done phase
            clearInterval(countdownIntervalRef.current);
            setGameInfo((prev) => ({ ...prev, countdown: "00:00" }));
          }

          // Extract draw result
          if (tt["drawresult"]) {
            const drawresult = tt["drawresult"];
            const result = [];
            for (let i = 1; i <= 10; i++) {
              result.push(drawresult[i]);
            }
            setGameInfo((prev) => ({
              ...prev,
              drawResult: result.join(","),
            }));
          }
        }
      });
    });
  };

  useEffect(() => {
    // Check if user is logged in (check for code === '0' instead of username)
    if (!userInfo || userInfo.code !== "0") {
      // navigate('/login');
      return;
    }

    // Initialize time display
    const timeInterval = setInterval(showTime, 1000);
    showTime();

    // Initialize session validation (check every 30 seconds like HTML files)
    const sessionInterval = setInterval(validateSession, 30000);
    // Validate session immediately on component mount
    validateSession();

    // Initialize WebSocket
    initWebSocket();

    // Initialize video connections
    if (video1Ref.current && video2Ref.current) {
      testConnection(url2, video1Ref.current, peerConnection1Ref);
      testConnection(url2, video2Ref.current, peerConnection2Ref);
    }

    // Auto reload after 10 minutes
    const reloadTimeout = setTimeout(() => {
      window.location.reload();
    }, 600000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(sessionInterval);
      clearInterval(countdownIntervalRef.current);
      clearTimeout(reloadTimeout);

      if (socketRef.current) {
        socketRef.current.close();
      }

      if (peerConnection1Ref.current) {
        peerConnection1Ref.current.close();
      }

      if (peerConnection2Ref.current) {
        peerConnection2Ref.current.close();
      }
    };
  }, [navigate]);

  return (
    <Box bg="black" minH="100vh" p={4}>
      <VStack spacing={4} align="stretch">
        {/* Header with user info and logout */}
        <HStack justify="space-between" w="100%" px={4}>
          <Text color="white" fontSize="lg">
            Welcome, {userInfo?.data?.username || userInfo?.username || "User"}
          </Text>
          <Button colorScheme="red" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </HStack>

        {/* Video Streams */}
        <HStack spacing={4} justify="center">
          <video
            ref={video1Ref}
            width="640"
            height="360"
            controls
            preload="auto"
            playsInline
            webkit-playsinline="true"
            autoPlay
            muted
            style={{ border: "2px solid white" }}
          />
          <video
            ref={video2Ref}
            width="640"
            height="360"
            controls
            preload="auto"
            playsInline
            webkit-playsinline="true"
            autoPlay
            muted
            style={{ border: "2px solid white" }}
          />
        </HStack>

        {/* Game Information */}
        <VStack spacing={2}>
          <HStack spacing={8} justify="center">
            <Text color="white" fontSize="4xl" fontWeight="bold">
              Round: {gameInfo.roundId}
            </Text>
            <Text color="white" fontSize="4xl" fontWeight="bold">
              Status: {gameInfo.roundStatus}
            </Text>
            <Text color="white" fontSize="4xl" fontWeight="bold">
              Result: {gameInfo.drawResult}
            </Text>
          </HStack>

          <HStack spacing={8} justify="center">
            <Text color="white" fontSize="4xl" fontWeight="bold">
              Time: {gameInfo.time}
            </Text>
            <Text color="white" fontSize="4xl" fontWeight="bold">
              Countdown: {gameInfo.countdown}
            </Text>
          </HStack>

          <Text color="white" fontSize="lg" textAlign="center">
            Connection Status: {connectionStatus}
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Dashboard;
