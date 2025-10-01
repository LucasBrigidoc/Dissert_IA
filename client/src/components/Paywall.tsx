import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Sparkles, 
  Zap, 
  Crown, 
  TrendingUp,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  title?: string;
  description?: string;
}

export function Paywall({ 
  isOpen, 
  onClose, 
  feature = "esta funcionalidade",
  title = "Upgrade Necessário",
  description
}: PaywallProps) {
  const { limits, plan } = useSubscription();

  const defaultDescription = limits?.hasActiveSubscription
    ? `Você atingiu o limite ${limits.periodLabel || 'de uso'} de IA (${limits.percentageUsed.toFixed(0)}% usado). Faça upgrade para continuar usando ${feature}.`
    : `Você precisa de uma assinatura ativa para usar ${feature}.`;

  const features = [
    { text: "Uso ilimitado de IA", included: true },
    { text: "Sem limite de operações", included: true },
    { text: "Acesso prioritário", included: true },
    { text: "Suporte dedicado", included: true },
    { text: "Recursos exclusivos", included: true },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-2xl text-center" data-testid="paywall-title">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-base" data-testid="paywall-description">
            {description || defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Current Plan Badge */}
          {limits?.hasActiveSubscription && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Plano Atual: {plan?.name || "Premium"}
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Limite {limits.periodLabel}: {limits.percentageUsed.toFixed(1)}% usado • {(100 - limits.percentageUsed).toFixed(1)}% restante
              </p>
            </div>
          )}

          {/* Features List */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              Com o plano Premium você terá:
            </p>
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                {feature.included ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
                )}
                <span className={`text-sm ${
                  feature.included 
                    ? "text-gray-700 dark:text-gray-300" 
                    : "text-gray-400 dark:text-gray-600 line-through"
                }`}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Economia</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">40%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">no plano anual</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Aprovação</span>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">95%+</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">dos usuários</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
            data-testid="button-close-paywall"
          >
            Talvez Depois
          </Button>
          <Link href="/pricing" className="w-full sm:w-auto">
            <Button 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              data-testid="button-upgrade-now"
            >
              <Crown className="h-4 w-4 mr-2" />
              {limits?.hasActiveSubscription ? "Fazer Upgrade" : "Ver Planos"}
            </Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function usePaywall() {
  const { limits } = useSubscription();

  const checkAccess = (onBlocked?: () => void): boolean => {
    if (!limits?.canUseAI) {
      onBlocked?.();
      return false;
    }
    return true;
  };

  return {
    canUseAI: limits?.canUseAI ?? true,
    hasActiveSubscription: limits?.hasActiveSubscription ?? false,
    checkAccess,
  };
}
