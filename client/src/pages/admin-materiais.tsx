import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Target, 
  BookOpen, 
  Lightbulb, 
  PenTool, 
  Eye,
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  Clock,
  Loader2,
  Book,
  Download,
  TrendingUp,
  BarChart3,
  Mail,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { MaterialComplementar } from "@shared/schema";

const iconMap = {
  FileText: FileText,
  Target: Target,
  BookOpen: BookOpen,
  Lightbulb: Lightbulb,
  PenTool: PenTool,
  Eye: Eye,
};

const colorSchemeMap = {
  green: "from-green-500 to-green-600",
  blue: "from-blue-500 to-blue-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
  indigo: "from-indigo-500 to-indigo-600",
  amber: "from-amber-500 to-amber-600",
};

export default function AdminMateriais() {
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialComplementar | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "Fundamental", // Agora permite categorias personalizadas
    isCustomCategory: false, // Controla se está usando categoria personalizada
    customCategory: "", // Campo para nova categoria
    readTime: "",
    hideReadTime: false, // Controla se oculta o tempo de leitura
    pdfUrl: "", // URL do PDF para download
    icon: "FileText" as "FileText" | "Target" | "BookOpen" | "Lightbulb" | "PenTool" | "Eye",
    colorScheme: "green" as "green" | "blue" | "purple" | "orange" | "indigo" | "amber",
    isPublished: true,
    sortOrder: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch materiais complementares
  const { data: materials = [], isLoading: loadingMaterials } = useQuery<MaterialComplementar[]>({
    queryKey: ["/api/admin/materiais-complementares"],
  });

  // Create material mutation
  const createMaterial = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/materiais-complementares", {
      method: "POST",
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/materiais-complementares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/materiais-complementares"] });
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: "Material criado!",
        description: "O material foi criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar material",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    },
  });

  // Update material mutation
  const updateMaterial = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest(`/api/admin/materiais-complementares/${id}`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/materiais-complementares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/materiais-complementares"] });
      setShowEditDialog(false);
      resetForm();
      toast({
        title: "Material atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar material",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    },
  });

  // Delete material mutation
  const deleteMaterial = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/admin/materiais-complementares/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/materiais-complementares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/materiais-complementares"] });
      toast({
        title: "Material removido",
        description: "O material foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao remover material",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      category: "Fundamental",
      isCustomCategory: false,
      customCategory: "",
      readTime: "",
      hideReadTime: false,
      pdfUrl: "",
      icon: "FileText",
      colorScheme: "green",
      isPublished: true,
      sortOrder: 0,
    });
    setSelectedMaterial(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Preparar dados para envio
    const submitData = {
      ...formData,
      category: formData.isCustomCategory ? formData.customCategory : formData.category,
      readTime: formData.hideReadTime ? undefined : formData.readTime || undefined,
      pdfUrl: formData.pdfUrl || undefined,
    };
    
    // Remover campos de controle do UI
    delete (submitData as any).isCustomCategory;
    delete (submitData as any).customCategory;
    delete (submitData as any).hideReadTime;
    
    createMaterial.mutate(submitData);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMaterial) {
      // Preparar dados para envio
      const submitData = {
        ...formData,
        category: formData.isCustomCategory ? formData.customCategory : formData.category,
        readTime: formData.hideReadTime ? undefined : formData.readTime || undefined,
        pdfUrl: formData.pdfUrl || undefined,
      };
      
      // Remover campos de controle do UI
      delete (submitData as any).isCustomCategory;
      delete (submitData as any).customCategory;
      delete (submitData as any).hideReadTime;
      
      updateMaterial.mutate({
        id: selectedMaterial.id,
        data: submitData,
      });
    }
  };

  const handleEditClick = (material: MaterialComplementar) => {
    setSelectedMaterial(material);
    
    // Verificar se é categoria predefinida ou personalizada
    const predefinedCategories = ["Fundamental", "Técnico", "Avançado", "ENEM", "Gramática", "Exemplos"];
    const isCustomCategory = !predefinedCategories.includes(material.category);
    
    setFormData({
      title: material.title,
      description: material.description,
      content: material.content,
      category: isCustomCategory ? "Fundamental" : material.category,
      isCustomCategory: isCustomCategory,
      customCategory: isCustomCategory ? material.category : "",
      readTime: material.readTime || "",
      hideReadTime: !material.readTime, // Se não tem readTime, está oculto
      pdfUrl: material.pdfUrl || "",
      icon: material.icon as any,
      colorScheme: material.colorScheme as any,
      isPublished: material.isPublished || false,
      sortOrder: material.sortOrder || 0,
    });
    setShowEditDialog(true);
  };

  const getStatusBadge = (isPublished: boolean | null) => {
    return isPublished ? (
      <Badge variant="default" className="gap-1">
        <CheckCircle size={12} />
        Publicado
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1">
        <Clock size={12} />
        Rascunho
      </Badge>
    );
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || FileText;
    return <IconComponent size={18} className="text-white" />;
  };

  if (loadingMaterials) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-bright-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Gerenciamento de Materiais Complementares</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Crie, gerencie e publique materiais complementares para seus usuários
        </p>
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
          <Button variant="default" className="gap-2" data-testid="button-admin-materiais">
            <Settings size={16} />
            Admin Materiais
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Materiais</p>
                <p className="text-2xl font-bold">{materials?.length || 0}</p>
              </div>
              <Book className="text-bright-blue" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Materiais Publicados</p>
                <p className="text-2xl font-bold">
                  {materials?.filter((m: MaterialComplementar) => m.isPublished).length || 0}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold">
                  {materials?.filter((m: MaterialComplementar) => !m.isPublished).length || 0}
                </p>
              </div>
              <Clock className="text-amber-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Visualizações</p>
                <p className="text-2xl font-bold">
                  {materials?.reduce((total: number, m: MaterialComplementar) => total + (m.views || 0), 0) || 0}
                </p>
              </div>
              <Eye className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Downloads de PDF</p>
                <p className="text-2xl font-bold">
                  {materials?.reduce((total: number, m: MaterialComplementar) => total + (m.pdfDownloads || 0), 0) || 0}
                </p>
              </div>
              <Download className="text-orange-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg md:text-xl font-semibold">Todos os Materiais</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto" data-testid="button-create-material">
              <Plus size={16} />
              Novo Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Material</DialogTitle>
              <DialogDescription>
                Crie um novo material complementar para seus usuários
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Guia de Estrutura Dissertativa"
                    required
                    data-testid="input-material-title"
                  />
                </div>
                <div>
                  <Label htmlFor="readTime">Tempo de Leitura</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hideReadTime"
                        checked={formData.hideReadTime}
                        onChange={(e) => setFormData({ ...formData, hideReadTime: e.target.checked })}
                        data-testid="checkbox-hide-read-time"
                      />
                      <Label htmlFor="hideReadTime">Não mostrar tempo de leitura</Label>
                    </div>
                    {!formData.hideReadTime && (
                      <Input
                        id="readTime"
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                        placeholder="Ex: 12 min"
                        data-testid="input-material-readtime"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  {!formData.isCustomCategory ? (
                    <div className="space-y-2">
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger data-testid="select-material-category">
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fundamental">Fundamental</SelectItem>
                          <SelectItem value="Técnico">Técnico</SelectItem>
                          <SelectItem value="Avançado">Avançado</SelectItem>
                          <SelectItem value="ENEM">ENEM</SelectItem>
                          <SelectItem value="Gramática">Gramática</SelectItem>
                          <SelectItem value="Exemplos">Exemplos</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setFormData({ ...formData, isCustomCategory: true })}
                        data-testid="button-create-custom-category"
                      >
                        + Criar Nova Categoria
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        value={formData.customCategory}
                        onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                        placeholder="Digite o nome da nova categoria"
                        data-testid="input-custom-category"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setFormData({ ...formData, isCustomCategory: false, customCategory: "" })}
                        data-testid="button-cancel-custom-category"
                      >
                        Usar Categorias Padrão
                      </Button>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="icon">Ícone</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value as any })}>
                    <SelectTrigger data-testid="select-material-icon">
                      <SelectValue placeholder="Selecione o ícone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FileText">Arquivo</SelectItem>
                      <SelectItem value="Target">Alvo</SelectItem>
                      <SelectItem value="BookOpen">Livro</SelectItem>
                      <SelectItem value="Lightbulb">Lâmpada</SelectItem>
                      <SelectItem value="PenTool">Caneta</SelectItem>
                      <SelectItem value="Eye">Olho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="colorScheme">Cor</Label>
                  <Select value={formData.colorScheme} onValueChange={(value) => setFormData({ ...formData, colorScheme: value as any })}>
                    <SelectTrigger data-testid="select-material-color">
                      <SelectValue placeholder="Selecione a cor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="purple">Roxo</SelectItem>
                      <SelectItem value="orange">Laranja</SelectItem>
                      <SelectItem value="indigo">Índigo</SelectItem>
                      <SelectItem value="amber">Âmbar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descrição do material..."
                  className="min-h-[80px]"
                  required
                  data-testid="textarea-material-description"
                />
              </div>

              <div>
                <Label htmlFor="content">Conteúdo do Material</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Escreva o conteúdo completo do material aqui..."
                  className="min-h-[200px]"
                  required
                  data-testid="textarea-material-content"
                />
              </div>

              <div>
                <Label htmlFor="pdfUrl">PDF para Download (Opcional)</Label>
                <Input
                  id="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  placeholder="Cole aqui a URL do PDF para download"
                  type="url"
                  data-testid="input-material-pdf"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Se fornecido, um botão de download aparecerá no material
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    data-testid="checkbox-material-published"
                  />
                  <Label htmlFor="isPublished">Material publicado</Label>
                </div>
                <div>
                  <Label htmlFor="sortOrder">Ordem</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-20"
                    data-testid="input-material-order"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMaterial.isPending}
                  data-testid="button-save-material"
                >
                  {createMaterial.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
                  Criar Material
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {materials?.map((material: MaterialComplementar) => (
          <Card key={material.id} data-testid={`material-card-${material.id}`}>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                {/* Header with icon, title and badges */}
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${colorSchemeMap[material.colorScheme as keyof typeof colorSchemeMap] || colorSchemeMap.green} rounded-full flex items-center justify-center flex-shrink-0`}>
                    {getIconComponent(material.icon)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h3 className="text-lg font-semibold truncate">{material.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(material.isPublished)}
                        <Badge className={`text-xs bg-${material.colorScheme}-100 text-${material.colorScheme}-800`}>
                          {material.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{material.description}</p>
                  </div>
                </div>
                
                {/* Analytics and details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm text-muted-foreground">
                  <span className="truncate">Criado: {new Date(material.createdAt!).toLocaleDateString('pt-BR')}</span>
                  <span className="truncate">Tempo: {material.readTime || 'N/A'}</span>
                  <span className="truncate">Ordem: {material.sortOrder}</span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {material.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download size={14} />
                    {material.pdfDownloads || 0}
                  </span>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(material)}
                    data-testid={`button-edit-${material.id}`}
                    className="flex items-center gap-2"
                  >
                    <Edit size={16} />
                    <span className="hidden sm:inline">Editar</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMaterial.mutate(material.id)}
                    disabled={deleteMaterial.isPending}
                    data-testid={`button-delete-${material.id}`}
                    className="flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Excluir</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {materials?.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Book className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-lg font-semibold mb-2">Nenhum material criado</h3>
              <p className="text-muted-foreground mb-4">
                Comece criando seu primeiro material complementar
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus size={16} className="mr-2" />
                Criar Material
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Material</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias no material
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Guia de Estrutura Dissertativa"
                  required
                  data-testid="input-edit-material-title"
                />
              </div>
              <div>
                <Label htmlFor="edit-readTime">Tempo de Leitura</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-hideReadTime"
                      checked={formData.hideReadTime}
                      onChange={(e) => setFormData({ ...formData, hideReadTime: e.target.checked })}
                      data-testid="checkbox-edit-hide-read-time"
                    />
                    <Label htmlFor="edit-hideReadTime">Não mostrar tempo de leitura</Label>
                  </div>
                  {!formData.hideReadTime && (
                    <Input
                      id="edit-readTime"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                      placeholder="Ex: 12 min"
                      data-testid="input-edit-material-readtime"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                {!formData.isCustomCategory ? (
                  <div className="space-y-2">
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger data-testid="select-edit-material-category">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fundamental">Fundamental</SelectItem>
                        <SelectItem value="Técnico">Técnico</SelectItem>
                        <SelectItem value="Avançado">Avançado</SelectItem>
                        <SelectItem value="ENEM">ENEM</SelectItem>
                        <SelectItem value="Gramática">Gramática</SelectItem>
                        <SelectItem value="Exemplos">Exemplos</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setFormData({ ...formData, isCustomCategory: true })}
                      data-testid="button-edit-create-custom-category"
                    >
                      + Criar Nova Categoria
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      value={formData.customCategory}
                      onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                      placeholder="Digite o nome da nova categoria"
                      data-testid="input-edit-custom-category"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setFormData({ ...formData, isCustomCategory: false, customCategory: "" })}
                      data-testid="button-edit-cancel-custom-category"
                    >
                      Usar Categorias Padrão
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="edit-icon">Ícone</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value as any })}>
                  <SelectTrigger data-testid="select-edit-material-icon">
                    <SelectValue placeholder="Selecione o ícone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FileText">Arquivo</SelectItem>
                    <SelectItem value="Target">Alvo</SelectItem>
                    <SelectItem value="BookOpen">Livro</SelectItem>
                    <SelectItem value="Lightbulb">Lâmpada</SelectItem>
                    <SelectItem value="PenTool">Caneta</SelectItem>
                    <SelectItem value="Eye">Olho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-colorScheme">Cor</Label>
                <Select value={formData.colorScheme} onValueChange={(value) => setFormData({ ...formData, colorScheme: value as any })}>
                  <SelectTrigger data-testid="select-edit-material-color">
                    <SelectValue placeholder="Selecione a cor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                    <SelectItem value="orange">Laranja</SelectItem>
                    <SelectItem value="indigo">Índigo</SelectItem>
                    <SelectItem value="amber">Âmbar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descrição do material..."
                className="min-h-[80px]"
                required
                data-testid="textarea-edit-material-description"
              />
            </div>

            <div>
              <Label htmlFor="edit-content">Conteúdo do Material</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Escreva o conteúdo completo do material aqui..."
                className="min-h-[200px]"
                required
                data-testid="textarea-edit-material-content"
              />
            </div>

            <div>
              <Label htmlFor="edit-pdfUrl">PDF para Download (Opcional)</Label>
              <Input
                id="edit-pdfUrl"
                value={formData.pdfUrl}
                onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                placeholder="Cole aqui a URL do PDF para download"
                type="url"
                data-testid="input-edit-material-pdf"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Se fornecido, um botão de download aparecerá no material
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  data-testid="checkbox-edit-material-published"
                />
                <Label htmlFor="edit-isPublished">Material publicado</Label>
              </div>
              <div>
                <Label htmlFor="edit-sortOrder">Ordem</Label>
                <Input
                  id="edit-sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-20"
                  data-testid="input-edit-material-order"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={updateMaterial.isPending}
                data-testid="button-update-material"
              >
                {updateMaterial.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}