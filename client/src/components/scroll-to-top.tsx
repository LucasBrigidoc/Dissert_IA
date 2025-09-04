import { useLocation } from "wouter";
import { useEffect } from "react";

export function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll instantâneo para o topo - sem animação visível
    window.scrollTo(0, 0);
  }, [location]);

  // Este componente não renderiza nada visível
  return null;
}