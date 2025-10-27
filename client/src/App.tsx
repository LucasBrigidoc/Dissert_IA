import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/scroll-to-top";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HelmetProvider } from "react-helmet-async";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Pricing from "@/pages/pricing";
import Dashboard from "@/pages/dashboard";
import Features from "@/pages/features";
import About from "@/pages/about";
import Argumentos from "@/pages/argumentos";
import Repertorio from "@/pages/repertorio";
import Simulador from "@/pages/simulador";
import Settings from "@/pages/settings";
import Goals from "@/pages/goals";
import Exams from "@/pages/exams";
import Functionalities from "@/pages/functionalities";
import Newsletter from "@/pages/newsletter";
import { EstruturaRoterizada } from "@/pages/estrutura-roterizada";
import ControladorEscrita from "@/pages/controlador-escrita";
import Simulacao from "@/pages/simulacao";
import { Resultado } from "@/pages/resultado";
import Biblioteca from "@/pages/biblioteca";
import MaterialComplementar from "@/pages/material-complementar";
import Propostas from "@/pages/propostas";
import MapaMental from "@/pages/mapa-mental";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminNewsletter from "@/pages/admin-newsletter";
import AdminMateriais from "@/pages/admin-materiais";
import AdminCoupons from "@/pages/admin-coupons";
import Checkout from "@/pages/checkout";
import SubscriptionPage from "@/pages/subscription";
import HelpCenter from "@/pages/HelpCenter";
import FAQ from "@/pages/FAQ";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Blog from "@/pages/Blog";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/features" component={Features} />
      <Route path="/about" component={About} />
      <Route path="/blog" component={Blog} />
      <Route path="/help-center" component={HelpCenter} />
      <Route path="/faq" component={FAQ} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      
      <Route path="/newsletter">
        <ProtectedRoute>
          <Newsletter />
        </ProtectedRoute>
      </Route>
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
      <Route path="/subscription">
        <ProtectedRoute>
          <SubscriptionPage />
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
      <Route path="/estrutura-roterizada">
        <ProtectedRoute>
          <EstruturaRoterizada />
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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <ScrollToTop />
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
