import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Paper,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Search, MenuBook } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

import { askQuestion } from '../services/api';

const GlossaryMode = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [definition, setDefinition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const commonTerms = [
    'HCPCS',
    'CPT',
    'ICD-10',
    'DME',
    'EDI',
    'HIPAA',
    'CMS',
    'Prior Authorization',
    'Copay',
    'Deductible',
    'EOB',
    'Claims Processing',
  ];

  const handleSearch = async (term = searchTerm) => {
    if (!term.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await askQuestion(term, 'glossary');
      setDefinition(response.answer);
    } catch (error) {
      setDefinition(
        'Sorry, I could not find a definition for that term. Please try another term or check the spelling.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermClick = (term) => {
    setSearchTerm(term);
    handleSearch(term);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <MenuBook sx={{ mr: 2 }} />
        Healthcare Glossary
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Search for quick definitions of healthcare terms, acronyms, and
        concepts.
      </Typography>

      {/* Search Input */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a healthcare term (e.g., HCPCS, DME, Prior Authorization)"
          disabled={isLoading}
          variant="outlined"
        />
        <Button
          variant="contained"
          startIcon={<Search />}
          onClick={handleSearch}
          disabled={!searchTerm.trim() || isLoading}
          sx={{ minWidth: 120 }}
        >
          Define
        </Button>
      </Box>

      {/* Common Terms */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Common Terms
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {commonTerms.map((term) => (
            <Chip
              key={term}
              label={term}
              variant="outlined"
              clickable
              onClick={() => handleTermClick(term)}
              disabled={isLoading}
            />
          ))}
        </Box>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2">
            Looking up definition for "{searchTerm}"...
          </Typography>
        </Paper>
      )}

      {/* Definition Result */}
      {definition && !isLoading && (
        <Card>
          <CardContent>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ color: 'primary.main' }}
            >
              {searchTerm}
            </Typography>
            <Box
              sx={{
                '& p': { margin: '0.5em 0' },
                '& ul': { paddingLeft: 2 },
                '& li': { marginBottom: 0.5 },
              }}
            >
              <ReactMarkdown>{definition}</ReactMarkdown>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {!definition && !isLoading && (
        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom>
            How to use the Glossary
          </Typography>
          <Typography variant="body2" paragraph>
            • Type any healthcare term in the search box above
          </Typography>
          <Typography variant="body2" paragraph>
            • Click on any of the common terms for quick definitions
          </Typography>
          <Typography variant="body2" paragraph>
            • Get concise, accurate definitions with source attribution
          </Typography>
          <Typography variant="body2">
            • Perfect for quick reference while working with healthcare
            documents
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default GlossaryMode;
