import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const ColorModeContext = createContext({ toggleColorMode: () => { } });

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('themeMode') || 'light';
    });

    useEffect(() => {
        localStorage.setItem('themeMode', mode);
    }, [mode]);

    const colorMode = useMemo(() => ({
        toggleColorMode: () => {
            setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
        },
        mode
    }), [mode]);

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    // Light mode custom palette
                    primary: { main: '#ed6c02' },
                    background: { default: '#f5f5f5', paper: '#ffffff' },
                }
                : {
                    // Dark mode custom palette
                    primary: { main: '#ffa726' },
                    background: { default: '#121212', paper: '#1e1e1e' },
                    text: {
                        primary: '#ffffff',
                        secondary: 'rgba(255, 255, 255, 0.7)',
                    }
                }),
        },
        typography: {
            fontFamily: '"Inter", "system-ui", "-apple-system", sans-serif',
            h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 800 },
            h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 800 },
            h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 800 },
            h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
            h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
            h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
            button: { fontWeight: 600, textTransform: 'none' },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        colorScheme: mode,
                        margin: 0,
                        height: '100vh',
                        overflow: 'hidden',
                    },
                    '#root': {
                        height: '100vh',
                    }
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundImage: mode === 'light'
                            ? 'linear-gradient(45deg, #ed6c02 30%, #ffb74d 90%)'
                            : 'linear-gradient(45deg, #e65100 30%, #fb8c00 90%)',
                    }
                }
            }
        }
    }), [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};
