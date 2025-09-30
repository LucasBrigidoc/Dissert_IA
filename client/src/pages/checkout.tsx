import { useState } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Tag, CheckCircle2, XCircle, Sparkles, CreditCard, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const PLANS = {
  monthly: {
    id: "monthly",
    name: "Plano Pro Mensal",
    price: 6590,
    displayPrice: "R$ 65,90",
    period: "/mês"
  },
  annual: {
    id: "annual",
    name: "Plano Pro Anual",
    price: 59900,
    displayPrice: "R$ 599,00",
    period: "/ano",
    savings: "2 meses grátis!"
  }
};

export default function Checkout() {
  const { toast } = useToast();
  
  // Read plan from query params
  const searchParams = new URLSearchParams(window.location.search);
  const planFromUrl = searchParams.get('plan') as "monthly" | "annual" | null;
  
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">(
    planFromUrl === "annual" ? "annual" : "monthly"
  );
  const [couponCode, setCouponCode] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponData, setCouponData] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlan = PLANS[selectedPlan];

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Digite um código de cupom");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");
    setCouponData(null);

    // Capture plan at validation start to detect race conditions
    const planAtValidate = selectedPlan;

    try {
      const response = await apiRequest(`/api/coupons/validate`, {
        method: "POST",
        body: JSON.stringify({ 
          code: couponCode.trim().toUpperCase(),
          planId: planAtValidate 
        }),
      });

      // Only apply coupon if plan hasn't changed during validation
      if (selectedPlan !== planAtValidate) {
        setCouponError("Plano alterado durante validação. Por favor, valide novamente.");
        setCouponData(null);
        setValidatingCoupon(false);
        return;
      }

      if (response.valid) {
        setCouponData(response);
        toast({
          title: "✅ Cupom válido!",
          description: `Desconto de ${response.discountDisplay} aplicado`,
        });
      } else {
        setCouponError(response.error || "Cupom inválido");
        setCouponData(null);
      }
    } catch (error: any) {
      setCouponError(error.message || "Erro ao validar cupom");
      setCouponData(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponData(null);
    setCouponError("");
  };

  const handlePlanChange = (newPlan: "monthly" | "annual") => {
    setSelectedPlan(newPlan);
    // Clear coupon when changing plans - user must revalidate for new plan
    if (couponData) {
      handleRemoveCoupon();
      toast({
        title: "Cupom removido",
        description: "Por favor, valide o cupom novamente para o novo plano",
      });
    }
  };

  const calculateFinalPrice = () => {
    if (!couponData) return currentPlan.price;
    
    let discount: number;
    if (couponData.coupon.discountType === "percent") {
      discount = Math.round((currentPlan.price * couponData.coupon.discountValue) / 100);
    } else {
      discount = couponData.coupon.discountValue;
    }
    
    // Ensure final price is never negative
    return Math.max(0, currentPlan.price - discount);
  };

  const formatPrice = (centavos: number) => {
    return `R$ ${(centavos / 100).toFixed(2).replace(".", ",")}`;
  };

  const handleCheckout = async () => {
    setIsProcessing(true);

    try {
      const response = await apiRequest(`/api/checkout/create-session`, {
        method: "POST",
        body: JSON.stringify({
          planId: selectedPlan,
          couponCode: couponData?.coupon.code || undefined,
        }),
      });

      if (response.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.url;
      } else {
        throw new Error("Erro ao criar sessão de checkout");
      }
    } catch (error: any) {
      toast({
        title: "Erro no checkout",
        description: error.message || "Não foi possível processar o pagamento",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const finalPrice = calculateFinalPrice();
  const discountAmount = currentPlan.price - finalPrice;

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      <div className="container mx-auto px-3 sm:px-6 pt-16 sm:pt-20 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3" data-testid="text-checkout-title">
            Finalize sua Assinatura
          </h1>
          <p className="text-white/70 text-sm sm:text-base">
            Escolha seu plano e complete o pagamento de forma segura
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column: Plan Selection */}
          <div className="space-y-6">
            <LiquidGlassCard className="p-6" data-testid="card-plan-selection">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="text-bright-blue" size={24} />
                Selecione seu Plano
              </h2>

              <div className="space-y-4">
                {/* Monthly Plan */}
                <button
                  onClick={() => handlePlanChange("monthly")}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedPlan === "monthly"
                      ? "border-bright-blue bg-bright-blue/10"
                      : "border-white/20 hover:border-white/40"
                  }`}
                  data-testid="button-select-monthly"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Plano Mensal</h3>
                      <p className="text-white/60 text-sm">Sem compromisso, cancele quando quiser</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">R$ 65,90</div>
                      <div className="text-white/60 text-sm">/mês</div>
                    </div>
                  </div>
                </button>

                {/* Annual Plan */}
                <button
                  onClick={() => handlePlanChange("annual")}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                    selectedPlan === "annual"
                      ? "border-bright-blue bg-bright-blue/10"
                      : "border-white/20 hover:border-white/40"
                  }`}
                  data-testid="button-select-annual"
                >
                  <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-bright-blue text-white">
                    2 meses grátis!
                  </Badge>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Plano Anual</h3>
                      <p className="text-white/60 text-sm">Melhor custo-benefício</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">R$ 599,00</div>
                      <div className="text-white/60 text-sm">/ano</div>
                      <div className="text-green-400 text-xs font-semibold mt-1">
                        Economize R$ 190,80
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </LiquidGlassCard>

            {/* Coupon Code Section */}
            <LiquidGlassCard className="p-6" data-testid="card-coupon">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Tag className="text-bright-blue" size={24} />
                Código de Desconto
              </h2>

              {!couponData ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="coupon" className="text-white/90 text-sm">
                      Tem um cupom? Digite aqui:
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="coupon"
                        type="text"
                        placeholder="Ex: LANCAMENTO30"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleValidateCoupon();
                          }
                        }}
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        disabled={validatingCoupon || isProcessing}
                        data-testid="input-coupon-code"
                      />
                      <Button
                        onClick={handleValidateCoupon}
                        disabled={validatingCoupon || isProcessing || !couponCode.trim()}
                        className="bg-bright-blue hover:bg-blue-600 text-white px-6"
                        data-testid="button-validate-coupon"
                      >
                        {validatingCoupon ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : (
                          "Aplicar"
                        )}
                      </Button>
                    </div>
                  </div>

                  {couponError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg" data-testid="text-coupon-error">
                      <XCircle size={16} />
                      {couponError}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4" data-testid="card-coupon-applied">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-400 mt-1" size={20} />
                      <div>
                        <p className="text-green-400 font-bold text-lg">
                          Cupom "{couponData.coupon.code}" aplicado!
                        </p>
                        <p className="text-white/70 text-sm mt-1">
                          {couponData.coupon.description}
                        </p>
                        <p className="text-green-400 text-sm font-semibold mt-2">
                          Desconto: {couponData.discountDisplay}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-white/60 hover:text-white hover:bg-white/10"
                      disabled={isProcessing}
                      data-testid="button-remove-coupon"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </LiquidGlassCard>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <LiquidGlassCard className="p-6" data-testid="card-order-summary">
              <h2 className="text-xl font-bold text-white mb-6">Resumo do Pedido</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-white/90">
                  <span data-testid="text-plan-name">{currentPlan.name}</span>
                  <span data-testid="text-plan-price">{formatPrice(currentPlan.price)}</span>
                </div>

                {couponData && discountAmount > 0 && (
                  <div className="flex justify-between text-green-400 font-semibold">
                    <span data-testid="text-discount-label">Desconto ({couponData.coupon.code})</span>
                    <span data-testid="text-discount-amount">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-white">Total</span>
                    <span className="text-3xl font-bold text-bright-blue" data-testid="text-total-price">
                      {formatPrice(finalPrice)}
                    </span>
                  </div>
                  {selectedPlan === "annual" && finalPrice > 0 && (
                    <p className="text-white/60 text-sm text-right mt-1">
                      ou {formatPrice(Math.round(finalPrice / 12))}/mês
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-bright-blue to-purple-500 hover:from-bright-blue hover:to-purple-600 text-white py-6 text-lg font-bold shadow-xl"
                data-testid="button-checkout"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Processando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Ir para o Pagamento
                  </span>
                )}
              </Button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Shield size={16} />
                  <span>Pagamento 100% seguro via Stripe</span>
                </div>
                <p className="text-white/50 text-xs">
                  Ao clicar em "Ir para o Pagamento", você será redirecionado para o checkout seguro do Stripe.
                  Seus dados de pagamento são protegidos e nunca são armazenados em nossos servidores.
                </p>
              </div>
            </LiquidGlassCard>

            {/* Benefits Reminder */}
            <LiquidGlassCard className="p-6 bg-gradient-to-br from-bright-blue/10 to-purple-500/10 border border-bright-blue/30">
              <h3 className="text-lg font-bold text-white mb-3">✨ O que você vai receber:</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-bright-blue mt-0.5" size={16} />
                  <span>Acesso ilimitado a todas as funcionalidades</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-bright-blue mt-0.5" size={16} />
                  <span>IA avançada para correção e sugestões de redação</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-bright-blue mt-0.5" size={16} />
                  <span>Biblioteca completa de repertórios e estruturas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-bright-blue mt-0.5" size={16} />
                  <span>Simulações ilimitadas de redações</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="text-bright-blue mt-0.5" size={16} />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
            </LiquidGlassCard>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
