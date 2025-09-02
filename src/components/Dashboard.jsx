import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Grid,
  GridItem,
  useBreakpointValue,
  Image,
  Flex,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import logoImage from "../../assets/img/20250701_wala_logo_02 1.png";

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

  // Obfuscated URLs to prevent inspection
  const getStreamUrl = (type) => {
    const baseUrl = atob("aHR0cHM6Ly9saXZlLmxpdjAwNy5zaXRlLw==");
    const endpoints = {
      primary: atob("TVIwMS93aGVw"),
      secondary: atob("TVIwMUZ1bGwvd2hlcA=="),
    };
    return baseUrl + endpoints[type];
  };

  const getWebSocketUrl = () => {
    return atob("d3NzOi8vYXBpLnN0YWdlY29kZS5vbmxpbmU6ODQ0My93cw==");
  };

  const url1 = getStreamUrl("primary");
  const url2 = getStreamUrl("secondary");
  const wss1 = getWebSocketUrl();

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
      // handleLogout();
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
        // handleLogout();
      }
    } catch (error) {
      console.error("Session validation error:", error);
      // On network error, don't logout automatically
    }
  };

  const handleLogout = () => {
    // localStorage.removeItem("userInfo");
    // localStorage.removeItem("sess_id");
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
      testConnection(url1, video1Ref.current, peerConnection1Ref);
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
    <Box 
      bgGradient="linear(to-br, #11083A, #4E1111)" 
      minH="100vh" 
      p={4}
    >
      <VStack spacing={4} align="stretch">
        {/* Enhanced Header with logo, user info and logout */}
        <Box 
          bg="rgba(255, 255, 255, 0.08)" 
          backdropFilter="blur(20px)" 
          borderRadius="xl" 
          border="1px solid rgba(255, 255, 255, 0.2)" 
          p={4}
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
        >
          <Flex justify="space-between" align="center" w="100%">
            <Flex align="center" gap={4}>
              <Image 
                src={logoImage} 
                alt="Wala Logo" 
                h="50px" 
                w="auto" 
                objectFit="contain"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
              />
              <Text 
                color="white" 
                fontSize="lg" 
                fontFamily="'Venite Adoremus', 'Poppins', 'Inter', sans-serif"
                fontWeight="600"
              >
                Welcome, {userInfo?.data?.username || userInfo?.username || "User"}
              </Text>
            </Flex>
            <Button 
              colorScheme="red" 
              size="sm" 
              onClick={handleLogout}
              bg="linear-gradient(135deg, #ef4444, #dc2626)"
              _hover={{
                bg: "linear-gradient(135deg, #dc2626, #b91c1c)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)"
              }}
              transition="all 0.2s ease"
            >
              Logout
            </Button>
          </Flex>
        </Box>

        {/* Video Streams */}
        <VStack spacing={4}>
          <Text
            color="white"
            fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
            textAlign="center"
            fontWeight="bold"
          >
            Live Video Streams
          </Text>
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={6}
            w="100%"
            maxW="1400px"
            mx="auto"
          >
            <GridItem>
              <Box
                position="relative"
                w="100%"
                bg="gray.900"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="2xl"
                border="2px solid"
                borderColor="whiteAlpha.300"
                _hover={{
                  borderColor: "whiteAlpha.500",
                  transform: "translateY(-2px)",
                  transition: "all 0.3s ease",
                }}
              >
                <video
                  ref={video1Ref}
                  width="100%"
                  height="auto"
                  controls
                  preload="auto"
                  playsInline
                  webkit-playsinline="true"
                  autoPlay
                  muted
                  style={{
                    display: "block",
                    backgroundColor: "#1a1a1a",
                    aspectRatio: "16/9",
                  }}
                  onLoadStart={() => console.log("Video 1 loading started")}
                  onCanPlay={() => console.log("Video 1 can play")}
                  onError={(e) => console.error("Video 1 error:", e)}
                />
                <Box
                  position="absolute"
                  bottom={3}
                  left={3}
                  bg="blackAlpha.800"
                  color="white"
                  px={3}
                  py={1}
                  borderRadius="md"
                  fontSize="sm"
                  fontWeight="semibold"
                  backdropFilter="blur(10px)"
                >
                  Stream 1
                </Box>
              </Box>
            </GridItem>
            <GridItem>
              <Box
                position="relative"
                w="100%"
                bg="gray.900"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="2xl"
                border="2px solid"
                borderColor="whiteAlpha.300"
                _hover={{
                  borderColor: "whiteAlpha.500",
                  transform: "translateY(-2px)",
                  transition: "all 0.3s ease",
                }}
              >
                <video
                  ref={video2Ref}
                  width="100%"
                  height="auto"
                  controls
                  preload="auto"
                  playsInline
                  webkit-playsinline="true"
                  autoPlay
                  muted
                  style={{
                    display: "block",
                    backgroundColor: "#1a1a1a",
                    aspectRatio: "16/9",
                  }}
                  onLoadStart={() => console.log("Video 2 loading started")}
                  onCanPlay={() => console.log("Video 2 can play")}
                  onError={(e) => console.error("Video 2 error:", e)}
                />
                <Box
                  position="absolute"
                  bottom={3}
                  left={3}
                  bg="blackAlpha.800"
                  color="white"
                  px={3}
                  py={1}
                  borderRadius="md"
                  fontSize="sm"
                  fontWeight="semibold"
                  backdropFilter="blur(10px)"
                >
                  Stream 2
                </Box>
              </Box>
            </GridItem>
          </Grid>
        </VStack>

        {/* Game Information */}
        <Box
          bg="whiteAlpha.100"
          borderRadius="xl"
          p={{ base: 4, md: 6 }}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor="whiteAlpha.200"
          maxW="1200px"
          mx="auto"
          w="100%"
        >
          <VStack spacing={4}>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={4}
              w="100%"
            >
              <GridItem>
                <VStack spacing={1}>
                  <Text
                    color="gray.300"
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="medium"
                  >
                    Round
                  </Text>
                  <Text
                    color="white"
                    fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                    fontWeight="bold"
                    textAlign="center"
                  >
                    {gameInfo.roundId || "--"}
                  </Text>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack spacing={1}>
                  <Text
                    color="gray.300"
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="medium"
                  >
                    Status
                  </Text>
                  <Text
                    color="white"
                    fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                    fontWeight="bold"
                    textAlign="center"
                  >
                    {gameInfo.roundStatus || "--"}
                  </Text>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack spacing={1}>
                  <Text
                    color="gray.300"
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="medium"
                  >
                    Result
                  </Text>
                  <Text
                    color="white"
                    fontSize={{ base: "xl", md: "2xl", lg: "3xl" }}
                    fontWeight="bold"
                    textAlign="center"
                  >
                    {gameInfo.drawResult || "--"}
                  </Text>
                </VStack>
              </GridItem>
            </Grid>

            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={4}
              w="100%"
              mt={4}
            >
              <GridItem>
                <VStack spacing={1}>
                  <Text
                    color="gray.300"
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="medium"
                  >
                    Time
                  </Text>
                  <Text
                    color="white"
                    fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                    fontWeight="bold"
                    textAlign="center"
                  >
                    {gameInfo.time || "--"}
                  </Text>
                </VStack>
              </GridItem>
              <GridItem>
                <VStack spacing={1}>
                  <Text
                    color="gray.300"
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="medium"
                  >
                    Countdown
                  </Text>
                  <Text
                    color="white"
                    fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                    fontWeight="bold"
                    textAlign="center"
                  >
                    {gameInfo.countdown || "--"}
                  </Text>
                </VStack>
              </GridItem>
            </Grid>

            <Box mt={4} p={3} bg="blackAlpha.300" borderRadius="lg" w="100%">
              <Text
                color={
                  connectionStatus === "Connected" ? "green.300" : "yellow.300"
                }
                fontSize={{ base: "md", md: "lg" }}
                textAlign="center"
                fontWeight="semibold"
              >
                Connection Status: {connectionStatus}
              </Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default Dashboard;
