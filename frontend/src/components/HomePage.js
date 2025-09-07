import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
} from '@mui/material';
import {
  Chat,
  MenuBook,
  Compare,
  CloudUpload,
  LocalHospital,
} from '@mui/icons-material';

const HomePage = () => {
  const features = [
    {
      title: 'Interactive Chat',
      description:
        'Ask questions about healthcare terms and processes in natural language',
      icon: <Chat color="primary" />,
      path: '/chat',
    },
    {
      title: 'Glossary Mode',
      description: 'Get quick definitions of healthcare terms and acronyms',
      icon: <MenuBook color="primary" />,
      path: '/glossary',
    },
    {
      title: 'Term Comparison',
      description:
        'Compare and contrast different healthcare terms or concepts',
      icon: <Compare color="primary" />,
      path: '/compare',
    },
    {
      title: 'Document Upload',
      description: 'Upload your own healthcare documents for Q&A',
      icon: <CloudUpload color="primary" />,
      path: '/upload',
    },
  ];

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <LocalHospital sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
        <Typography variant="h2" component="h1" gutterBottom>
          Healthcare Terms & Processes Explainer
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          AI-powered healthcare terminology and processes explainer using
          LangChain and RAG
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          sx={{ maxWidth: 800, mx: 'auto' }}
        >
          Get accurate, source-attributed answers about US healthcare terms,
          processes, and regulations from official healthcare documents
          including CMS publications, HCPCS codes, and HIPAA guides.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            component={RouterLink}
            to="/chat"
            variant="contained"
            size="large"
            sx={{ mr: 2, mb: 2 }}
          >
            Start Chatting
          </Button>
          <Button
            component={RouterLink}
            to="/glossary"
            variant="outlined"
            size="large"
            sx={{ mb: 2 }}
          >
            Browse Glossary
          </Button>
        </Box>
      </Box>

      {/* Features Grid */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
        Features
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {feature.icon}
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ ml: 1, flexGrow: 1 }}
                  >
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  component={RouterLink}
                  to={feature.path}
                  size="small"
                  variant="outlined"
                  fullWidth
                >
                  Try it
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default HomePage;
