import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Mail, 
  Users, 
  Send, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart,
  TrendingUp,
  Loader2,
  ArrowLeft,
  BookOpen,
  BarChart3,
  Book,
  Tag
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Newsletter, NewsletterSubscriber } from "@shared/schema";
import { useAdminCheck } from "@/hooks/use-admin-check";

interface NewsletterStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
}

export default function AdminNewsletter() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (adminLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    content: "",
    previewText: "",
    excerpt: "",
    readTime: "",
    category: "",
    isNew: false,
    publishDate: "",
    tags: [] as string[],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch newsletters
  const { data: newsletters = [], isLoading: loadingNewsletters } = useQuery<Newsletter[]>({
    queryKey: ["/api/admin/newsletter/newsletters"],
  });

  // Fetch subscribers
  const { data: subscribers = [], isLoading: loadingSubscribers } = useQuery<NewsletterSubscriber[]>({
    queryKey: ["/api/admin/newsletter/subscribers"],
  });

  // Create newsletter mutation
  const createNewsletter = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/newsletter/newsletters", {
      method: "POST",
      body: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/newsletters"] });
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: "Newsletter criada!",
        description: "A newsletter foi criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar newsletter",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    },
  });

  // Update newsletter mutation
  const updateNewsletter = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      apiRequest(`/api/admin/newsletter/newsletters/${id}`, {
        method: "PUT",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/newsletters"] });
      setShowEditDialog(false);
      resetForm();
      toast({
        title: "Newsletter atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar newsletter",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    },
  });

  // Send newsletter mutation
  const sendNewsletter = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/admin/newsletter/newsletters/${id}/send`, {
        method: "POST",
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/newsletters"] });
      toast({
        title: "Newsletter enviada! 🎉",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar newsletter",
        description: error?.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Publish newsletter mutation (without sending emails)
  const publishNewsletter = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/admin/newsletter/newsletters/${id}/publish`, {
        method: "POST",
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/newsletters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter/feed"] });
      toast({
        title: "Newsletter publicada! 🎉",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao publicar newsletter",
        description: error?.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Delete newsletter mutation
  const deleteNewsletter = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/admin/newsletter/newsletters/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/newsletters"] });
      toast({
        title: "Newsletter removida",
        description: "A newsletter foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao remover newsletter",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      content: "",
      previewText: "",
      excerpt: "",
      readTime: "",
      category: "",
      isNew: false,
      publishDate: "",
      tags: [],
    });
    setSelectedNewsletter(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNewsletter.mutate(formData);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNewsletter) {
      updateNewsletter.mutate({
        id: selectedNewsletter.id,
        data: formData,
      });
    }
  };

  const handleEditClick = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setFormData({
      title: newsletter.title,
      subject: newsletter.subject,
      content: newsletter.content,
      previewText: newsletter.previewText || "",
      excerpt: newsletter.excerpt || "",
      readTime: newsletter.readTime || "",
      category: newsletter.category || "",
      isNew: newsletter.isNew || false,
      publishDate: newsletter.publishDate ? new Date(newsletter.publishDate).toISOString().split('T')[0] : "",
      tags: Array.isArray(newsletter.tags) ? newsletter.tags : [],
    });
    setShowEditDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary" className="gap-1"><Clock size={12} />Rascunho</Badge>;
      case "sent":
        return <Badge variant="default" className="gap-1"><CheckCircle size={12} />Enviada</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="gap-1"><Calendar size={12} />Agendada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const activeSubscribers = subscribers?.filter((s: NewsletterSubscriber) => s.status === "active") || [];
  const totalSubscribers = subscribers?.length || 0;

  if (loadingNewsletters || loadingSubscribers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-bright-blue" size={32} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gerenciamento de Newsletter</h1>
            <p className="text-muted-foreground">
              Crie, gerencie e envie newsletters para seus assinantes
            </p>
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
          <Button variant="default" className="gap-2" data-testid="button-admin-newsletter">
            <Mail size={16} />
            Admin Newsletter
          </Button>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Assinantes</p>
                <p className="text-2xl font-bold">{totalSubscribers}</p>
              </div>
              <Users className="text-bright-blue" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assinantes Ativos</p>
                <p className="text-2xl font-bold">{activeSubscribers.length}</p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Newsletters</p>
                <p className="text-2xl font-bold">{newsletters?.length || 0}</p>
              </div>
              <Mail className="text-purple-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enviadas</p>
                <p className="text-2xl font-bold">
                  {newsletters?.filter((n: Newsletter) => n.status === "sent").length || 0}
                </p>
              </div>
              <TrendingUp className="text-bright-blue" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="newsletters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="newsletters">Newsletters</TabsTrigger>
          <TabsTrigger value="subscribers">Assinantes</TabsTrigger>
        </TabsList>

        <TabsContent value="newsletters" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Todas as Newsletters</h2>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="button-create-newsletter">
                  <Plus size={16} />
                  Nova Newsletter
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Nova Newsletter</DialogTitle>
                  <DialogDescription>
                    Crie uma nova newsletter para enviar aos seus assinantes
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Newsletter da Semana #1"
                        required
                        data-testid="input-newsletter-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Assunto do Email</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Ex: Dicas de Redação desta Semana"
                        required
                        data-testid="input-newsletter-subject"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="Ex: Atualidades, Educação, Meio Ambiente"
                        required
                        data-testid="input-newsletter-category"
                      />
                    </div>
                    <div>
                      <Label htmlFor="readTime">Tempo de Leitura</Label>
                      <Input
                        id="readTime"
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                        placeholder="Ex: 8 min"
                        required
                        data-testid="input-newsletter-readtime"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="previewText">Texto de Prévia</Label>
                    <Input
                      id="previewText"
                      value={formData.previewText}
                      onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
                      placeholder="Texto que aparece na prévia do email"
                      data-testid="input-newsletter-preview"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Resumo da Newsletter</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Breve resumo que aparecerá na página pública da newsletter..."
                      className="min-h-[80px]"
                      required
                      data-testid="textarea-newsletter-excerpt"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="publishDate">Data de Publicação</Label>
                      <Input
                        id="publishDate"
                        type="date"
                        value={formData.publishDate}
                        onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                        data-testid="input-newsletter-publishdate"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <input
                        type="checkbox"
                        id="isNew"
                        checked={formData.isNew}
                        onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                        data-testid="checkbox-newsletter-isnew"
                      />
                      <Label htmlFor="isNew">Marcar como "Newsletter da Semana"</Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Conteúdo da Newsletter</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Escreva o conteúdo da sua newsletter aqui..."
                      className="min-h-[200px]"
                      required
                      data-testid="textarea-newsletter-content"
                    />
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
                      disabled={createNewsletter.isPending}
                      data-testid="button-save-newsletter"
                    >
                      {createNewsletter.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
                      Criar Newsletter
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {newsletters?.map((newsletter: Newsletter) => (
              <Card key={newsletter.id} data-testid={`newsletter-card-${newsletter.id}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">{newsletter.title}</h3>
                        {getStatusBadge(newsletter.status)}
                      </div>
                      <p className="text-muted-foreground">{newsletter.subject}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Criada: {new Date(newsletter.createdAt!).toLocaleDateString('pt-BR')}</span>
                        {newsletter.sentAt && (
                          <span>Enviada: {new Date(newsletter.sentAt).toLocaleDateString('pt-BR')}</span>
                        )}
                        {newsletter.sentCount && (
                          <span>{newsletter.sentCount} enviadas</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(newsletter)}
                        data-testid={`button-edit-${newsletter.id}`}
                      >
                        <Edit size={16} />
                      </Button>
                      
                      {newsletter.status !== "sent" && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => publishNewsletter.mutate(newsletter.id)}
                            disabled={publishNewsletter.isPending}
                            data-testid={`button-publish-${newsletter.id}`}
                            title="Publicar na página pública sem enviar emails"
                          >
                            {publishNewsletter.isPending ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => sendNewsletter.mutate(newsletter.id)}
                            disabled={sendNewsletter.isPending}
                            data-testid={`button-send-${newsletter.id}`}
                            title="Enviar por email para todos os assinantes"
                          >
                            {sendNewsletter.isPending ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Send size={16} />
                            )}
                          </Button>
                        </>
                      )}
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteNewsletter.mutate(newsletter.id)}
                        disabled={deleteNewsletter.isPending}
                        data-testid={`button-delete-${newsletter.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {newsletters?.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Mail className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma newsletter criada</h3>
                  <p className="text-muted-foreground mb-4">
                    Comece criando sua primeira newsletter para seus assinantes
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus size={16} className="mr-2" />
                    Criar Newsletter
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Assinantes da Newsletter</h2>
          </div>

          <div className="grid gap-4">
            {subscribers?.map((subscriber: NewsletterSubscriber) => (
              <Card key={subscriber.id} data-testid={`subscriber-card-${subscriber.id}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{subscriber.email}</p>
                        {subscriber.name && (
                          <span className="text-muted-foreground">({subscriber.name})</span>
                        )}
                        <Badge variant={subscriber.status === "active" ? "default" : "secondary"}>
                          {subscriber.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Inscrito em: {new Date(subscriber.createdAt!).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {subscribers?.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <h3 className="text-lg font-semibold mb-2">Nenhum assinante ainda</h3>
                  <p className="text-muted-foreground">
                    Os assinantes aparecerão aqui quando se inscreverem na newsletter
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Newsletter</DialogTitle>
            <DialogDescription>
              Faça as alterações necessárias na newsletter
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-subject">Assunto do Email</Label>
                <Input
                  id="edit-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-readTime">Tempo de Leitura</Label>
                <Input
                  id="edit-readTime"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-previewText">Texto de Prévia</Label>
              <Input
                id="edit-previewText"
                value={formData.previewText}
                onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-excerpt">Resumo da Newsletter</Label>
              <Textarea
                id="edit-excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-publishDate">Data de Publicação</Label>
                <Input
                  id="edit-publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="edit-isNew"
                  checked={formData.isNew}
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                />
                <Label htmlFor="edit-isNew">Marcar como "Newsletter da Semana"</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-content">Conteúdo da Newsletter</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[200px]"
                required
              />
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
                disabled={updateNewsletter.isPending}
              >
                {updateNewsletter.isPending && <Loader2 className="animate-spin mr-2" size={16} />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}