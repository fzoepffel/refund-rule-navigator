
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MerchantRules from "./pages/MerchantRules";
import RuleSimulator from "./pages/RuleSimulator";
import RuleEditor from "./pages/RuleEditor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/merchant-rules" element={<MerchantRules />} />
          <Route path="/rule-simulator" element={<RuleSimulator />} />
          <Route path="/rule-simulator/:ruleId" element={<RuleSimulator />} />
          <Route path="/rule-editor" element={<RuleEditor />} />
          <Route path="/rule-editor/:id" element={<RuleEditor />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
