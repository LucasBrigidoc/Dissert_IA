import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Crown } from "lucide-react";

interface SubscriptionPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionPromptDialog({ open, onOpenChange }: SubscriptionPromptDialogProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    onOpenChange(false);
    setLocation("/subscription");
  };

  const handleContinueFree = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden" data-testid="dialog-subscription-prompt">
        {/* Header com gradiente */}
        <div className="gradient-bg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8" />
            <DialogTitle className="text-2xl font-bold text-white m-0">
              Desbloqueie todo o potencial!
            </DialogTitle>
          </div>
          <DialogDescription className="text-white/90 text-base mt-2">
            Você está no plano gratuito. Faça upgrade para Pro e tenha acesso ilimitado a todas as funcionalidades!
          </DialogDescription>
        </div>

        {/* Benefícios */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-bright-blue mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-dark-blue">Redações ilimitadas com IA</h4>
                <p className="text-sm text-soft-gray">Gere e corrija quantas redações quiser, sem limites</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-bright-blue mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-dark-blue">Chat com IA sem restrições</h4>
                <p className="text-sm text-soft-gray">Tire todas suas dúvidas com assistência ilimitada</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-bright-blue mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-dark-blue">Arquiteto Socrático Premium</h4>
                <p className="text-sm text-soft-gray">Desenvolva argumentos poderosos sem limites</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-bright-blue mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-dark-blue">Explorador de Repertório</h4>
                <p className="text-sm text-soft-gray">Acesso completo a milhares de referências culturais</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer com botões */}
        <DialogFooter className="p-6 pt-0 flex-col sm:flex-col gap-3">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-bright-blue hover:bg-blue-600 text-white font-semibold py-6 text-lg"
            data-testid="button-upgrade-pro"
          >
            <Crown className="w-5 h-5 mr-2" />
            Assinar Plano Pro
          </Button>
          <Button
            onClick={handleContinueFree}
            variant="outline"
            className="w-full border-2 border-soft-gray text-soft-gray hover:bg-gray-50 py-6 text-lg"
            data-testid="button-continue-free"
          >
            Continuar no Gratuito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
