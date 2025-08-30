import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Pricing from "@/pages/pricing";
import Dashboard from "@/pages/dashboard";
import Features from "@/pages/features";
import About from "@/pages/about";
import Argumentos from "@/pages/argumentos";
import Repertorio from "@/pages/repertorio";
import Simulador from "@/pages/simulador";
import Estilo from "@/pages/estilo";
import Settings from "@/pages/settings";
import Functionalities from "@/pages/functionalities";
import Newsletter from "@/pages/newsletter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/features" component={Features} />
      <Route path="/about" component={About} />
      <Route path="/argumentos" component={Argumentos} />
      <Route path="/repertorio" component={Repertorio} />
      <Route path="/simulador" component={Simulador} />
      <Route path="/estilo" component={Estilo} />
      <Route path="/settings" component={Settings} />
      <Route path="/functionalities" component={Functionalities} />
      <Route path="/newsletter" component={Newsletter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
