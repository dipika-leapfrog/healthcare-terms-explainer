import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Tabs, Tab, useTheme, useMediaQuery } from '@mui/material';
import {
  Home,
  Chat,
  MenuBook,
  Compare,
  CloudUpload,
} from '@mui/icons-material';

const Navigation = () => {
  const [value, setValue] = React.useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const tabs = [
    { label: 'Home', icon: <Home />, path: '/' },
    { label: 'Chat', icon: <Chat />, path: '/chat' },
    { label: 'Glossary', icon: <MenuBook />, path: '/glossary' },
    { label: 'Compare', icon: <Compare />, path: '/compare' },
    { label: 'Upload', icon: <CloudUpload />, path: '/upload' },
  ];

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        variant={isMobile ? 'scrollable' : 'standard'}
        scrollButtons="auto"
        allowScrollButtonsMobile
        centered={!isMobile}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            component={RouterLink}
            to={tab.path}
            icon={tab.icon}
            label={!isMobile ? tab.label : undefined}
            iconPosition="start"
            sx={{
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 500,
            }}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default Navigation;
