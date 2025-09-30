import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/scroll-to-top";
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
import Goals from "@/pages/goals";
import Exams from "@/pages/exams";
import Functionalities from "@/pages/functionalities";
import Newsletter from "@/pages/newsletter";
import { EstruturaCuringa } from "@/pages/estrutura-curinga";
import ControladorEscrita from "@/pages/controlador-escrita";
import Simulacao from "@/pages/simulacao";
import { Resultado } from "@/pages/resultado";
import Biblioteca from "@/pages/biblioteca";
import MaterialComplementar from "@/pages/material-complementar";
import Propostas from "@/pages/propostas";
import MapaMental from "@/pages/mapa-mental";
import EditStructurePage from "@/pages/edit-structure";
import UseStructurePage from "@/pages/use-structure-page";
import CreateStructurePage from "@/pages/create-structure-page";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminNewsletter from "@/pages/admin-newsletter";
import AdminMateriais from "@/pages/admin-materiais";
import Checkout from "@/pages/checkout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/features" component={Features} />
      <Route path="/about" component={About} />
      <Route path="/argumentos" component={Argumentos} />
      <Route path="/repertorio" component={Repertorio} />
      <Route path="/simulador" component={Simulador} />
      <Route path="/estilo" component={Estilo} />
      <Route path="/settings" component={Settings} />
      <Route path="/goals" component={Goals} />
      <Route path="/exams" component={Exams} />
      <Route path="/functionalities" component={Functionalities} />
      <Route path="/newsletter" component={Newsletter} />
      <Route path="/estrutura-curinga" component={EstruturaCuringa} />
      <Route path="/controlador-escrita" component={ControladorEscrita} />
      <Route path="/simulacao" component={Simulacao} />
      <Route path="/resultado" component={Resultado} />
      <Route path="/biblioteca" component={Biblioteca} />
      <Route path="/material-complementar" component={MaterialComplementar} />
      <Route path="/propostas" component={Propostas} />
      <Route path="/mapa-mental" component={MapaMental} />
      <Route path="/edit-structure" component={EditStructurePage} />
      <Route path="/use-structure" component={UseStructurePage} />
      <Route path="/create-structure" component={CreateStructurePage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/newsletter" component={AdminNewsletter} />
      <Route path="/admin/materiais" component={AdminMateriais} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ScrollToTop />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
