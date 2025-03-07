import React, { useState, useEffect } from 'react';
import { Box, IconButton, Paper, Typography, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ReactMarkdown from 'react-markdown';

interface ThoughtBubbleProps {
  thought: string;
  defaultExpanded?: boolean;
}

const ThoughtBubble: React.FC<ThoughtBubbleProps> = ({ thought, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // Update expanded state when defaultExpanded prop changes
  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  if (!thought) {
    return null;
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1,
        my: 1,
        backgroundColor: '#f5f5f5',
        borderLeft: '4px solid #7986cb',
        borderRadius: 1
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PsychologyIcon 
            sx={{ 
              mr: 1, 
              color: '#5c6bc0',
              fontSize: '1.2rem'
            }} 
          />
          <Typography variant="subtitle2" color="textSecondary">
            AI Reasoning Process
          </Typography>
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 1, px: 1, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
          <ReactMarkdown>{thought}</ReactMarkdown>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ThoughtBubble;
