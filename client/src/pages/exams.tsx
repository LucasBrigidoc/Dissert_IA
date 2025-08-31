import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, Plus, Trash2, Edit3, MapPin, Clock, AlertCircle, CheckCircle2, GraduationCap } from "lucide-react";

interface Exam {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: "vestibular" | "concurso" | "simulado" | "outros";
  status: "upcoming" | "completed" | "cancelled";
  subjects: string[];
  duration: string;
  importance: "alta" | "media" | "baixa";
}

export default function Exams() {
  const [, setLocation] = useLocation();
  
  const [exams, setExams] = useState<Exam[]>([
    {
      id: 1,
      name: "Simulado ENEM",
      date: "2024-10-28",
      time: "08:00",
      location: "Escola Municipal",
      description: "Simulado completo do ENEM com redação e questões de todas as áreas",
      type: "simulado",
      status: "upcoming",
      subjects: ["Matemática", "Português", "Redação", "Ciências Humanas", "Ciências da Natureza"],
      duration: "5h30min",
      importance: "alta"
    },
    {
      id: 2,
      name: "ENEM 1º dia",
      date: "2024-11-03",
      time: "13:30",
      location: "Centro de Convenções",
      description: "Primeiro dia do ENEM - Linguagens, Códigos, Ciências Humanas e Redação",
      type: "vestibular",
      status: "upcoming",
      subjects: ["Português", "Literatura", "Língua Estrangeira", "Redação", "História", "Geografia", "Filosofia", "Sociologia"],
      duration: "5h30min",
      importance: "alta"
    },
    {
      id: 3,
      name: "ENEM 2º dia",
      date: "2024-11-10",
      time: "13:30",
      location: "Centro de Convenções",
      description: "Segundo dia do ENEM - Ciências da Natureza e Matemática",
      type: "vestibular",
      status: "upcoming",
      subjects: ["Matemática", "Física", "Química", "Biologia"],
      duration: "5h",
      importance: "alta"
    }
  ]);

  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExam, setNewExam] = useState<Partial<Exam>>({
    name: "",
    date: "",
    time: "",
    location: "",
    description: "",
    type: "simulado",
    status: "upcoming",
    subjects: [],
    duration: "",
    importance: "media"
  });

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

  const handleAddExam = () => {
    if (newExam.name && newExam.date && newExam.time) {
      setExams([...exams, {
        ...newExam as Exam,
        id: Date.now(),
        subjects: newExam.subjects || []
      }]);
      setNewExam({
        name: "",
        date: "",
        time: "",
        location: "",
        description: "",
        type: "simulado",
        status: "upcoming",
        subjects: [],
        duration: "",
        importance: "media"
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteExam = (id: number) => {
    setExams(exams.filter(exam => exam.id !== id));
  };

  const handleUpdateExam = (updatedExam: Exam) => {
    setExams(exams.map(exam => exam.id === updatedExam.id ? updatedExam : exam));
    setEditingExam(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const examDate = new Date(dateStr);
    const today = new Date();
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Já passou";
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Amanhã";
    return `${diffDays} dias`;
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
                onClick={() => setShowAddForm(false)}
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
                  value={newExam.date}
                  onChange={(e) => setNewExam({...newExam, date: e.target.value})}
                  className="mt-1"
                  data-testid="input-new-exam-date"
                />
              </div>
              
              <div>
                <Label className="text-sm text-dark-blue">Horário</Label>
                <Input
                  type="time"
                  value={newExam.time}
                  onChange={(e) => setNewExam({...newExam, time: e.target.value})}
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
                <Label className="text-sm text-dark-blue">Duração</Label>
                <Input
                  value={newExam.duration}
                  onChange={(e) => setNewExam({...newExam, duration: e.target.value})}
                  placeholder="Ex: 5h30min"
                  className="mt-1"
                  data-testid="input-new-exam-duration"
                />
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
              >
                Salvar Prova
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                data-testid="button-cancel-new-exam"
              >
                Cancelar
              </Button>
            </div>
          </LiquidGlassCard>
        )}

        {/* Exams List */}
        <div className="grid gap-4">
          {exams.map((exam) => (
            <LiquidGlassCard key={exam.id} className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-dark-blue">{exam.name}</h3>
                    <Badge className={getStatusColor(exam.status)}>
                      {getStatusIcon(exam.status)}
                      <span className="ml-1 capitalize">{exam.status === 'upcoming' ? 'Próxima' : exam.status === 'completed' ? 'Concluída' : 'Cancelada'}</span>
                    </Badge>
                    <Badge className={getImportanceColor(exam.importance)}>
                      Importância {exam.importance}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-bright-blue" size={16} />
                      <div>
                        <div className="text-sm font-medium text-dark-blue">{formatDate(exam.date)}</div>
                        <div className="text-xs text-soft-gray">{getDaysUntil(exam.date)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="text-bright-blue" size={16} />
                      <div>
                        <div className="text-sm font-medium text-dark-blue">{exam.time}</div>
                        <div className="text-xs text-soft-gray">{exam.duration}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="text-bright-blue" size={16} />
                      <div>
                        <div className="text-sm font-medium text-dark-blue">{exam.location}</div>
                        <div className="text-xs text-soft-gray capitalize">{exam.type}</div>
                      </div>
                    </div>
                  </div>
                  
                  {exam.description && (
                    <p className="text-sm text-soft-gray mb-3">{exam.description}</p>
                  )}
                  
                  {exam.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exam.subjects.map((subject, index) => (
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
                    onClick={() => setEditingExam(exam)}
                    className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
                    data-testid={`button-edit-exam-${exam.id}`}
                  >
                    <Edit3 size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteExam(exam.id)}
                    className="text-red-500 border-red-300 hover:bg-red-50"
                    data-testid={`button-delete-exam-${exam.id}`}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </LiquidGlassCard>
          ))}
        </div>

        {exams.length === 0 && (
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
        )}
      </div>
    </div>
  );
}