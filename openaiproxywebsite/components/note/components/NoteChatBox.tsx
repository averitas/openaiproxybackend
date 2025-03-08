import React, { useState } from 'react';
import { Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';

interface NoteChatBoxProps {
  visible: boolean;
  onClose: () => void;
  noteContent: string;
  setError: (message: string) => void;
  setOutputText: (text: string) => void;
}

const NoteChatBox: React.FC<NoteChatBoxProps> = ({
  visible,
  onClose,
  noteContent,
  setError,
  setOutputText
}) => {
  const [chatText, setChatText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = (text: string) => {
    if (!text) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setResponseText(`This is a mock response for: "${text}"`);
      setIsLoading(false);
    }, 2000);
  };

  const handleApply = () => {
    setOutputText(responseText);
    onClose();
  };

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        maxWidth: '90%',
        bgcolor: 'background.paper',
        border: '1px solid #000',
        boxShadow: 24,
        p: 4,
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1300
      }}
    >
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Chat about your note
      </Typography>
      
      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2, maxHeight: '400px' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          responseText && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <ReactMarkdown>{responseText}</ReactMarkdown>
              <Button onClick={handleApply} variant="contained" sx={{ mt: 2 }}>
                Apply
              </Button>
            </Paper>
          )
        )}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask a question about your note..."
          value={chatText}
          onChange={(e) => setChatText(e.target.value)}
          disabled={isLoading}
        />
        <Button 
          variant="contained" 
          onClick={() => sendMessage(chatText)} 
          disabled={!chatText || isLoading}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default NoteChatBox;
