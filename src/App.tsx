import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    blue: [
      '#022d94',
      '#022d94',
      '#022d94',
      '#022d94',
      '#022d94',
      '#022d94',
      '#022d94',
      '#022d94',
      '#022d94',
      '#022d94',
    ],
  },
  fontFamily: 'Roboto, sans-serif',
  components: {
    Text: {
      defaultProps: {
        ff: 'Roboto',
      },
    },
    Title: {
      defaultProps: {
        ff: 'Roboto',
      },
    },
    Button: {
      defaultProps: {
        ff: 'Roboto',
      },
    },
    Badge: {
      defaultProps: {
        ff: 'Roboto',
      },
    },
    Chip: {
      defaultProps: {
        ff: 'Roboto',
      },
    },
    Select: {
      defaultProps: {
        ff: 'Roboto',
      },
    },
    NumberInput: {
      defaultProps: {
        ff: 'Roboto',
      },
    },
    TextInput: {
      defaultProps: {
        ff: 'Roboto',
      },
    },
    Textarea: {
      defaultProps: {
        ff: 'Roboto',
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MantineProvider theme={theme}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </MantineProvider>
  </QueryClientProvider>
);

export default App;
