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
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Compare, SwapHoriz } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

import { compareTerms } from '../services/api';

const ComparisonMode = () => {
  const [term1, setTerm1] = useState('');
  const [term2, setTerm2] = useState('');
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState([]);

  const commonComparisons = [
    { term1: 'CPT', term2: 'HCPCS', description: 'Coding systems comparison' },
    { term1: 'EDI 837', term2: 'EDI 835', description: 'Transaction types' },
    { term1: 'Medicare', term2: 'Medicaid', description: 'Insurance programs' },
    {
      term1: 'Copay',
      term2: 'Deductible',
      description: 'Payment responsibilities',
    },
    {
      term1: 'ICD-10',
      term2: 'CPT',
      description: 'Diagnosis vs procedure codes',
    },
  ];

  const handleCompare = async () => {
    if (!term1.trim() || !term2.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await compareTerms(term1, term2);
      setComparison(response.comparison);
      setSources(response.sources || []);
    } catch (error) {
      setComparison(
        'Sorry, I could not compare these terms. Please check the spelling and try again.'
      );
      setSources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapTerms = () => {
    const temp = term1;
    setTerm1(term2);
    setTerm2(temp);
  };

  const handlePresetComparison = (preset) => {
    setTerm1(preset.term1);
    setTerm2(preset.term2);
    performComparison(preset.term1, preset.term2);
  };

  const performComparison = async (t1, t2) => {
    setIsLoading(true);
    try {
      const response = await compareTerms(t1, t2);
      setComparison(response.comparison);
      setSources(response.sources || []);
    } catch (error) {
      setComparison('Sorry, I could not compare these terms.');
      setSources([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <Compare sx={{ mr: 2 }} />
        Term Comparison
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Compare and contrast healthcare terms, concepts, or processes to
        understand their differences and similarities.
      </Typography>

      {/* Comparison Input */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label="First Term"
            value={term1}
            onChange={(e) => setTerm1(e.target.value)}
            placeholder="e.g., CPT"
            disabled={isLoading}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={2} sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={handleSwapTerms}
            disabled={isLoading}
            sx={{ minWidth: 60 }}
          >
            <SwapHoriz />
          </Button>
        </Grid>

        <Grid item xs={12} sm={5}>
          <TextField
            fullWidth
            label="Second Term"
            value={term2}
            onChange={(e) => setTerm2(e.target.value)}
            placeholder="e.g., HCPCS"
            disabled={isLoading}
            variant="outlined"
          />
        </Grid>
      </Grid>

      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<Compare />}
          onClick={handleCompare}
          disabled={!term1.trim() || !term2.trim() || isLoading}
        >
          Compare Terms
        </Button>
      </Box>

      {/* Common Comparisons */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Common Comparisons
        </Typography>
        <Grid container spacing={2}>
          {commonComparisons.map((preset, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
                onClick={() => handlePresetComparison(preset)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={preset.term1}
                      size="small"
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="body2" sx={{ mx: 1 }}>
                      vs
                    </Typography>
                    <Chip label={preset.term2} size="small" color="secondary" />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {preset.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body2">
            Comparing {term1} vs {term2}...
          </Typography>
        </Paper>
      )}

      {/* Comparison Result */}
      {comparison && !isLoading && (
        <Card>
          <CardContent>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Chip label={term1} color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ mx: 1 }}>
                vs
              </Typography>
              <Chip label={term2} color="secondary" />
            </Typography>

            <Box
              sx={{
                '& p': { margin: '0.5em 0' },
                '& ul': { paddingLeft: 2 },
                '& li': { marginBottom: 0.5 },
                '& h1, & h2, & h3': { color: 'primary.main', marginTop: '1em' },
              }}
            >
              <ReactMarkdown>{comparison}</ReactMarkdown>
            </Box>

            {/* Sources */}
            {sources.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Sources
                </Typography>
                <List dense>
                  {sources.map((source, index) => (
                    <ListItem key={index} divider={index < sources.length - 1}>
                      <ListItemText
                        primary={source}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {!comparison && !isLoading && (
        <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom>
            How to use Term Comparison
          </Typography>
          <Typography variant="body2" paragraph>
            • Enter two healthcare terms you want to compare
          </Typography>
          <Typography variant="body2" paragraph>
            • Click on preset comparisons for common term pairs
          </Typography>
          <Typography variant="body2" paragraph>
            • Get detailed explanations of similarities and differences
          </Typography>
          <Typography variant="body2">
            • Perfect for understanding relationships between healthcare
            concepts
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ComparisonMode;
