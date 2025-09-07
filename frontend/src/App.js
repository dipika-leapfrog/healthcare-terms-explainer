import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// Components
import HomePage from './components/HomePage';
import ChatInterface from './components/ChatInterface';
import GlossaryMode from './components/GlossaryMode';
import ComparisonMode from './components/ComparisonMode';
import DocumentUpload from './components/DocumentUpload';
import Navigation from './components/Navigation';

// API Service
import { initializeSystem } from './services/api';

function App() {
  const [isSystemReady, setIsSystemReady] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const initSystem = async () => {
      try {
        await initializeSystem();
        setIsSystemReady(true);
      } catch (err) {
        setError(
          'Failed to initialize system. Please check your API configuration.'
        );
        setShowError(true);
      }
    };

    initSystem();
  }, []);

  const handleCloseError = () => {
    setShowError(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Healthcare Terms & Processes Explainer
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {!isSystemReady ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Initializing Healthcare Explainer...
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Setting up the knowledge base and AI models...
            </Typography>
          </Box>
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatInterface />} />
            <Route path="/glossary" element={<GlossaryMode />} />
            <Route path="/compare" element={<ComparisonMode />} />
            <Route path="/upload" element={<DocumentUpload />} />
          </Routes>
        )}
      </Container>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
