import { useState } from "react";
import { useLocation } from "wouter";
import { Navigation } from "@/components/navigation";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#2563eb] to-[#3b82f6]">
      <Navigation />
      <div className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4" data-testid="text-checkout-title">
            Finalize sua Assinatura
          </h1>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto">
            Escolha seu plano e complete o pagamento de forma segura
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-4 lg:space-y-5">
          {/* Main Grid: Plan Selection + Order Summary */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-5">
            {/* Left Column: Plan Selection + Coupon */}
            <div className="space-y-4 lg:space-y-5 contents lg:block">
              {/* Plan Selection Card */}
              <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 order-1" data-testid="card-plan-selection">
              <h2 className="text-2xl font-bold text-dark-blue mb-4 flex items-center gap-3">
                <Sparkles className="text-bright-blue" size={28} />
                Selecione seu Plano
              </h2>

              <div className="space-y-4">
                {/* Monthly Plan */}
                <button
                  onClick={() => handlePlanChange("monthly")}
                  className={`w-full text-left p-5 sm:p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    selectedPlan === "monthly"
                      ? "border-bright-blue bg-bright-blue/5 shadow-md"
                      : "border-gray-200 hover:border-bright-blue/50"
                  }`}
                  data-testid="button-select-monthly"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-1">Plano Mensal</h3>
                      <p className="text-soft-gray text-sm">Sem compromisso, cancele quando quiser</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-dark-blue">R$ 65,90</div>
                      <div className="text-soft-gray text-sm">/mês</div>
                    </div>
                  </div>
                </button>

                {/* Annual Plan */}
                <button
                  onClick={() => handlePlanChange("annual")}
                  className={`w-full text-left p-5 sm:p-6 rounded-xl border-2 transition-all duration-300 relative overflow-hidden hover:shadow-lg ${
                    selectedPlan === "annual"
                      ? "border-bright-blue bg-bright-blue/5 shadow-md"
                      : "border-gray-200 hover:border-bright-blue/50"
                  }`}
                  data-testid="button-select-annual"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 pr-20">
                      <h3 className="text-lg sm:text-xl font-bold text-dark-blue mb-1">Plano Anual</h3>
                      <p className="text-soft-gray text-sm">Melhor custo-benefício</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-dark-blue">R$ 49,92</div>
                      <div className="text-soft-gray text-sm">/mês</div>
                      <div className="text-soft-gray text-sm mt-1">R$ 599,00/ano</div>
                      <div className="text-green-600 text-xs font-bold mt-1">
                        Economize R$ 190,80
                      </div>
                    </div>
                  </div>
                </button>
              </div>
              </div>

              {/* Coupon Code Section */}
              <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 order-3" data-testid="card-coupon">
              <h2 className="text-2xl font-bold text-dark-blue mb-4 flex items-center gap-3">
                <Tag className="text-bright-blue" size={28} />
                Código de Desconto
              </h2>

              {!couponData ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="coupon" className="text-dark-blue font-medium mb-2 block">
                      Tem um cupom? Digite aqui:
                    </Label>
                    <div className="flex gap-2">
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
                        className="flex-1 border-gray-300 focus:border-bright-blue"
                        disabled={validatingCoupon || isProcessing}
                        data-testid="input-coupon-code"
                      />
                      <Button
                        onClick={handleValidateCoupon}
                        disabled={validatingCoupon || isProcessing || !couponCode.trim()}
                        className="bg-bright-blue hover:bg-blue-600 text-white px-6 font-semibold"
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
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200" data-testid="text-coupon-error">
                      <XCircle size={18} />
                      <span className="font-medium">{couponError}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-5" data-testid="card-coupon-applied">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <CheckCircle2 className="text-green-600 mt-1 flex-shrink-0" size={24} />
                      <div className="flex-1">
                        <p className="text-green-700 font-bold text-lg mb-1">
                          Cupom "{couponData.coupon.code}" aplicado!
                        </p>
                        <p className="text-green-600 text-sm mb-2">
                          {couponData.coupon.description}
                        </p>
                        <p className="text-green-700 text-base font-bold">
                          Desconto: {couponData.discountDisplay}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                      className="text-soft-gray hover:text-dark-blue hover:bg-gray-100"
                      disabled={isProcessing}
                      data-testid="button-remove-coupon"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Order Summary - Full Height */}
            <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 flex-1 flex flex-col order-2" data-testid="card-order-summary">
                <h2 className="text-2xl font-bold text-dark-blue mb-4 flex items-center gap-3">
                  <CreditCard className="text-bright-blue" size={28} />
                  Resumo do Pedido
                </h2>

                {/* Plan Details Section */}
                <div className="space-y-4 mb-5">
                  <div className="flex justify-between items-baseline pb-4 border-b border-gray-200">
                    <div>
                      <p className="text-sm text-soft-gray mb-1">Plano Selecionado</p>
                      <p className="text-lg sm:text-xl font-bold text-dark-blue" data-testid="text-plan-name">
                        {currentPlan.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-dark-blue" data-testid="text-plan-price">
                        {formatPrice(currentPlan.price)}
                      </div>
                      <div className="text-soft-gray text-sm">{currentPlan.period}</div>
                    </div>
                  </div>

                  {selectedPlan === "annual" && (
                    <div className="bg-bright-blue/5 rounded-lg p-4 border border-bright-blue/20">
                      <p className="text-bright-blue font-semibold text-sm">
                        💰 {formatPrice(Math.round(currentPlan.price / 12))}/mês • Economize R$ 190,80
                      </p>
                    </div>
                  )}
                </div>

                {/* Coupon Section */}
                {couponData && discountAmount > 0 && (
                  <div className="bg-green-50 rounded-lg p-4 mb-4 border-2 border-green-500">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-green-600" size={22} />
                        <div>
                          <p className="text-xs text-green-700 font-medium">Desconto Aplicado</p>
                          <p className="text-base font-bold text-green-800" data-testid="text-discount-label">
                            {couponData.coupon.code}
                          </p>
                        </div>
                      </div>
                      <span className="text-xl font-bold text-green-600" data-testid="text-discount-amount">
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Total Section */}
                <div className="bg-bright-blue/5 rounded-xl p-5 mb-5 border border-bright-blue/20">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-xl font-bold text-dark-blue">Total a Pagar</span>
                    <span className="text-4xl font-bold text-dark-blue" data-testid="text-total-price">
                      {formatPrice(finalPrice)}
                    </span>
                  </div>
                  {selectedPlan === "annual" && finalPrice > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-soft-gray">
                        ou <span className="font-semibold">{formatPrice(Math.round(finalPrice / 12))}/mês</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Payment Button and Security Info */}
                <div className="space-y-4 mt-auto">
                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-bright-blue to-purple-500 hover:from-bright-blue hover:to-purple-600 text-white py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                    data-testid="button-checkout"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-3">
                        <Loader2 className="animate-spin" size={22} />
                        Processando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <CreditCard size={22} />
                        Ir para o Pagamento
                      </span>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-soft-gray text-sm">
                    <Shield size={16} className="text-green-600" />
                    <span className="font-medium">Pagamento 100% seguro via Stripe</span>
                  </div>
                </div>
            </div>
          </div>

          {/* Benefits Section - Full Width */}
          <div className="bg-gradient-to-br from-bright-blue to-purple-500 rounded-2xl shadow-2xl p-5 sm:p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="text-white" size={24} />
              O que você vai receber:
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="text-white mt-0.5 flex-shrink-0" size={20} />
                <span className="text-sm sm:text-base">Acesso ilimitado a todas as funcionalidades</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="text-white mt-0.5 flex-shrink-0" size={20} />
                <span className="text-sm sm:text-base">IA avançada para correção e sugestões de redação</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="text-white mt-0.5 flex-shrink-0" size={20} />
                <span className="text-sm sm:text-base">Biblioteca completa de repertórios e estruturas</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="text-white mt-0.5 flex-shrink-0" size={20} />
                <span className="text-sm sm:text-base">Simulações ilimitadas de redações</span>
              </li>
              <li className="flex items-start gap-3 text-white">
                <CheckCircle2 className="text-white mt-0.5 flex-shrink-0" size={20} />
                <span className="text-sm sm:text-base">Suporte prioritário</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
