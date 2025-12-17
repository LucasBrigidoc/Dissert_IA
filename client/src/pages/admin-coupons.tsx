import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tag, Plus, Edit, Trash2, RefreshCw, TrendingUp, Users, DollarSign, Percent, CheckCircle2, XCircle, BarChart3, Mail, Book, FileText } from "lucide-react";
import { Link } from "wouter";
import { useAdminCheck } from "@/hooks/use-admin-check";

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  maxUses: number | null;
  currentUses: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  applicablePlans: string[] | null;
  createdAt: string;
}

interface CouponRedemption {
  id: string;
  couponId: string;
  userId: string | null;
  redeemedAt: string;
  discountAppliedCentavos: number;
  context: any;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (centavos: number) => {
  return `R$ ${(centavos / 100).toFixed(2).replace('.', ',')}`;
};

export default function AdminCoupons() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  if (adminLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: "",
    maxUses: "",
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: "",
    applicablePlans: "all" as "all" | "monthly" | "annual",
  });

  // Fetch coupons
  const { data: coupons, isLoading: couponsLoading, refetch: refetchCoupons } = useQuery<Coupon[]>({
    queryKey: ['/api/admin/coupons'],
  });

  // Fetch redemptions (for statistics)
  const { data: redemptions } = useQuery<CouponRedemption[]>({
    queryKey: ['/api/admin/coupons/redemptions'],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/admin/coupons', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Cupom criado!",
        description: "O cupom foi criado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar cupom",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Cupom atualizado!",
        description: "O cupom foi atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
      setEditingCoupon(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar cupom",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "✅ Cupom deletado!",
        description: "O cupom foi removido com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar cupom",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percent",
      discountValue: "",
      maxUses: "",
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: "",
      applicablePlans: "all",
    });
  };

  const handleSubmit = () => {
    // Client-side validation
    const discountValueNum = Number(formData.discountValue);
    const maxUsesNum = formData.maxUses ? Number(formData.maxUses) : null;

    // Validate required fields
    if (!formData.code.trim()) {
      toast({
        title: "Erro de validação",
        description: "Código do cupom é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Erro de validação",
        description: "Descrição é obrigatória",
        variant: "destructive",
      });
      return;
    }

    // Validate discount value
    if (isNaN(discountValueNum) || discountValueNum <= 0) {
      toast({
        title: "Erro de validação",
        description: "Valor do desconto deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }

    if (formData.discountType === "percent" && (discountValueNum < 1 || discountValueNum > 100)) {
      toast({
        title: "Erro de validação",
        description: "Desconto percentual deve estar entre 1 e 100",
        variant: "destructive",
      });
      return;
    }

    // Validate max uses
    if (maxUsesNum !== null) {
      if (isNaN(maxUsesNum) || maxUsesNum < 1) {
        toast({
          title: "Erro de validação",
          description: "Limite de usos deve ser maior ou igual a 1",
          variant: "destructive",
        });
        return;
      }
      if (!Number.isInteger(maxUsesNum)) {
        toast({
          title: "Erro de validação",
          description: "Limite de usos deve ser um número inteiro",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate dates
    const validFromDate = new Date(formData.validFrom);
    const validUntilDate = formData.validUntil ? new Date(formData.validUntil) : null;

    if (validUntilDate && validUntilDate <= validFromDate) {
      toast({
        title: "Erro de validação",
        description: "Data final deve ser posterior à data inicial",
        variant: "destructive",
      });
      return;
    }

    const payload: any = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discountType: formData.discountType,
      discountValue: discountValueNum,
      maxUses: maxUsesNum,
      validFrom: validFromDate.toISOString(),
      validUntil: validUntilDate ? validUntilDate.toISOString() : null,
      applicablePlans: formData.applicablePlans === "all" ? null : [formData.applicablePlans],
    };

    // Only set isActive on create, preserve it on update
    if (editingCoupon) {
      // Don't change isActive on edit, preserve current state
      updateMutation.mutate({ id: editingCoupon.id, data: payload });
    } else {
      // Set isActive to true only on create
      payload.isActive = true;
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      maxUses: coupon.maxUses?.toString() || "",
      validFrom: coupon.validFrom.split('T')[0],
      validUntil: coupon.validUntil ? coupon.validUntil.split('T')[0] : "",
      applicablePlans: coupon.applicablePlans?.length === 1 ? coupon.applicablePlans[0] as any : "all",
    });
    setIsCreateDialogOpen(true);
  };

  const handleToggleActive = (coupon: Coupon) => {
    updateMutation.mutate({
      id: coupon.id,
      data: { isActive: !coupon.isActive },
    });
  };

  // Calculate statistics
  const stats = {
    totalCoupons: coupons?.length || 0,
    activeCoupons: coupons?.filter(c => c.isActive).length || 0,
    totalRedemptions: redemptions?.length || 0,
    totalDiscountGiven: redemptions?.reduce((sum, r) => sum + r.discountAppliedCentavos, 0) || 0,
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" data-testid="text-page-title">
              <Tag className="text-bright-blue" size={32} />
              Gerenciamento de Cupons
            </h1>
            <p className="text-muted-foreground">
              Crie e gerencie cupons de desconto para suas assinaturas
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              refetchCoupons();
              queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons/redemptions'] });
            }}
            data-testid="button-refresh"
          >
            <RefreshCw size={16} className="mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin">
            <Button variant="outline" className="gap-2" data-testid="button-admin-dashboard">
              <BarChart3 size={16} />
              Admin Principal
            </Button>
          </Link>
          <Link href="/admin/newsletter">
            <Button variant="outline" className="gap-2" data-testid="button-admin-newsletter">
              <Mail size={16} />
              Admin Newsletter
            </Button>
          </Link>
          <Link href="/admin/materiais">
            <Button variant="outline" className="gap-2" data-testid="button-admin-materiais">
              <Book size={16} />
              Admin Materiais
            </Button>
          </Link>
          <Button variant="default" className="gap-2" data-testid="button-admin-coupons">
            <Tag size={16} />
            Admin Cupons
          </Button>
          <Link href="/admin/blog">
            <Button variant="outline" className="gap-2" data-testid="button-admin-blog">
              <FileText size={16} />
              Admin Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card data-testid="card-total-coupons">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Cupons</p>
                <p className="text-2xl font-bold" data-testid="text-total-coupons">{stats.totalCoupons}</p>
              </div>
              <Tag className="text-bright-blue" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-coupons">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cupons Ativos</p>
                <p className="text-2xl font-bold" data-testid="text-active-coupons">{stats.activeCoupons}</p>
              </div>
              <CheckCircle2 className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-redemptions">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Usos</p>
                <p className="text-2xl font-bold" data-testid="text-total-redemptions">{stats.totalRedemptions}</p>
              </div>
              <Users className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-discount">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Desconto Concedido</p>
                <p className="text-2xl font-bold" data-testid="text-total-discount">
                  {formatCurrency(stats.totalDiscountGiven)}
                </p>
              </div>
              <DollarSign className="text-orange-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Lista de Cupons</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setEditingCoupon(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="bg-bright-blue hover:bg-blue-600 text-white" data-testid="button-create-coupon">
                  <Plus size={16} className="mr-2" />
                  Criar Cupom
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-testid="dialog-create-edit">
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {editingCoupon ? "Editar Cupom" : "Criar Novo Cupom"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCoupon ? "Atualize as informações do cupom" : "Preencha os dados para criar um novo cupom de desconto"}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Código do Cupom</Label>
                      <Input
                        id="code"
                        placeholder="Ex: LANCAMENTO30"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="mt-1"
                        data-testid="input-code"
                      />
                    </div>

                    <div>
                      <Label htmlFor="discountType">Tipo de Desconto</Label>
                      <Select
                        value={formData.discountType}
                        onValueChange={(value: "percent" | "fixed") => setFormData({ ...formData, discountType: value })}
                      >
                        <SelectTrigger className="mt-1" data-testid="select-discount-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">Percentual (%)</SelectItem>
                          <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      placeholder="Ex: Desconto de lançamento de 30%"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1"
                      data-testid="input-description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discountValue">
                        Valor do Desconto {formData.discountType === "percent" ? "(%)" : "(centavos)"}
                      </Label>
                      <Input
                        id="discountValue"
                        type="number"
                        min={formData.discountType === "percent" ? "1" : "1"}
                        max={formData.discountType === "percent" ? "100" : undefined}
                        placeholder={formData.discountType === "percent" ? "30" : "1990"}
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        className="mt-1"
                        data-testid="input-discount-value"
                      />
                      {formData.discountType === "fixed" && (
                        <p className="text-xs text-muted-foreground mt-1">Em centavos (ex: 1990 = R$ 19,90)</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="maxUses">Limite de Usos</Label>
                      <Input
                        id="maxUses"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Ilimitado"
                        value={formData.maxUses}
                        onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                        className="mt-1"
                        data-testid="input-max-uses"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="applicablePlans">Planos Aplicáveis</Label>
                      <Select
                        value={formData.applicablePlans}
                        onValueChange={(value: any) => setFormData({ ...formData, applicablePlans: value })}
                      >
                        <SelectTrigger className="mt-1" data-testid="select-applicable-plans">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os planos</SelectItem>
                          <SelectItem value="monthly">Apenas Mensal</SelectItem>
                          <SelectItem value="annual">Apenas Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="validFrom">Válido de</Label>
                      <Input
                        id="validFrom"
                        type="date"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                        className="mt-1"
                        data-testid="input-valid-from"
                      />
                    </div>

                    <div>
                      <Label htmlFor="validUntil">Válido até</Label>
                      <Input
                        id="validUntil"
                        type="date"
                        min={formData.validFrom}
                        value={formData.validUntil}
                        onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                        className="mt-1"
                        placeholder="Opcional"
                        data-testid="input-valid-until"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setEditingCoupon(null);
                      resetForm();
                    }}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit"
                  >
                    {editingCoupon ? "Atualizar" : "Criar"} Cupom
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {couponsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando cupons...</div>
            ) : !coupons || coupons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum cupom criado ainda. Clique em "Criar Cupom" para começar.
              </div>
            ) : (
              <div className="space-y-3" data-testid="list-coupons">
                {coupons.map((coupon) => (
                  <Card
                    key={coupon.id}
                    className="p-4 border-2"
                    data-testid={`card-coupon-${coupon.code}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <Tag size={18} className="text-bright-blue" />
                            {coupon.code}
                          </h3>
                          <Badge variant={coupon.isActive ? "default" : "secondary"}>
                            {coupon.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                          <Badge variant="outline">
                            {coupon.discountType === "percent" ? (
                              <span className="flex items-center gap-1">
                                <Percent size={12} />
                                {coupon.discountValue}%
                              </span>
                            ) : (
                              formatCurrency(coupon.discountValue)
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{coupon.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Usos: {coupon.currentUses}/{coupon.maxUses || "∞"}</span>
                          <span>Válido: {formatDate(coupon.validFrom)}</span>
                          {coupon.validUntil && <span>até {formatDate(coupon.validUntil)}</span>}
                          {coupon.applicablePlans && (
                            <span>Planos: {coupon.applicablePlans.join(", ")}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(coupon)}
                          data-testid={`button-toggle-${coupon.code}`}
                        >
                          {coupon.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                          data-testid={`button-edit-${coupon.code}`}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Tem certeza que deseja deletar o cupom ${coupon.code}?`)) {
                              deleteMutation.mutate(coupon.id);
                            }
                          }}
                          data-testid={`button-delete-${coupon.code}`}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
