import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Send,
  Person,
  SmartToy,
  ExpandMore,
  ExpandLess,
  Source,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

import { askQuestion } from '../services/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content:
        "Hello! I'm here to help you understand healthcare terms and processes. You can ask me about HCPCS codes, claim processing, medical equipment, regulations, and more. What would you like to know?",
      sources: [],
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('standard');
  const [expandedSources, setExpandedSources] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await askQuestion(inputMessage, mode);

      const botMessage = {
        type: 'bot',
        content: response.answer,
        sources: response.sources || [],
        mode: response.mode,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        content:
          'I apologize, but I encountered an error while processing your question. Please try again or rephrase your question.',
        sources: [],
        timestamp: new Date(),
        error: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSourcesExpanded = (messageIndex) => {
    setExpandedSources((prev) => ({
      ...prev,
      [messageIndex]: !prev[messageIndex],
    }));
  };

  const suggestionQuestions = [
    'What is HCPCS?',
    'Explain DME claim processing',
    "What's the difference between CPT and HCPCS codes?",
    'How does EDI 837 work?',
    'What are HIPAA requirements?',
  ];

  const getModeColor = (messageMode) => {
    switch (messageMode) {
      case 'simple':
        return 'success';
      case 'glossary':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getModeLabel = (messageMode) => {
    switch (messageMode) {
      case 'simple':
        return 'Simple';
      case 'glossary':
        return 'Definition';
      default:
        return 'Standard';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
      {/* Mode Selector */}
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Response Mode</InputLabel>
          <Select
            value={mode}
            label="Response Mode"
            onChange={(e) => setMode(e.target.value)}
          >
            <MenuItem value="standard">Standard</MenuItem>
            <MenuItem value="simple">Simple (Beginner)</MenuItem>
            <MenuItem value="glossary">Glossary (Quick Definition)</MenuItem>
          </Select>
        </FormControl>
        <Typography
          variant="caption"
          display="block"
          sx={{ mt: 1, color: 'text.secondary' }}
        >
          {mode === 'simple' && 'Easy-to-understand explanations for beginners'}
          {mode === 'glossary' && 'Quick definitions and explanations'}
          {mode === 'standard' && 'Comprehensive explanations with context'}
        </Typography>
      </Box>

      {/* Messages Container */}
      <Paper
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          mb: 2,
          backgroundColor: 'background.default',
        }}
      >
        {messages.map((message, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Card
              sx={{
                maxWidth: '80%',
                ml: message.type === 'user' ? 'auto' : 0,
                mr: message.type === 'bot' ? 'auto' : 0,
                bgcolor:
                  message.type === 'user'
                    ? 'primary.light'
                    : 'background.paper',
                color:
                  message.type === 'user'
                    ? 'primary.contrastText'
                    : 'text.primary',
              }}
            >
              <CardContent sx={{ pb: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {message.type === 'user' ? (
                    <Person sx={{ mr: 1, fontSize: 20 }} />
                  ) : (
                    <SmartToy sx={{ mr: 1, fontSize: 20 }} />
                  )}
                  <Typography variant="subtitle2">
                    {message.type === 'user' ? 'You' : 'Healthcare Assistant'}
                  </Typography>
                  {message.mode && (
                    <Chip
                      label={getModeLabel(message.mode)}
                      color={getModeColor(message.mode)}
                      size="small"
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </Box>

                <Box
                  sx={{
                    '& p': { margin: '0.5em 0' },
                    '& ul': { paddingLeft: 2 },
                    '& li': { marginBottom: 0.5 },
                  }}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </Box>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleSourcesExpanded(index)}
                        sx={{ p: 0.5 }}
                      >
                        <Source fontSize="small" />
                        {expandedSources[index] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </IconButton>
                      <Typography variant="caption" sx={{ ml: 1 }}>
                        {message.sources.length} source
                        {message.sources.length > 1 ? 's' : ''}
                      </Typography>
                    </Box>

                    <Collapse in={expandedSources[index]}>
                      <List
                        dense
                        sx={{ mt: 1, bgcolor: 'action.hover', borderRadius: 1 }}
                      >
                        {message.sources.map((source, sourceIndex) => (
                          <ListItem
                            key={sourceIndex}
                            divider={sourceIndex < message.sources.length - 1}
                          >
                            <ListItemText
                              primary={source}
                              primaryTypographyProps={{ variant: 'caption' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </Box>
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Card sx={{ maxWidth: '80%' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <SmartToy sx={{ mr: 1 }} />
                <CircularProgress size={20} sx={{ mr: 2 }} />
                <Typography variant="body2">Thinking...</Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Try asking about:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestionQuestions.map((question, index) => (
              <Chip
                key={index}
                label={question}
                variant="outlined"
                clickable
                onClick={() => setInputMessage(question)}
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Input Area */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about healthcare terms, processes, or regulations..."
          disabled={isLoading}
          variant="outlined"
        />
        <Button
          variant="contained"
          endIcon={<Send />}
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          sx={{ minWidth: 100 }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;
