import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import './App.css';

const system = createSystem(defaultConfig);

function App() {
  return (
    <ChakraProvider value={system}>
      <Router>
        <div className="App">
          <Routes>
            {/* Default route - redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
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
            
            {/* Catch all other routes and redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
      <Toaster />
    </ChakraProvider>
  );
}

export default App;
