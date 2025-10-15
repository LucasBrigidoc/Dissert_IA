import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useAdminCheck() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem acessar esta página.",
        variant: "destructive",
      });
      setLocation('/');
    }
  }, [user, loading, setLocation, toast]);

  return { isAdmin: user?.isAdmin || false, loading };
}
