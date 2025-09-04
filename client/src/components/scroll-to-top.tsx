import { useLocation } from "wouter";
import { useEffect } from "react";

export function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll para o topo sempre que a localização mudar
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location]);

  // Este componente não renderiza nada visível
  return null;
}