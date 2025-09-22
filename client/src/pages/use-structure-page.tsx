import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { UseStructure } from "@/pages/use-structure";
import type { EssayStructure } from "@shared/schema";

export default function UseStructurePage() {
  const [, setLocation] = useLocation();
  
  // Get URL params to preserve context
  const urlParams = new URLSearchParams(window.location.search);
  const fromPage = urlParams.get('from') || 'dashboard';
  
  // Mock userId - in a real app this would come from auth context
  const userId = "mock-user-id";

  const { data: structures = [], isLoading } = useQuery<EssayStructure[]>({
    queryKey: ['/api/users', userId, 'structures'],
  });

  const handleBack = () => {
    // Always go back to the estilo page
    setLocation('/estilo');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-soft-gray">Carregando estruturas...</div>
      </div>
    );
  }

  return (
    <UseStructure 
      structures={structures} 
      onBack={handleBack}
    />
  );
}