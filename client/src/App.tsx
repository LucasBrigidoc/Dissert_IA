import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/scroll-to-top";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import AdminCoupons from "@/pages/admin-coupons";
import Checkout from "@/pages/checkout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/features" component={Features} />
      <Route path="/about" component={About} />
      <Route path="/newsletter" component={Newsletter} />
      
      <Route path="/checkout">
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route path="/goals">
        <ProtectedRoute>
          <Goals />
        </ProtectedRoute>
      </Route>
      <Route path="/exams">
        <ProtectedRoute>
          <Exams />
        </ProtectedRoute>
      </Route>
      <Route path="/functionalities">
        <ProtectedRoute>
          <Functionalities />
        </ProtectedRoute>
      </Route>
      <Route path="/argumentos">
        <ProtectedRoute>
          <Argumentos />
        </ProtectedRoute>
      </Route>
      <Route path="/repertorio">
        <ProtectedRoute>
          <Repertorio />
        </ProtectedRoute>
      </Route>
      <Route path="/simulador">
        <ProtectedRoute>
          <Simulador />
        </ProtectedRoute>
      </Route>
      <Route path="/simulacao">
        <ProtectedRoute>
          <Simulacao />
        </ProtectedRoute>
      </Route>
      <Route path="/estilo">
        <ProtectedRoute>
          <Estilo />
        </ProtectedRoute>
      </Route>
      <Route path="/estrutura-curinga">
        <ProtectedRoute>
          <EstruturaCuringa />
        </ProtectedRoute>
      </Route>
      <Route path="/controlador-escrita">
        <ProtectedRoute>
          <ControladorEscrita />
        </ProtectedRoute>
      </Route>
      <Route path="/resultado">
        <ProtectedRoute>
          <Resultado />
        </ProtectedRoute>
      </Route>
      <Route path="/biblioteca">
        <ProtectedRoute>
          <Biblioteca />
        </ProtectedRoute>
      </Route>
      <Route path="/material-complementar">
        <ProtectedRoute>
          <MaterialComplementar />
        </ProtectedRoute>
      </Route>
      <Route path="/propostas">
        <ProtectedRoute>
          <Propostas />
        </ProtectedRoute>
      </Route>
      <Route path="/mapa-mental">
        <ProtectedRoute>
          <MapaMental />
        </ProtectedRoute>
      </Route>
      <Route path="/edit-structure">
        <ProtectedRoute>
          <EditStructurePage />
        </ProtectedRoute>
      </Route>
      <Route path="/use-structure">
        <ProtectedRoute>
          <UseStructurePage />
        </ProtectedRoute>
      </Route>
      <Route path="/create-structure">
        <ProtectedRoute>
          <CreateStructurePage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/newsletter">
        <ProtectedRoute>
          <AdminNewsletter />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/materiais">
        <ProtectedRoute>
          <AdminMateriais />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/coupons">
        <ProtectedRoute>
          <AdminCoupons />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ScrollToTop />
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
