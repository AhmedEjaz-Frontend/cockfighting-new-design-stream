import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";
import 'antd/dist/reset.css'; // Import Ant Design styles
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

const system = createSystem(defaultConfig);

function App() {
  return (
    <ChakraProvider value={system}>
      <Router>
        <div className="App">
          <Routes>
            {/* Default route - redirect to dashboard if logged in, otherwise to login */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Login route */}
            <Route path="/login" element={<Login />} />

            {/* Protected dashboard route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all other routes and redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;
