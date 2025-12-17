import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  FileText, Plus, Edit, Trash2, RefreshCw, Eye, EyeOff, 
  Star, StarOff, BarChart3, Mail, Book, Tag, Search, 
  Calendar, Clock, CheckCircle, Loader2
} from "lucide-react";
import { Link } from "wouter";
import { useAdminCheck } from "@/hooks/use-admin-check";
import type { BlogPost } from "@shared/schema";

const categories = [
  { value: "redacao", label: "Redação" },
  { value: "portugues", label: "Português" },
  { value: "vestibular", label: "Vestibular" },
  { value: "enem", label: "ENEM" },
  { value: "concursos", label: "Concursos" },
  { value: "dicas", label: "Dicas" },
  { value: "novidades", label: "Novidades" },
];

const formatDate = (dateStr: string | Date | null | undefined) => {
  if (!dateStr) return "-";
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export default function AdminBlog() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { toast } = useToast();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "dicas" as string,
    tags: [] as string[],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    isPublished: false,
    isFeatured: false,
  });
  const [tagInput, setTagInput] = useState("");

  const { data: posts, isLoading, refetch } = useQuery<BlogPost[]>({
    queryKey: ['/api/admin/blog'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest('/api/admin/blog', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog'] });
      toast({ title: "Post criado com sucesso!" });
      setShowCreateDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao criar post", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return await apiRequest(`/api/admin/blog/${id}`, {
        method: 'PUT',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog'] });
      toast({ title: "Post atualizado com sucesso!" });
      setShowEditDialog(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar post", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/blog/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog'] });
      toast({ title: "Post removido com sucesso!" });
      setShowDeleteDialog(false);
      setSelectedPost(null);
    },
    onError: () => {
      toast({ title: "Erro ao remover post", variant: "destructive" });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/blog/${id}/publish`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog'] });
      toast({ title: "Status de publicação alterado!" });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/admin/blog/${id}/featured`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog'] });
      toast({ title: "Destaque alterado!" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      category: "dicas",
      tags: [],
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      isPublished: false,
      isFeatured: false,
    });
    setTagInput("");
  };

  const openEditDialog = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage || "",
      category: post.category,
      tags: (post.tags as string[]) || [],
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      metaKeywords: post.metaKeywords || "",
      isPublished: post.isPublished,
      isFeatured: post.isFeatured,
    });
    setShowEditDialog(true);
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const filteredPosts = posts?.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || post.category === filterCategory;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "published" && post.isPublished) ||
                         (filterStatus === "draft" && !post.isPublished);
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const stats = {
    total: posts?.length || 0,
    published: posts?.filter(p => p.isPublished).length || 0,
    drafts: posts?.filter(p => !p.isPublished).length || 0,
    featured: posts?.filter(p => p.isFeatured).length || 0,
    totalViews: posts?.reduce((acc, p) => acc + (p.viewCount || 0), 0) || 0,
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-bright-blue" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Acesso negado. Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3" data-testid="text-page-title">
              <FileText className="text-bright-blue" size={32} />
              Gerenciamento do Blog
            </h1>
            <p className="text-muted-foreground">
              Crie, edite e gerencie posts do blog e configurações de SEO
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} data-testid="button-refresh">
              <RefreshCw size={16} className="mr-2" />
              Atualizar
            </Button>
            <Button onClick={() => { resetForm(); setShowCreateDialog(true); }} data-testid="button-create-post">
              <Plus size={16} className="mr-2" />
              Novo Post
            </Button>
          </div>
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
          <Link href="/admin/coupons">
            <Button variant="outline" className="gap-2" data-testid="button-admin-coupons">
              <Tag size={16} />
              Admin Cupons
            </Button>
          </Link>
          <Button variant="default" className="gap-2" data-testid="button-admin-blog">
            <FileText size={16} />
            Admin Blog
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card data-testid="card-total-posts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Posts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="text-bright-blue" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-published-posts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Publicados</p>
                <p className="text-2xl font-bold">{stats.published}</p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-draft-posts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold">{stats.drafts}</p>
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-featured-posts">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Destaque</p>
                <p className="text-2xl font-bold">{stats.featured}</p>
              </div>
              <Star className="text-yellow-400" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-views">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Visualizações</p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString('pt-BR')}</p>
              </div>
              <Eye className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="published">Publicados</SelectItem>
                <SelectItem value="draft">Rascunhos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle>Posts do Blog ({filteredPosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-bright-blue" size={32} />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum post encontrado</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => { resetForm(); setShowCreateDialog(true); }}
              >
                Criar primeiro post
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`post-item-${post.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{post.title}</h3>
                      {post.isFeatured && (
                        <Star className="text-yellow-400 flex-shrink-0" size={16} />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant={post.isPublished ? "default" : "secondary"}>
                        {post.isPublished ? "Publicado" : "Rascunho"}
                      </Badge>
                      <Badge variant="outline">
                        {categories.find(c => c.value === post.category)?.label || post.category}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {post.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFeaturedMutation.mutate(post.id)}
                      title={post.isFeatured ? "Remover destaque" : "Destacar"}
                      data-testid={`button-toggle-featured-${post.id}`}
                    >
                      {post.isFeatured ? (
                        <StarOff size={16} className="text-yellow-400" />
                      ) : (
                        <Star size={16} />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublishMutation.mutate(post.id)}
                      title={post.isPublished ? "Despublicar" : "Publicar"}
                      data-testid={`button-toggle-publish-${post.id}`}
                    >
                      {post.isPublished ? (
                        <EyeOff size={16} className="text-green-500" />
                      ) : (
                        <Eye size={16} />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(post)}
                      data-testid={`button-edit-${post.id}`}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setSelectedPost(post); setShowDeleteDialog(true); }}
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-delete-${post.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showEditDialog ? "Editar Post" : "Novo Post"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do post e configure as opções de SEO
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Título do post"
                  data-testid="input-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-do-post"
                  data-testid="input-slug"
                />
                <p className="text-xs text-muted-foreground">
                  URL: /blog/{formData.slug || "url-do-post"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverImage">URL da Imagem de Capa</Label>
                  <Input
                    id="coverImage"
                    value={formData.coverImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="https://..."
                    data-testid="input-cover-image"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumo *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Breve descrição do post (max 300 caracteres)"
                  rows={2}
                  maxLength={300}
                  data-testid="input-excerpt"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.excerpt.length}/300
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Conteúdo do post (suporta Markdown)"
                  rows={10}
                  data-testid="input-content"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Adicionar tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    data-testid="input-tag"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                    data-testid="switch-published"
                  />
                  <Label htmlFor="isPublished">Publicar</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                    data-testid="switch-featured"
                  />
                  <Label htmlFor="isFeatured">Destacar</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <div className="p-4 bg-muted rounded-lg mb-4">
                <h4 className="font-medium mb-2">Pré-visualização nos buscadores</h4>
                <div className="space-y-1">
                  <p className="text-blue-600 text-lg">
                    {formData.metaTitle || formData.title || "Título do Post"}
                  </p>
                  <p className="text-green-700 text-sm">
                    dissertia.com/blog/{formData.slug || "url-do-post"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.metaDescription || formData.excerpt || "Descrição do post aparecerá aqui..."}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder={formData.title || "Título para SEO (deixe vazio para usar o título)"}
                  data-testid="input-meta-title"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 50-60 caracteres. Atual: {(formData.metaTitle || formData.title).length}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder={formData.excerpt || "Descrição para SEO (deixe vazio para usar o resumo)"}
                  rows={3}
                  data-testid="input-meta-description"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 150-160 caracteres. Atual: {(formData.metaDescription || formData.excerpt).length}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaKeywords: e.target.value }))}
                  placeholder="palavra1, palavra2, palavra3"
                  data-testid="input-meta-keywords"
                />
                <p className="text-xs text-muted-foreground">
                  Separe as palavras-chave por vírgula
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (showEditDialog && selectedPost) {
                  updateMutation.mutate({ id: selectedPost.id, data: formData });
                } else {
                  createMutation.mutate(formData);
                }
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-save-post"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="animate-spin mr-2" size={16} />
              )}
              {showEditDialog ? "Salvar Alterações" : "Criar Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o post "{selectedPost?.title}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedPost && deleteMutation.mutate(selectedPost.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
