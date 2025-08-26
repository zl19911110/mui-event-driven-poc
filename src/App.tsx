// src/App.tsx
import React, { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { DragProvider } from './contexts/DragContext';
import { Editor } from './components/Editor/Editor';
import { eventStore } from './store/UIEventStore';

// 创建主题
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

function App() {
  // 应用启动时尝试加载保存的项目
  useEffect(() => {
    try {
      const savedProject = localStorage.getItem('ui-editor-project');
      if (savedProject) {
        const data = JSON.parse(savedProject);
        eventStore.importData(data);
        console.log('Loaded saved project from localStorage');
      }
    } catch (error) {
      console.warn('Failed to load saved project:', error);
      // 如果加载失败，清理损坏的数据
      localStorage.removeItem('ui-editor-project');
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DragProvider>
        <Box
          sx={{
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            backgroundColor: 'background.default'
          }}
        >
          <Editor />
        </Box>
      </DragProvider>
    </ThemeProvider>
  );
}

export default App;