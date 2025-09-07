import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  CheckCircle,
  Error,
  PictureAsPdf,
  TextFields,
} from '@mui/icons-material';

import { uploadDocument, getDocuments } from '../services/api';

const DocumentUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  React.useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await getDocuments();
      setDocuments(response.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus(null);
    }
  };

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isValidFileType(file)) {
        setSelectedFile(file);
        setUploadStatus(null);
      } else {
        setUploadStatus({
          type: 'error',
          message: 'Please select a valid file type (PDF, TXT, MD, DOCX)',
        });
      }
    }
  }, []);

  const isValidFileType = (file) => {
    const validTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const validExtensions = ['.pdf', '.txt', '.md', '.docx'];

    return (
      validTypes.includes(file.type) ||
      validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
    );
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadDocument(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadStatus({
        type: 'success',
        message:
          response.message || 'Document uploaded and processed successfully!',
      });

      setSelectedFile(null);
      loadDocuments(); // Refresh document list
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to upload document. Please try again.',
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const getFileIcon = (filename) => {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return <PictureAsPdf color="error" />;
      case 'txt':
      case 'md':
        return <TextFields color="primary" />;
      default:
        return <Description color="action" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <CloudUpload sx={{ mr: 2 }} />
        Document Upload
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Upload your own healthcare documents to expand the knowledge base and
        ask questions about them.
      </Typography>

      {/* Upload Area */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              border: 2,
              borderColor: isDragOver ? 'primary.main' : 'grey.300',
              borderStyle: 'dashed',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              bgcolor: isDragOver ? 'action.hover' : 'background.default',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.txt,.md,.docx"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <CloudUpload
              sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}
            />

            <Typography variant="h6" gutterBottom>
              {isDragOver
                ? 'Drop your file here'
                : 'Upload Healthcare Document'}
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              Drag and drop a file here, or click to select
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Supported formats: PDF, TXT, MD, DOCX (Max size: 10MB)
            </Typography>
          </Box>

          {/* Selected File Info */}
          {selectedFile && (
            <Box sx={{ mt: 3 }}>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getFileIcon(selectedFile.name)}
                  <Box sx={{ ml: 2, flexGrow: 1 }}>
                    <Typography variant="subtitle1" noWrap>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(selectedFile.size)}
                    </Typography>
                  </Box>
                  <Chip
                    label={selectedFile.name.split('.').pop().toUpperCase()}
                    size="small"
                    color="primary"
                  />
                </Box>

                {isUploading && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                    />
                    <Typography variant="caption" sx={{ mt: 1 }}>
                      Uploading and processing... {uploadProgress}%
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={isUploading}
                  fullWidth
                >
                  {isUploading ? 'Processing...' : 'Upload and Process'}
                </Button>
              </Paper>
            </Box>
          )}

          {/* Upload Status */}
          {uploadStatus && (
            <Alert
              severity={uploadStatus.type}
              sx={{ mt: 2 }}
              icon={
                uploadStatus.type === 'success' ? <CheckCircle /> : <Error />
              }
            >
              {uploadStatus.message}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Processed Documents List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Processed Documents ({documents.length})
          </Typography>

          {documents.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No documents have been processed yet. Upload a document to get
                started.
              </Typography>
            </Box>
          ) : (
            <List>
              {documents.map((doc, index) => (
                <ListItem key={index} divider={index < documents.length - 1}>
                  <ListItemIcon>{getFileIcon(doc.source)}</ListItemIcon>
                  <ListItemText
                    primary={doc.source.split('/').pop()}
                    secondary={`${doc.chunks} chunks processed • ${doc.document_type}`}
                  />
                  <Chip
                    label={`${doc.chunks} chunks`}
                    size="small"
                    variant="outlined"
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card sx={{ mt: 3, bgcolor: 'background.default' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Document Processing Information
          </Typography>
          <Typography variant="body2" paragraph>
            • Documents are automatically processed and split into chunks for
            better retrieval
          </Typography>
          <Typography variant="body2" paragraph>
            • Processed documents become part of the knowledge base for Q&A
          </Typography>
          <Typography variant="body2" paragraph>
            • You can ask questions about uploaded documents using the Chat
            interface
          </Typography>
          <Typography variant="body2">
            • Supported file types: PDF, TXT, MD, DOCX
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DocumentUpload;
