import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Plus, Trash2, Edit3, MapPin, Clock, AlertCircle, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SelectUserExam } from "@shared/schema";

export default function Exams() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExam, setNewExam] = useState({
    name: "",
    examDate: "",
    examTime: "",
    location: "",
    description: "",
    type: "simulado" as const,
    status: "upcoming" as const,
    subjects: [] as string[],
    durationMinutes: "",
    importance: "media" as const
  });

  const { data: exams = [], isLoading, isError, error, refetch } = useQuery<SelectUserExam[]>({
    queryKey: ['/api/exams']
  });

  const createExamMutation = useMutation({
    mutationFn: async (examData: any) => {
      return apiRequest('/api/exams', {
        method: 'POST',
        body: examData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      toast({ title: "Prova criada com sucesso!" });
      resetNewExam();
      setShowAddForm(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar prova", 
        description: error.message || "Verifique os dados e tente novamente",
        variant: "destructive" 
      });
    }
  });

  const updateExamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SelectUserExam> }) => {
      return apiRequest(`/api/exams/${id}`, {
        method: 'PATCH',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      toast({ title: "Prova atualizada com sucesso!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar prova",
        description: error.message || "Verifique os dados e tente novamente",
        variant: "destructive" 
      });
    }
  });

  const deleteExamMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/exams/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
      toast({ title: "Prova excluída com sucesso!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao excluir prova",
        description: error.message || "Tente novamente",
        variant: "destructive" 
      });
    }
  });

  const resetNewExam = () => {
    setNewExam({
      name: "",
      examDate: "",
      examTime: "",
      location: "",
      description: "",
      type: "simulado",
      status: "upcoming",
      subjects: [],
      durationMinutes: "",
      importance: "media"
    });
  };

  const handleAddExam = () => {
    if (!newExam.name) {
      toast({ title: "O nome é obrigatório", variant: "destructive" });
      return;
    }
    
    if (!newExam.examDate || !newExam.examTime) {
      toast({ title: "Data e horário são obrigatórios", variant: "destructive" });
      return;
    }

    const examAt = new Date(`${newExam.examDate}T${newExam.examTime}`);
    
    const examData: any = {
      name: newExam.name,
      examAt: examAt.toISOString(),
      type: newExam.type,
      status: newExam.status,
      importance: newExam.importance,
      subjects: newExam.subjects
    };

    if (newExam.location) examData.location = newExam.location;
    if (newExam.description) examData.description = newExam.description;
    if (newExam.durationMinutes) {
      const durationNum = parseInt(newExam.durationMinutes);
      if (!isNaN(durationNum) && durationNum > 0) {
        examData.durationMinutes = durationNum;
      }
    }

    createExamMutation.mutate(examData);
  };

  const handleDeleteExam = (id: string) => {
    deleteExamMutation.mutate(id);
  };

  const handleStatusChange = (id: string, status: string) => {
    updateExamMutation.mutate({ id, data: { status: status as any } });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming": return <AlertCircle size={14} />;
      case "completed": return <CheckCircle2 size={14} />;
      case "cancelled": return <Trash2 size={14} />;
      default: return <Calendar size={14} />;
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "alta": return "bg-red-100 text-red-800 border-red-200";
      case "media": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "baixa": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Já passou";
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Amanhã";
    return `${diffDays} dias`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h${mins}min`;
    if (hours > 0) return `${hours}h`;
    return `${mins}min`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-bright-blue/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setLocation('/dashboard')}
              className="text-dark-blue hover:bg-bright-blue/10"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft size={20} className="mr-2" />
              Voltar ao Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center">
                <GraduationCap className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-bold text-dark-blue">Gerenciar Provas</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 pt-24 space-y-6">
        
        {/* Error State */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Erro ao carregar provas. {error instanceof Error ? error.message : 'Tente novamente.'}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-4"
                data-testid="button-retry-exams"
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Add New Exam Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
            data-testid="button-add-exam"
          >
            <Plus size={16} className="mr-2" />
            Adicionar Nova Prova
          </Button>
        </div>

        {/* Add New Exam Form */}
        {showAddForm && (
          <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-dark-blue">Adicionar Nova Prova</h2>
              <Button
                variant="ghost"
                onClick={() => { setShowAddForm(false); resetNewExam(); }}
                className="text-soft-gray hover:bg-soft-gray/10"
              >
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm text-dark-blue">Nome da Prova</Label>
                <Input
                  value={newExam.name}
                  onChange={(e) => setNewExam({...newExam, name: e.target.value})}
                  placeholder="Ex: ENEM 2024"
                  className="mt-1"
                  data-testid="input-new-exam-name"
                />
              </div>
              
              <div>
                <Label className="text-sm text-dark-blue">Tipo</Label>
                <Select value={newExam.type} onValueChange={(value) => setNewExam({...newExam, type: value as any})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vestibular">Vestibular</SelectItem>
                    <SelectItem value="concurso">Concurso</SelectItem>
                    <SelectItem value="simulado">Simulado</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm text-dark-blue">Data</Label>
                <Input
                  type="date"
                  value={newExam.examDate}
                  onChange={(e) => setNewExam({...newExam, examDate: e.target.value})}
                  className="mt-1"
                  data-testid="input-new-exam-date"
                />
              </div>
              
              <div>
                <Label className="text-sm text-dark-blue">Horário</Label>
                <Input
                  type="time"
                  value={newExam.examTime}
                  onChange={(e) => setNewExam({...newExam, examTime: e.target.value})}
                  className="mt-1"
                  data-testid="input-new-exam-time"
                />
              </div>
              
              <div>
                <Label className="text-sm text-dark-blue">Local</Label>
                <Input
                  value={newExam.location}
                  onChange={(e) => setNewExam({...newExam, location: e.target.value})}
                  placeholder="Ex: Centro de Convenções"
                  className="mt-1"
                  data-testid="input-new-exam-location"
                />
              </div>
              
              <div>
                <Label className="text-sm text-dark-blue">Duração (minutos)</Label>
                <Input
                  type="number"
                  value={newExam.durationMinutes}
                  onChange={(e) => setNewExam({...newExam, durationMinutes: e.target.value})}
                  placeholder="Ex: 330 (5h30min)"
                  className="mt-1"
                  data-testid="input-new-exam-duration"
                />
              </div>

              <div>
                <Label className="text-sm text-dark-blue">Importância</Label>
                <Select value={newExam.importance} onValueChange={(value) => setNewExam({...newExam, importance: value as any})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-4">
              <Label className="text-sm text-dark-blue">Descrição</Label>
              <Textarea
                value={newExam.description}
                onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                placeholder="Descreva a prova..."
                className="mt-1 h-20 resize-none"
                data-testid="textarea-new-exam-description"
              />
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={handleAddExam}
                className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                data-testid="button-save-new-exam"
                disabled={createExamMutation.isPending}
              >
                {createExamMutation.isPending ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : null}
                Salvar Prova
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowAddForm(false); resetNewExam(); }}
                data-testid="button-cancel-new-exam"
              >
                Cancelar
              </Button>
            </div>
          </LiquidGlassCard>
        )}

        {/* Exams List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-bright-blue" />
          </div>
        ) : exams.length === 0 ? (
          <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20">
            <div className="text-center py-12">
              <GraduationCap className="mx-auto text-soft-gray mb-4" size={48} />
              <h3 className="text-lg font-semibold text-dark-blue mb-2">Nenhuma prova cadastrada</h3>
              <p className="text-soft-gray mb-4">Adicione suas provas para começar a organizar seus estudos</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
              >
                <Plus size={16} className="mr-2" />
                Adicionar Primeira Prova
              </Button>
            </div>
          </LiquidGlassCard>
        ) : (
          <div className="grid gap-4">
            {exams.map((exam) => (
              <LiquidGlassCard key={exam.id} className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-dark-blue">{exam.name}</h3>
                      <Select
                        value={exam.status || 'upcoming'}
                        onValueChange={(value) => handleStatusChange(exam.id, value)}
                      >
                        <SelectTrigger className={`w-[130px] ${getStatusColor(exam.status || 'upcoming')}`}>
                          <div className="flex items-center">
                            {getStatusIcon(exam.status || 'upcoming')}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="upcoming">Próxima</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge className={getImportanceColor(exam.importance || 'media')}>
                        Importância {exam.importance || 'media'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="text-bright-blue" size={16} />
                        <div>
                          <div className="text-sm font-medium text-dark-blue">{formatDate(exam.examAt)}</div>
                          <div className="text-xs text-soft-gray">{getDaysUntil(exam.examAt)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="text-bright-blue" size={16} />
                        <div>
                          <div className="text-sm font-medium text-dark-blue">{formatTime(exam.examAt)}</div>
                          <div className="text-xs text-soft-gray">{formatDuration(exam.durationMinutes || undefined)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="text-bright-blue" size={16} />
                        <div>
                          <div className="text-sm font-medium text-dark-blue">{exam.location || "Não informado"}</div>
                          <div className="text-xs text-soft-gray capitalize">{exam.type}</div>
                        </div>
                      </div>
                    </div>
                    
                    {exam.description && (
                      <p className="text-sm text-soft-gray mb-3">{exam.description}</p>
                    )}
                    
                    {exam.subjects && Array.isArray(exam.subjects) && (exam.subjects as string[]).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(exam.subjects as string[]).map((subject, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteExam(exam.id)}
                      className="text-red-500 border-red-300 hover:bg-red-50"
                      data-testid={`button-delete-exam-${exam.id}`}
                      disabled={deleteExamMutation.isPending}
                    >
                      {deleteExamMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </Button>
                  </div>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
