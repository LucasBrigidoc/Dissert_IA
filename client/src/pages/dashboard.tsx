import { useState, useEffect, useMemo } from "react";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircle, Search, GraduationCap, Sliders, Calendar, TrendingUp, Book, Lightbulb, Plus, LogOut, Home, Settings, Target, Clock, CheckCircle2, Timer, AlertTriangle, Edit3, X, Save, Grid3X3, MoreVertical, Menu, Archive, Star, Sparkles, BookOpen, Trash2, AlertCircle, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { OnboardingTour } from "@/components/OnboardingTour";

interface ScoreData {
  id: number;
  date: string;
  totalScore: number;
  competence1?: number;
  competence2?: number;
  competence3?: number;
  competence4?: number;
  competence5?: number;
  source: 'platform' | 'external';
  examName?: string;
}

interface ScheduleDay {
  day: string;
  activities: string[];
  hours: number;
  minutes: number;
  completed: boolean;
}

interface Goal {
  id: number;
  title: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

interface Exam {
  id: number;
  name: string;
  date: string;
  time?: string;
  location?: string;
  type: string;
  description?: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch user progress data
  const { data: userProgress, isLoading: progressLoading } = useQuery<{
    id: string;
    userId: string;
    averageScore: number;
    targetScore: number | null;
    essaysCount: number;
    studyHours: number;
    streak: number;
    createdAt: Date;
    updatedAt: Date;
  }>({
    queryKey: ["/api/user-progress"],
    enabled: !!user,
  });

  // Fetch user goals
  const { data: userGoals, isLoading: goalsLoading } = useQuery<Array<{
    id: string;
    userId: string;
    title: string;
    description: string | null;
    target: number;
    current: number;
    unit: string;
    completed: boolean;
    priority: string;
    createdAt: Date;
    updatedAt: Date;
  }>>({
    queryKey: ["/api/goals"],
    enabled: !!user,
  });

  // Fetch user exams
  const { data: userExams, isLoading: examsLoading } = useQuery<Array<{
    id: string;
    userId: string;
    name: string;
    examAt: Date;
    location: string | null;
    description: string | null;
    type: string;
    status: string;
    subjects: string[];
    durationMinutes: number | null;
    importance: string;
    createdAt: Date;
    updatedAt: Date;
  }>>({
    queryKey: ["/api/exams"],
    enabled: !!user,
  });

  // State for simulator time period filter (must be declared before useMemo)
  const [simulatorPeriod, setSimulatorPeriod] = useState<string>('all');

  // Fetch user simulations for average time calculation
  const { data: simulationsData, isLoading: simulationsLoading } = useQuery<{
    results: Array<{
      id: string;
      userId: string | null;
      title: string;
      timeTaken: number | null;
      score: number | null;
      isCompleted: boolean;
      createdAt: Date;
    }>;
    count: number;
    hasMore: boolean;
  }>({
    queryKey: ["/api/simulations"],
    enabled: !!user,
  });

  // Calculate average simulation time and check if we have data
  const userSimulations = simulationsData?.results || [];
  
  // Filter simulations by period
  const filteredSimulations = useMemo(() => {
    const now = new Date();
    const periodDays = {
      'all': null,
      '7days': 7,
      '15days': 15,
      '1month': 30,
      '3months': 90,
    }[simulatorPeriod];
    
    if (!periodDays) return userSimulations;
    
    const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    return userSimulations.filter(sim => new Date(sim.createdAt) >= cutoffDate);
  }, [userSimulations, simulatorPeriod]);
  
  const completedSimulationsWithTime = filteredSimulations.filter(s => s.timeTaken !== null && s.timeTaken !== undefined && s.isCompleted);
  const hasSimulationTimeData = completedSimulationsWithTime.length > 0;
  const averageSimulationTimeMinutes = hasSimulationTimeData
    ? Math.round(completedSimulationsWithTime.reduce((sum, s) => sum + (s.timeTaken || 0), 0) / completedSimulationsWithTime.length)
    : 0;

  // Calculate average time breakdown by checkpoint
  const simulationsWithBreakdown = completedSimulationsWithTime.filter((s: any) => s.timeBreakdown);
  const hasBreakdownData = simulationsWithBreakdown.length > 0;
  
  const averageBreakdown = hasBreakdownData ? {
    brainstorm: Math.round(
      simulationsWithBreakdown.reduce((sum: number, s: any) => {
        const breakdown = s.timeBreakdown as any;
        return sum + (breakdown?.brainstorm || 0);
      }, 0) / simulationsWithBreakdown.length / 60 // Convert seconds to minutes
    ),
    rascunho: Math.round(
      simulationsWithBreakdown.reduce((sum: number, s: any) => {
        const breakdown = s.timeBreakdown as any;
        return sum + (breakdown?.rascunho || 0);
      }, 0) / simulationsWithBreakdown.length / 60
    ),
    passaLimpo: Math.round(
      simulationsWithBreakdown.reduce((sum: number, s: any) => {
        const breakdown = s.timeBreakdown as any;
        return sum + (breakdown?.passaLimpo || 0);
      }, 0) / simulationsWithBreakdown.length / 60
    ),
  } : { brainstorm: 0, rascunho: 0, passaLimpo: 0 };

  // State for competency period filter
  const [competencyPeriod, setCompetencyPeriod] = useState<string>('all');
  
  // State for average score period filter
  const [averagePeriod, setAveragePeriod] = useState<string>('all');
  
  // State for score chart period filter
  const [scorePeriod, setScorePeriod] = useState<string>('30-days');

  // Fetch user competencies analysis
  const { data: userCompetencies } = useQuery<{
    hasData: boolean;
    weakestCompetencies: Array<{
      id: number;
      name: string;
      score: number;
      feedback: string;
    }>;
    averages: {
      competence1: number;
      competence2: number;
      competence3: number;
      competence4: number;
      competence5: number;
    };
    overallAverage: number;
    essaysAnalyzed: number;
  }>({
    queryKey: ["/api/user-competencies", competencyPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/user-competencies?period=${competencyPeriod}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch competencies');
      return response.json();
    },
    enabled: !!user,
  });

  // Mutation to update user progress
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { targetScore?: number; averageScore?: number; essaysCount?: number; studyHours?: number; streak?: number }) => {
      return await apiRequest("/api/user-progress", {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-progress"] });
      toast({
        title: "Progresso atualizado",
        description: "Seus dados foram salvos com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar suas alterações.",
        variant: "destructive",
      });
    },
  });

  // Mutations for goals
  const createGoalMutation = useMutation({
    mutationFn: async (data: { title: string; target: number; unit: string; description?: string; priority?: string }) => {
      return await apiRequest("/api/goals", {
        method: "POST",
        body: {
          userId: user?.id,
          title: data.title,
          target: data.target,
          current: 0,
          unit: data.unit,
          description: data.description || null,
          priority: data.priority || "media",
          completed: false,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Meta criada",
        description: "Sua meta foi criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar meta",
        description: "Não foi possível criar a meta.",
        variant: "destructive",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ title: string; target: number; current: number; unit: string; completed: boolean; description: string; priority: string }> }) => {
      return await apiRequest(`/api/goals/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar meta",
        description: "Não foi possível atualizar a meta.",
        variant: "destructive",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/goals/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Meta removida",
        description: "Sua meta foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao remover meta",
        description: "Não foi possível remover a meta.",
        variant: "destructive",
      });
    },
  });

  // Mutations for exams
  const createExamMutation = useMutation({
    mutationFn: async (data: { name: string; examAt: Date; type: string; location?: string; description?: string; subjects?: string[]; durationMinutes?: number; importance?: string }) => {
      return await apiRequest("/api/exams", {
        method: "POST",
        body: {
          userId: user?.id,
          name: data.name,
          examAt: data.examAt,
          type: data.type,
          location: data.location || null,
          description: data.description || null,
          subjects: data.subjects || [],
          durationMinutes: data.durationMinutes || null,
          importance: data.importance || "media",
          status: "upcoming",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({
        title: "Prova criada",
        description: "Sua prova foi criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar prova",
        description: "Não foi possível criar a prova.",
        variant: "destructive",
      });
    },
  });

  const updateExamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<{ name: string; examAt: Date; type: string; location: string; description: string; status: string; subjects: string[]; durationMinutes: number; importance: string }> }) => {
      return await apiRequest(`/api/exams/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar prova",
        description: "Não foi possível atualizar a prova.",
        variant: "destructive",
      });
    },
  });

  const deleteExamMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/exams/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      toast({
        title: "Prova removida",
        description: "Sua prova foi removida com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao remover prova",
        description: "Não foi possível remover a prova.",
        variant: "destructive",
      });
    },
  });

  const [editingTarget, setEditingTarget] = useState(false);
  const [newTargetScore, setNewTargetScore] = useState(userProgress?.targetScore ?? 900);
  const [showAddScore, setShowAddScore] = useState(false);
  const [showScheduleEdit, setShowScheduleEdit] = useState(false);
  const [showFeaturesConfig, setShowFeaturesConfig] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showGoalsManagement, setShowGoalsManagement] = useState(false);
  const [showExamsManagement, setShowExamsManagement] = useState(false);
  const [animatingGoals, setAnimatingGoals] = useState<Set<number>>(new Set());
  const [showInitialTargetSetup, setShowInitialTargetSetup] = useState(false);
  const [initialTargetScore, setInitialTargetScore] = useState(900);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Update newTargetScore when userProgress changes
  useEffect(() => {
    if (userProgress?.targetScore !== undefined) {
      setNewTargetScore(userProgress.targetScore ?? 900);
    }
  }, [userProgress?.targetScore]);

  // Check if user should see onboarding tour
  useEffect(() => {
    if (user && !(user as any).hasCompletedOnboarding) {
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, [user]);
  
  // Map user exams from API to local state format with UUID mapping
  const exams = userExams?.map(exam => {
    const timeString = new Date(exam.examAt).toTimeString().slice(0, 5);
    return {
      id: parseInt(exam.id.slice(0, 8), 16), // Convert UUID to number for compatibility
      uuid: exam.id, // Keep the original UUID for API calls
      name: exam.name,
      date: new Date(exam.examAt).toISOString().split('T')[0],
      time: timeString === '00:00' ? '' : timeString,
      location: exam.location || '',
      type: exam.type,
      description: exam.description || ''
    };
  }) || [];
  
  const [newExam, setNewExam] = useState({ name: '', date: '', time: '', location: '', type: '', description: '' });
  
  // Map user goals from API to local state format with UUID mapping
  const goals = userGoals?.map(goal => ({
    id: parseInt(goal.id.slice(0, 8), 16), // Convert UUID to number for compatibility
    uuid: goal.id, // Keep the original UUID for API calls
    title: goal.title,
    target: goal.target,
    current: goal.current,
    unit: goal.unit,
    completed: goal.completed
  })) || [];
  
  const [newGoal, setNewGoal] = useState({ title: '', target: '', unit: '' });
  
  // Goals helper functions
  const toggleGoalCompletion = (goalId: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    // Trigger animation
    setAnimatingGoals(prev => new Set(Array.from(prev).concat([goalId])));
    
    // Update goal state in backend
    updateGoalMutation.mutate({
      id: goal.uuid,
      data: {
        completed: !goal.completed,
        current: !goal.completed ? goal.target : Math.max(0, goal.current - 1)
      }
    });
    
    // Clear animation after animation completes
    setTimeout(() => {
      setAnimatingGoals(prev => {
        const newArray = Array.from(prev).filter(id => id !== goalId);
        return new Set(newArray);
      });
    }, 2000);
  };
  
  const updateGoalProgress = (goalId: number, newCurrent: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    updateGoalMutation.mutate({
      id: goal.uuid,
      data: {
        current: Math.max(0, newCurrent),
        completed: newCurrent >= goal.target
      }
    });
  };
  
  const addNewGoal = () => {
    if (newGoal.title && newGoal.target && newGoal.unit) {
      createGoalMutation.mutate({
        title: newGoal.title,
        target: Number(newGoal.target),
        unit: newGoal.unit,
      });
      setNewGoal({ title: '', target: '', unit: '' });
    }
  };
  
  const removeGoal = (goalId: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    
    deleteGoalMutation.mutate(goal.uuid);
  };
  
  // Show incomplete tasks first, then completed ones
  const incompleteGoals = goals.filter(goal => !goal.completed);
  const completedGoals = goals.filter(goal => goal.completed);
  const displayedGoals = [...incompleteGoals.slice(0, 2), ...completedGoals].slice(0, 2);
  const allTasksCompleted = incompleteGoals.length === 0;
  const displayedExams = exams.slice(0, 3);
  
  // Exam helper functions
  const addNewExam = () => {
    if (newExam.name && newExam.date && newExam.type) {
      // Combine date and time into a Date object
      const dateTime = newExam.time && newExam.time.trim()
        ? new Date(`${newExam.date}T${newExam.time}:00`)
        : new Date(`${newExam.date}T00:00:00`);
      
      createExamMutation.mutate({
        name: newExam.name,
        examAt: dateTime,
        type: newExam.type,
        location: newExam.location || undefined,
        description: newExam.description || undefined,
      });
      setNewExam({ name: '', date: '', time: '', location: '', type: '', description: '' });
    }
  };
  
  const removeExam = (examId: number) => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;
    
    deleteExamMutation.mutate(exam.uuid);
  };
  
  const formatExamDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };
  
  // Calculate total weekly study hours
  const calculateWeeklyHours = () => {
    const totalMinutes = scheduleData.reduce((total, day) => {
      return total + (day.hours * 60) + day.minutes;
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  };
  
  // Available features
  const allFeatures = [
    { id: 'argumentos', name: 'Arquiteto de Argumentos', description: 'Construa argumentos sólidos', icon: MessageCircle, color: 'bright-blue' },
    { id: 'repertorio', name: 'Explorador de Repertório', description: 'Amplie seus conhecimentos', icon: Search, color: 'dark-blue' },
    { id: 'simulador', name: 'Simulador de Provas', description: 'Pratique redações', icon: GraduationCap, color: 'bright-blue' },
    { id: 'estilo', name: 'Controlador de Escrita', description: 'Ajuste o estilo de escrita', icon: Edit3, color: 'soft-gray' },
    { id: 'estrutura-curinga', name: 'Estrutura Coringa', description: 'Modelos de estrutura reutilizáveis', icon: Plus, color: 'bright-blue' }
  ];
  
  // Visible features state
  const [visibleFeatures, setVisibleFeatures] = useState(['argumentos', 'repertorio', 'simulador', 'estrutura-curinga']);
  
  // Fetch user schedule from database
  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  };

  const weekStart = getWeekStart();
  
  const { data: userScheduleData, isLoading: scheduleLoading } = useQuery<Array<{
    id: string;
    userId: string;
    day: string;
    activities: string[];
    hours: number;
    minutes: number;
    completed: boolean;
    weekStart: Date;
    createdAt: Date;
    updatedAt: Date;
  }>>({
    queryKey: ["/api/schedule", { weekStart: weekStart.toISOString() }],
    queryFn: async () => {
      const res = await fetch(`/api/schedule?weekStart=${weekStart.toISOString()}`);
      if (!res.ok) throw new Error('Failed to fetch schedule');
      return res.json();
    },
    enabled: !!user,
  });

  // Map database schedule to frontend format
  const dayMapping: { [key: string]: string } = {
    'segunda': 'SEG',
    'terca': 'TER',
    'quarta': 'QUA',
    'quinta': 'QUI',
    'sexta': 'SEX',
    'sabado': 'SAB',
    'domingo': 'DOM'
  };

  // Order for displaying days of the week
  const dayOrder = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];
  
  const scheduleData: ScheduleDay[] = userScheduleData && userScheduleData.length > 0
    ? userScheduleData.map(item => ({
        day: dayMapping[item.day] || item.day,
        activities: Array.isArray(item.activities) ? item.activities : [],
        hours: item.hours || 0,
        minutes: item.minutes || 0,
        completed: item.completed || false
      })).sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day))
    : [];

  const hasScheduleData = scheduleData.length > 0;
  
  const [editingSchedule, setEditingSchedule] = useState<ScheduleDay[]>([]);

  // Mutation to save schedule
  const saveScheduleMutation = useMutation({
    mutationFn: async (schedules: ScheduleDay[]) => {
      const weekStart = getWeekStart();
      const reverseDayMapping: { [key: string]: string } = {
        'SEG': 'segunda',
        'TER': 'terca',
        'QUA': 'quarta',
        'QUI': 'quinta',
        'SEX': 'sexta',
        'SAB': 'sabado',
        'DOM': 'domingo'
      };

      // Create/update each day's schedule
      const promises = schedules.map(schedule => 
        apiRequest("/api/schedule", {
          method: "POST",
          body: {
            day: reverseDayMapping[schedule.day],
            activities: schedule.activities.filter(activity => activity.trim() !== ''),
            hours: schedule.hours,
            minutes: schedule.minutes,
            completed: schedule.completed,
            weekStart: weekStart.toISOString()
          },
        })
      );

      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
      toast({
        title: "Cronograma atualizado! ✅",
        description: "Seu cronograma foi salvo com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar cronograma",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  // Mutation to toggle task completion without showing toast
  const toggleCompletionMutation = useMutation({
    mutationFn: async (schedules: ScheduleDay[]) => {
      const weekStart = getWeekStart();
      const reverseDayMapping: { [key: string]: string } = {
        'SEG': 'segunda',
        'TER': 'terca',
        'QUA': 'quarta',
        'QUI': 'quinta',
        'SEX': 'sexta',
        'SAB': 'sabado',
        'DOM': 'domingo'
      };

      const promises = schedules.map(schedule => 
        apiRequest("/api/schedule", {
          method: "POST",
          body: {
            day: reverseDayMapping[schedule.day],
            activities: schedule.activities.filter(activity => activity.trim() !== ''),
            hours: schedule.hours,
            minutes: schedule.minutes,
            completed: schedule.completed,
            weekStart: weekStart.toISOString()
          },
        })
      );

      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
  
  // Fetch newsletters from database
  const { data: newsletters = [], isLoading: newslettersLoading } = useQuery<Array<{
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    category: string;
    readTime: number | null;
    publishDate: Date | null;
    sentAt: Date | null;
    isNew: boolean;
    createdAt: Date;
  }>>({
    queryKey: ["/api/newsletter/feed"],
    enabled: !!user,
  });

  // Get the latest newsletter (most recent published or marked as new)
  const latestNewsletter = newsletters.find(n => n.isNew) || 
    [...newsletters].sort((a, b) => {
      const dateA = new Date(b.publishDate || b.sentAt || b.createdAt).getTime();
      const dateB = new Date(a.publishDate || a.sentAt || a.createdAt).getTime();
      return dateA - dateB;
    })[0];

  // Fetch user scores from database
  const { data: userScores = [], isLoading: scoresLoading } = useQuery<Array<{
    id: string;
    userId: string;
    score: number;
    competence1: number | null;
    competence2: number | null;
    competence3: number | null;
    competence4: number | null;
    competence5: number | null;
    examName: string;
    source: string;
    sourceId: string | null;
    scoreDate: Date;
    createdAt: Date;
    updatedAt: Date;
  }>>({
    queryKey: ["/api/user-scores"],
    enabled: !!user,
  });

  // Convert userScores to ScoreData format for the chart
  const scores: ScoreData[] = userScores.map(score => ({
    id: parseInt(score.id.substring(0, 8), 16), // Convert uuid to number for compatibility
    date: new Date(score.scoreDate).toISOString().split('T')[0],
    totalScore: score.score,
    competence1: score.competence1 ?? undefined,
    competence2: score.competence2 ?? undefined,
    competence3: score.competence3 ?? undefined,
    competence4: score.competence4 ?? undefined,
    competence5: score.competence5 ?? undefined,
    source: score.source as 'platform' | 'external',
    examName: score.examName,
  }));
  
  const [newScore, setNewScore] = useState({
    scoreDate: '',
    score: '',
    competence1: '',
    competence2: '',
    competence3: '',
    competence4: '',
    competence5: '',
    examName: ''
  });

  const [editingScore, setEditingScore] = useState<string | null>(null);

  // Mutation for adding new score
  const addScoreMutation = useMutation({
    mutationFn: async (data: typeof newScore) => {
      return await apiRequest("/api/user-scores", {
        method: "POST",
        body: {
          score: Number(data.score),
          competence1: data.competence1 ? Number(data.competence1) : null,
          competence2: data.competence2 ? Number(data.competence2) : null,
          competence3: data.competence3 ? Number(data.competence3) : null,
          competence4: data.competence4 ? Number(data.competence4) : null,
          competence5: data.competence5 ? Number(data.competence5) : null,
          examName: data.examName || 'Nota Manual',
          source: 'manual',
          scoreDate: new Date(data.scoreDate).toISOString(),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-competencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-progress"] });
      toast({
        title: "Nota adicionada! ✅",
        description: "Sua nota foi adicionada com sucesso.",
      });
      setNewScore({
        scoreDate: '',
        score: '',
        competence1: '',
        competence2: '',
        competence3: '',
        competence4: '',
        competence5: '',
        examName: ''
      });
      setShowAddScore(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar nota",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  // Mutation for updating a score
  const updateScoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof newScore }) => {
      return await apiRequest(`/api/user-scores/${id}`, {
        method: "PATCH",
        body: {
          score: Number(data.score),
          competence1: data.competence1 ? Number(data.competence1) : null,
          competence2: data.competence2 ? Number(data.competence2) : null,
          competence3: data.competence3 ? Number(data.competence3) : null,
          competence4: data.competence4 ? Number(data.competence4) : null,
          competence5: data.competence5 ? Number(data.competence5) : null,
          examName: data.examName || 'Nota Manual',
          scoreDate: new Date(data.scoreDate).toISOString(),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-competencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-progress"] });
      toast({
        title: "Nota atualizada! ✅",
        description: "Suas alterações foram salvas com sucesso.",
      });
      setEditingScore(null);
      setNewScore({
        scoreDate: '',
        score: '',
        competence1: '',
        competence2: '',
        competence3: '',
        competence4: '',
        competence5: '',
        examName: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar nota",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a score
  const deleteScoreMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/user-scores/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-competencies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-progress"] });
      toast({
        title: "Nota excluída",
        description: "A nota foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir nota",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  // Mutation for completing onboarding
  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/complete-onboarding", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setShowOnboarding(false);
      toast({
        title: "Bem-vindo ao DISSERTIA! 🎉",
        description: "Agora você está pronto para começar a usar todas as funcionalidades!",
      });
    },
  });

  const name = user?.name || "Usuário";
  
  // Filter scores based on selected period
  const filteredScoresForAverage = useMemo(() => {
    if (averagePeriod === 'all') return userScores;
    
    const now = new Date();
    const periodDays = {
      '7days': 7,
      '15days': 15,
      '1month': 30,
      '3months': 90,
      '6months': 180,
    }[averagePeriod];
    
    if (!periodDays) return userScores;
    
    const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    return userScores.filter(score => new Date(score.scoreDate) >= cutoffDate);
  }, [userScores, averagePeriod]);
  
  // Calculate average score from filtered scores
  const averageScore = filteredScoresForAverage.length > 0 
    ? Math.round(filteredScoresForAverage.reduce((sum, score) => sum + score.score, 0) / filteredScoresForAverage.length)
    : 0;
  
  const targetScore = userProgress?.targetScore;
  const essaysCount = userProgress?.essaysCount || 0;
  const studyHours = userProgress?.studyHours || 0;
  const streak = userProgress?.streak || 0;
  const progressPercentage = targetScore && targetScore > 0 ? Math.min(100, Math.round((averageScore / targetScore) * 100)) : 0;
  
  // Get next exam
  const upcomingExams = exams
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextExam = upcomingExams.length > 0 ? upcomingExams[0].name : null;

  const handleAddScore = () => {
    if (newScore.scoreDate && newScore.score) {
      // Verificar se pelo menos uma competência foi preenchida
      const hasCompetencies = newScore.competence1 || newScore.competence2 || newScore.competence3 || 
                              newScore.competence4 || newScore.competence5;
      
      if (hasCompetencies) {
        // Calcular soma das competências
        const comp1 = Number(newScore.competence1) || 0;
        const comp2 = Number(newScore.competence2) || 0;
        const comp3 = Number(newScore.competence3) || 0;
        const comp4 = Number(newScore.competence4) || 0;
        const comp5 = Number(newScore.competence5) || 0;
        const totalCompetencies = comp1 + comp2 + comp3 + comp4 + comp5;
        const totalScore = Number(newScore.score);
        
        // Verificar se a soma das competências bate com a nota total
        if (totalCompetencies !== totalScore) {
          toast({
            title: "Erro na pontuação",
            description: `A soma das competências (${totalCompetencies}) não corresponde à nota total (${totalScore}). Por favor, corrija os valores.`,
            variant: "destructive",
          });
          return;
        }
      }
      
      if (editingScore) {
        updateScoreMutation.mutate({ id: editingScore, data: newScore });
      } else {
        addScoreMutation.mutate(newScore);
      }
    }
  };

  const handleEditScore = (score: typeof userScores[0]) => {
    setEditingScore(score.id);
    setNewScore({
      scoreDate: new Date(score.scoreDate).toISOString().split('T')[0],
      score: score.score.toString(),
      competence1: score.competence1?.toString() || '',
      competence2: score.competence2?.toString() || '',
      competence3: score.competence3?.toString() || '',
      competence4: score.competence4?.toString() || '',
      competence5: score.competence5?.toString() || '',
      examName: score.examName
    });
  };

  const handleDeleteScore = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta nota?')) {
      deleteScoreMutation.mutate(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingScore(null);
    setNewScore({
      scoreDate: '',
      score: '',
      competence1: '',
      competence2: '',
      competence3: '',
      competence4: '',
      competence5: '',
      examName: ''
    });
  };

  // Filter scores by selected period
  const filteredScores = useMemo(() => {
    const now = new Date();
    const periodDays = {
      '7-days': 7,
      '30-days': 30,
      '6-months': 180,
    }[scorePeriod];
    
    if (!periodDays) return scores;
    
    const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    return scores.filter(score => new Date(score.date) >= cutoffDate);
  }, [scores, scorePeriod]);

  const chartData = filteredScores
    .map(score => ({
      date: score.date.split('-').reverse().join('/').slice(0, 5), // DD/MM format
      nota: score.totalScore,
      nome: score.examName,
      fullDate: score.date // Keep original date for sorting
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
    .map(({ date, nota, nome }) => ({ date, nota, nome })); // Remove fullDate from final data

  // Calculate dynamic Y-axis domain based on filtered score values
  const calculateYAxisDomain = () => {
    if (filteredScores.length === 0) return [0, 1000];
    
    const scoreValues = filteredScores.map(s => s.totalScore);
    const minScore = Math.min(...scoreValues);
    const maxScore = Math.max(...scoreValues);
    
    // Add padding and round to nearest 50
    const padding = 100;
    const yMin = Math.max(0, Math.floor((minScore - padding) / 50) * 50);
    const yMax = Math.min(1000, Math.ceil((maxScore + padding) / 50) * 50);
    
    // Ensure minimum range of 200 points for better visualization
    const range = yMax - yMin;
    if (range < 200) {
      const center = (yMin + yMax) / 2;
      return [
        Math.max(0, Math.floor((center - 100) / 50) * 50),
        Math.min(1000, Math.ceil((center + 100) / 50) * 50)
      ];
    }
    
    return [yMin, yMax];
  };

  const yAxisDomain = calculateYAxisDomain();

  const handleLogout = () => {
    // In a real app, this would clear authentication tokens/session
    // For demo purposes, just redirect to landing page
    setLocation("/");
  };

  const handleQuickAccess = (tool: string) => {
    console.log(`Acessando ferramenta: ${tool}`);
    // Navigate to the specific tool page
    switch(tool) {
      case 'argumentos':
        setLocation('/argumentos');
        break;
      case 'repertorio':
        setLocation('/repertorio?from=dashboard');
        break;
      case 'simulador':
        setLocation('/simulador?from=dashboard');
        break;
      case 'estilo':
        setLocation('/controlador-escrita?from=dashboard');
        break;
      case 'estrutura-curinga':
        setLocation('/estrutura-curinga?from=dashboard');
        break;
    }
  };


  const handleSuggestedAction = (action: string) => {
    console.log(`Executando ação: ${action}`);
    // Navigate to the specific action
    switch(action) {
      case 'argumentacao':
        setLocation('/argumentos');
        break;
      case 'repertorio':
        setLocation('/repertorio?from=dashboard');
        break;
    }
  };

  const handleScheduleEdit = () => {
    if (hasScheduleData) {
      setEditingSchedule([...scheduleData]);
    } else {
      // Initialize with default empty schedule
      setEditingSchedule([
        { day: 'SEG', activities: [], hours: 0, minutes: 0, completed: false },
        { day: 'TER', activities: [], hours: 0, minutes: 0, completed: false },
        { day: 'QUA', activities: [], hours: 0, minutes: 0, completed: false },
        { day: 'QUI', activities: [], hours: 0, minutes: 0, completed: false },
        { day: 'SEX', activities: [], hours: 0, minutes: 0, completed: false },
        { day: 'SAB', activities: [], hours: 0, minutes: 0, completed: false },
        { day: 'DOM', activities: [], hours: 0, minutes: 0, completed: false }
      ]);
    }
    setShowScheduleEdit(true);
  };

  const handleSaveSchedule = () => {
    saveScheduleMutation.mutate(editingSchedule);
    setShowScheduleEdit(false);
  };

  const handleCancelScheduleEdit = () => {
    setEditingSchedule([]);
    setShowScheduleEdit(false);
  };

  const updateScheduleDay = (index: number, field: 'activities' | 'hours' | 'minutes', value: string | string[] | number) => {
    const updated = [...editingSchedule];
    if (field === 'activities' && typeof value === 'string') {
      // Parse activities from textarea (one per line) - keep empty lines during editing
      updated[index].activities = value.split('\n');
    } else if (field === 'hours' && typeof value === 'string') {
      updated[index].hours = parseInt(value) || 0;
    } else if (field === 'minutes' && typeof value === 'string') {
      updated[index].minutes = parseInt(value) || 0;
    }
    setEditingSchedule(updated);
  };

  const toggleScheduleCompletion = (index: number) => {
    const updated = [...scheduleData];
    updated[index].completed = !updated[index].completed;
    toggleCompletionMutation.mutate(updated);
  };

  const formatTime = (hours: number, minutes: number) => {
    if (hours === 0 && minutes === 0) return '-';
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  };

  const handleFeaturesConfig = () => {
    setShowFeaturesConfig(true);
  };

  const handleSaveFeaturesConfig = () => {
    setShowFeaturesConfig(false);
  };

  const toggleFeatureVisibility = (featureId: string) => {
    setVisibleFeatures(prev => {
      if (prev.includes(featureId)) {
        // Can't remove if already at minimum (2)
        if (prev.length <= 2) return prev;
        return prev.filter(id => id !== featureId);
      } else {
        // Can't add if already at maximum (4)
        if (prev.length >= 4) return prev;
        return [...prev, featureId];
      }
    });
  };

  const getVisibleFeaturesData = () => {
    return allFeatures.filter(feature => visibleFeatures.includes(feature.id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="max-w-[95%] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-1" data-testid="link-dashboard-logo">
              <div className="w-8 h-8 bg-bright-blue rounded-lg flex items-center justify-center">
                <Sparkles className="text-white text-sm" />
              </div>
              <span className="text-3xl font-bold font-playfair" style={{color: '#5087ff'}}>
                DISSERT<span style={{color: '#6b7280'}}>IA</span>
              </span>
            </Link>
            
            {/* Desktop Navigation Menu */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20 hover:bg-bright-blue/20 transition-all duration-200" data-testid="button-nav-home">
                <Home size={14} />
                <span className="font-medium">Home</span>
              </Link>
              <Link href="/functionalities" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-functionalities">
                <Plus size={14} />
                <span className="font-medium">Funcionalidades</span>
              </Link>
              <Link href="/newsletter" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-newsletter">
                <Book size={14} />
                <span className="font-medium">Newsletter</span>
              </Link>
              <Link href="/settings" className="flex items-center space-x-2 px-3 py-2 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200" data-testid="button-nav-settings">
                <Settings size={14} />
                <span className="font-medium">Configurações</span>
              </Link>
            </div>
            
            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center space-x-8">
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2 text-soft-gray hover:text-bright-blue border-soft-gray/30 hover:border-bright-blue"
                data-testid="button-logout"
              >
                <LogOut size={12} />
                <span>Sair</span>
              </Button>
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user">
                {getInitials(name)}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-3">
              <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center text-white text-sm font-bold" data-testid="avatar-user-mobile">
                {getInitials(name)}
              </div>
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="outline"
                className="p-2 border-soft-gray/30 hover:border-bright-blue text-soft-gray hover:text-bright-blue"
                data-testid="button-mobile-menu"
              >
                <Menu size={12} />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 py-4 border-t border-gray-200">
              <div className="space-y-2">
                <Link 
                  href="/dashboard" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-bright-blue bg-bright-blue/10 border border-bright-blue/20"
                  data-testid="button-mobile-nav-home"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Home size={12} />
                  <span className="font-medium">Home</span>
                </Link>
                <Link 
                  href="/functionalities" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-functionalities"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Plus size={10} />
                  <span className="font-medium">Funcionalidades</span>
                </Link>
                <Link 
                  href="/newsletter" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-newsletter"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Book size={12} />
                  <span className="font-medium">Newsletter</span>
                </Link>
                <Link 
                  href="/settings" 
                  className="flex items-center space-x-3 px-3 py-3 rounded-lg text-soft-gray hover:text-bright-blue hover:bg-bright-blue/10 transition-all duration-200"
                  data-testid="button-mobile-nav-settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={12} />
                  <span className="font-medium">Configurações</span>
                </Link>
                <div className="pt-3 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="flex items-center space-x-3 w-full text-soft-gray hover:text-bright-blue border-soft-gray/30 hover:border-bright-blue"
                    data-testid="button-mobile-logout"
                  >
                    <LogOut size={12} />
                    <span>Sair</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Dashboard Content */}
      <div className="max-w-[95%] mx-auto px-2 md:px-4 py-4 md:py-6 pt-16 md:pt-20 space-y-3 md:space-y-5">
        
        {/* First Row: All Exams + Activity Stats + Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" style={{ gridAutoRows: 'minmax(400px, auto)' }}>
          {/* Welcome + Quick Exam Info Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-welcome-exams">
            <div className="flex items-center mb-2 md:mb-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                <Calendar className="text-white" size={14} />
              </div>
              <h3 className="text-base md:text-lg font-semibold text-dark-blue">Olá, {name.split(' ')[0]}! 👋</h3>
            </div>
            <p className="text-xs md:text-sm text-soft-gray mb-3 md:mb-4">Continue refinando sua escrita.</p>
            
            {/* Próximas Provas Resumo */}
            <div className="space-y-1 md:space-y-2">
              <div className="text-xs font-medium text-dark-blue mb-1 md:mb-2">Próximas Provas:</div>
              {examsLoading ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="animate-pulse text-center">
                    <div className="w-12 h-12 bg-bright-blue/20 rounded-full mx-auto mb-2"></div>
                    <p className="text-xs text-soft-gray">Carregando...</p>
                  </div>
                </div>
              ) : exams.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-bright-blue/20 to-dark-blue/20 rounded-full flex items-center justify-center mx-auto">
                      <Calendar className="text-bright-blue" size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-blue mb-1">Nenhuma prova cadastrada</p>
                      <p className="text-xs text-soft-gray">Adicione suas próximas provas para organizar seus estudos</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {displayedExams.map((exam, index) => (
                    <div key={exam.id} className={`flex items-center justify-between p-1.5 md:p-2 rounded border ${
                      index % 3 === 0 
                        ? 'bg-gradient-to-r from-soft-gray/10 to-bright-blue/10 border-soft-gray/20'
                        : index % 3 === 1
                          ? 'bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 border-bright-blue/20'
                          : 'bg-gradient-to-r from-dark-blue/10 to-soft-gray/10 border-dark-blue/20'
                    }`}>
                      <span className="text-xs text-dark-blue font-medium">{exam.name}</span>
                      <span className="text-xs text-bright-blue">
                        {formatExamDate(exam.date)}
                      </span>
                    </div>
                  ))}
                  {exams.length > 3 && (
                    <div className="text-center py-1">
                      <span className="text-xs text-soft-gray">+{exams.length - 3} provas adicionais</span>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <Button 
              onClick={() => setShowExamsManagement(true)}
              variant="outline" 
              size="sm" 
              className="w-full mt-2 md:mt-3 text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10 text-xs md:text-sm h-8 md:h-10"
              data-testid="button-manage-exams"
            >
              <Edit3 size={8} className="mr-1 md:mr-2" />
              Gerenciar Provas
            </Button>
          </LiquidGlassCard>

          {/* Goals Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20 h-full" data-testid="card-goals">
            <div className="flex items-center mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                <Target className="text-white" size={14} />
              </div>
              <h4 className="text-sm md:text-base font-semibold text-dark-blue">Metas da Semana</h4>
            </div>
            <div className="space-y-3">
              {goalsLoading ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="animate-pulse text-center">
                    <div className="w-12 h-12 bg-bright-blue/20 rounded-full mx-auto mb-2"></div>
                    <p className="text-xs text-soft-gray">Carregando...</p>
                  </div>
                </div>
              ) : goals.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-bright-blue/20 to-dark-blue/20 rounded-full flex items-center justify-center mx-auto">
                      <Target className="text-bright-blue" size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-blue mb-1">Nenhuma meta definida</p>
                      <p className="text-xs text-soft-gray">Defina suas metas semanais para acompanhar seu progresso</p>
                    </div>
                  </div>
                </div>
              ) : allTasksCompleted ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-green-700 mb-2">🎉 Parabéns!</h3>
                  <p className="text-sm text-green-600">Todas as suas metas da semana foram concluídas!</p>
                </div>
              ) : (
                <>
                  {displayedGoals.map((goal) => (
                    <div key={goal.id} className={`flex items-center p-3 rounded-lg border transition-all duration-1000 ${
                      goal.completed 
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
                        : 'bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 border-bright-blue/20'
                    } ${
                      animatingGoals.has(goal.id) 
                        ? 'transform scale-105 shadow-2xl shadow-green-200/70 ring-4 ring-green-300/50 bg-gradient-to-r from-green-100 to-green-200 border-green-300' 
                        : ''
                    }`}>
                      <button
                        onClick={() => toggleGoalCompletion(goal.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 border-2 transition-all duration-700 hover:scale-110 ${
                          goal.completed 
                            ? 'bg-green-500 border-green-500 shadow-lg shadow-green-300/50' 
                            : 'bg-white border-bright-blue hover:bg-bright-blue/10'
                        } ${
                          animatingGoals.has(goal.id) 
                            ? 'animate-pulse scale-150 bg-gradient-to-r from-green-400 to-green-600 shadow-2xl shadow-green-400/80 ring-4 ring-green-300/60 animate-[pulse_1s_ease-in-out_infinite]' 
                            : ''
                        }`}
                        data-testid={`button-toggle-goal-${goal.id}`}
                      >
                        {goal.completed && (
                          <CheckCircle2 
                            className={`text-white transition-all duration-500 ${animatingGoals.has(goal.id) ? 'animate-spin scale-110' : ''}`} 
                            size={14} 
                          />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${goal.completed ? 'text-green-700 line-through' : 'text-dark-blue'}`}>
                          {goal.title}
                        </div>
                        <div className={`text-xs ${goal.completed ? 'text-green-600' : 'text-soft-gray'}`}>
                          {goal.current}/{goal.target} concluídas
                        </div>
                      </div>
                    </div>
                  ))}
                  {incompleteGoals.length > 2 && (
                    <div className="text-center py-2">
                      <span className="text-xs text-soft-gray">+{incompleteGoals.length - 2} metas pendentes</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-3 text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
              onClick={() => setShowGoalsManagement(true)}
              data-testid="button-manage-goals"
            >
              <Edit3 size={10} className="mr-2" />
              Gerenciar Metas
            </Button>
          </LiquidGlassCard>

          {/* Improvement Points - Taking 2 columns */}
          <div className="lg:col-span-2 h-full">
            <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-soft-gray/5 border-bright-blue/20 h-full min-h-[380px] flex flex-col" data-testid="card-improvement-points">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                    <TrendingUp className="text-white" size={14} />
                  </div>
                  <h4 className="text-xs md:text-sm font-semibold text-dark-blue">Pontos por Competência</h4>
                </div>
                <Select value={competencyPeriod} onValueChange={setCompetencyPeriod} data-testid="select-competency-period">
                  <SelectTrigger className="w-32 h-8 text-xs border-bright-blue/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="3months">3 meses</SelectItem>
                    <SelectItem value="1month">1 mês</SelectItem>
                    <SelectItem value="15days">15 dias</SelectItem>
                    <SelectItem value="last">Última</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Competências em linhas horizontais */}
              <div className="flex-1 flex flex-col">
                {!userCompetencies ? (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <div className="animate-pulse text-center">
                      <div className="w-12 h-12 bg-bright-blue/20 rounded-full mx-auto mb-2"></div>
                      <p className="text-xs text-soft-gray">Carregando...</p>
                    </div>
                  </div>
                ) : !userCompetencies.hasData ? (
                  <div className="flex-1 flex items-center justify-center py-8">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-bright-blue/20 to-dark-blue/20 rounded-full flex items-center justify-center mx-auto">
                        <TrendingUp className="text-bright-blue" size={32} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-dark-blue mb-1">Nenhuma redação corrigida ainda</p>
                        <p className="text-xs text-soft-gray">Faça simulações para ver sua análise de competências aqui</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const competencyNames = [
                        "Norma Culta",
                        "Compreensão",
                        "Argumentação",
                        "Coesão",
                        "Proposta"
                      ];
                      
                      const competencyFeedback = [
                        "Concordância e regência",
                        "Interpretação textual",
                        "Diversificar argumentos",
                        "Conectivos e coesão",
                        "Intervenção detalhada"
                      ];

                      const allCompetencies = [
                        { id: 1, name: competencyNames[0], score: Math.round(userCompetencies.averages.competence1), feedback: competencyFeedback[0] },
                        { id: 2, name: competencyNames[1], score: Math.round(userCompetencies.averages.competence2), feedback: competencyFeedback[1] },
                        { id: 3, name: competencyNames[2], score: Math.round(userCompetencies.averages.competence3), feedback: competencyFeedback[2] },
                        { id: 4, name: competencyNames[3], score: Math.round(userCompetencies.averages.competence4), feedback: competencyFeedback[3] },
                        { id: 5, name: competencyNames[4], score: Math.round(userCompetencies.averages.competence5), feedback: competencyFeedback[4] },
                      ];

                      return allCompetencies.map((comp) => {
                        let colors;
                        let IconComponent = null;
                        
                        if (comp.score === 200) {
                          colors = { 
                            bg: 'from-green-50 to-green-100', 
                            border: 'border-green-200', 
                            badge: 'bg-green-500', 
                            text: 'text-green-600', 
                            badgeBg: 'bg-green-100', 
                            icon: 'text-green-500'
                          };
                          IconComponent = Check;
                        } else if (comp.score < 80) {
                          colors = { 
                            bg: 'from-red-50 to-red-100', 
                            border: 'border-red-200', 
                            badge: 'bg-red-500', 
                            text: 'text-red-600', 
                            badgeBg: 'bg-red-100', 
                            icon: 'text-red-500'
                          };
                          IconComponent = X;
                        } else if (comp.score < 160) {
                          colors = { 
                            bg: 'from-yellow-50 to-yellow-100', 
                            border: 'border-yellow-200', 
                            badge: 'bg-yellow-500', 
                            text: 'text-yellow-600', 
                            badgeBg: 'bg-yellow-100', 
                            icon: 'text-yellow-500'
                          };
                          IconComponent = AlertTriangle;
                        } else {
                          colors = { 
                            bg: 'from-gray-50 to-gray-100', 
                            border: 'border-gray-200', 
                            badge: 'bg-gray-500', 
                            text: 'text-gray-600', 
                            badgeBg: 'bg-gray-100', 
                            icon: 'text-gray-500'
                          };
                          IconComponent = null;
                        }
                        
                        return (
                          <div key={comp.id} className={`flex items-center justify-between p-2.5 md:p-3 bg-gradient-to-r ${colors.bg} rounded-lg border ${colors.border}`}>
                            <div className="flex items-center space-x-2 md:space-x-3">
                              <div className={`w-5 h-5 md:w-6 md:h-6 ${colors.badge} rounded-full flex items-center justify-center`}>
                                <span className="text-white text-xs md:text-sm font-bold">{comp.id}</span>
                              </div>
                              <span className="text-xs md:text-sm font-medium text-dark-blue">{comp.name}</span>
                              <span className={`text-xs md:text-sm ${colors.text} ${colors.badgeBg} px-2 md:px-2.5 py-1 md:py-1 rounded`}>{comp.score}/200</span>
                            </div>
                            <div className="flex items-center space-x-2 md:space-x-3">
                              <span className="text-xs md:text-sm text-soft-gray hidden sm:inline">{comp.feedback}</span>
                              {IconComponent && <IconComponent className={colors.icon} size={16} />}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
              
              {/* Summary em linha */}
              {userCompetencies?.hasData && (() => {
                const competencyNames = [
                  "Norma Culta",
                  "Compreensão",
                  "Argumentação",
                  "Coesão",
                  "Proposta"
                ];
                
                const allCompetencies = [
                  { id: 1, name: competencyNames[0], score: Math.round(userCompetencies.averages.competence1) },
                  { id: 2, name: competencyNames[1], score: Math.round(userCompetencies.averages.competence2) },
                  { id: 3, name: competencyNames[2], score: Math.round(userCompetencies.averages.competence3) },
                  { id: 4, name: competencyNames[3], score: Math.round(userCompetencies.averages.competence4) },
                  { id: 5, name: competencyNames[4], score: Math.round(userCompetencies.averages.competence5) },
                ];

                // Check if all competencies are perfect (200)
                const allPerfect = allCompetencies.every(comp => comp.score === 200);
                
                // Get all red competencies (score < 80)
                const redCompetencies = allCompetencies.filter(comp => comp.score < 80);
                
                // Get the lowest score
                const lowestScore = Math.min(...allCompetencies.map(comp => comp.score));
                
                // Get all competencies with the lowest score
                const lowestCompetencies = allCompetencies.filter(comp => comp.score === lowestScore);

                if (allPerfect) {
                  return (
                    <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded border border-green-200">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <Check className="text-white" size={12} />
                        </div>
                        <span className="text-xs font-medium text-green-700">
                          Excelente! Todas as competências em 200. Mantenha esse padrão!
                        </span>
                      </div>
                    </div>
                  );
                } else if (redCompetencies.length > 0) {
                  return (
                    <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-red-100 rounded border border-red-200">
                      <div className="flex items-center flex-wrap gap-2">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="text-white" size={12} />
                        </div>
                        <span className="text-xs font-medium text-red-700">Foco:</span>
                        {redCompetencies.map((comp, index) => (
                          <div key={comp.id} className="flex items-center gap-1">
                            <span className="text-xs font-medium text-red-700">{comp.name}</span>
                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{comp.id}</span>
                            </div>
                            {index < redCompetencies.length - 1 && <span className="text-xs text-red-700">,</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="mt-3 p-3 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded border border-bright-blue/20">
                      <div className="flex items-center flex-wrap gap-2">
                        <div className="w-6 h-6 bg-bright-blue rounded-full flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="text-white" size={12} />
                        </div>
                        <span className="text-xs font-medium text-dark-blue">Foco:</span>
                        {lowestCompetencies.map((comp, index) => (
                          <div key={comp.id} className="flex items-center gap-1">
                            <span className="text-xs font-medium text-dark-blue">{comp.name}</span>
                            <div className="w-4 h-4 bg-bright-blue rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{comp.id}</span>
                            </div>
                            {index < lowestCompetencies.length - 1 && <span className="text-xs text-dark-blue">,</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              })()}
            </LiquidGlassCard>
          </div>
        </div>

        {/* Second Row: Progress + Evolution Chart + Simulator Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {/* Progress Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/10 border-bright-blue/20" data-testid="card-progress">
            <div className="flex items-center mb-3 md:mb-4">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                <TrendingUp className="text-white" size={14} />
              </div>
              <h4 className="text-sm md:text-base font-semibold text-dark-blue">Progresso Geral</h4>
            </div>
            
            {targetScore === null ? (
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-bright-blue/20 to-dark-blue/20 rounded-full flex items-center justify-center mx-auto">
                    <Target className="text-bright-blue" size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark-blue mb-1">Nenhuma meta definida</p>
                    <p className="text-xs text-soft-gray">Defina sua meta de pontuação para acompanhar seu progresso</p>
                  </div>
                  <Button 
                    onClick={() => setShowInitialTargetSetup(true)}
                    variant="outline" 
                    size="sm" 
                    className="mt-2 text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10 text-xs"
                    data-testid="button-define-target"
                  >
                    <Target size={12} className="mr-2" />
                    Definir Meta
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {editingTarget ? (
                    <div className="bg-white/50 rounded-xl p-3 md:p-4 border border-bright-blue/20">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-soft-gray whitespace-nowrap">Nova meta:</span>
                          <input
                            type="number"
                            value={newTargetScore}
                            onChange={(e) => setNewTargetScore(Number(e.target.value))}
                            className="flex-1 max-w-[100px] px-3 py-2 text-base font-semibold text-dark-blue border border-bright-blue/30 rounded-lg focus:outline-none focus:border-bright-blue focus:ring-2 focus:ring-bright-blue/20"
                            data-testid="input-target-score"
                            min="0"
                            max="1000"
                            placeholder="900"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              updateProgressMutation.mutate({ targetScore: newTargetScore });
                              setEditingTarget(false);
                            }}
                            className="flex-1 bg-bright-blue text-white hover:bg-bright-blue/90"
                            data-testid="button-save-target"
                            disabled={updateProgressMutation.isPending}
                          >
                            {updateProgressMutation.isPending ? "Salvando..." : "Salvar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setNewTargetScore(targetScore ?? 900);
                              setEditingTarget(false);
                            }}
                            className="flex-1 border-soft-gray/30"
                            data-testid="button-cancel-target"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Nota Média Section */}
                      <div className="bg-white/50 rounded-xl p-4 md:p-5 border border-bright-blue/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-soft-gray">Nota Média</span>
                            <Select value={averagePeriod} onValueChange={setAveragePeriod} data-testid="select-average-period">
                              <SelectTrigger className="w-28 h-7 text-xs border-bright-blue/30">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                <SelectItem value="7days">7 dias</SelectItem>
                                <SelectItem value="15days">15 dias</SelectItem>
                                <SelectItem value="1month">1 mês</SelectItem>
                                <SelectItem value="3months">3 meses</SelectItem>
                                <SelectItem value="6months">6 meses</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <span className="text-2xl md:text-3xl font-bold text-dark-blue" data-testid="text-average-score">{averageScore}</span>
                        </div>
                        <div className="relative h-3 md:h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="absolute h-full bg-gradient-to-r from-bright-blue to-dark-blue rounded-full transition-all duration-500"
                            style={{width: `${progressPercentage}%`}}
                          />
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-sm text-soft-gray">Meta: {targetScore}</span>
                          <span className="text-sm text-bright-blue font-semibold" data-testid="text-points-to-goal">
                            {targetScore && targetScore > averageScore ? `Faltam ${targetScore - averageScore} pts` : '✓ Atingida'}
                          </span>
                        </div>
                      </div>

                      {/* Última Nota Section */}
                      {userScores.length > 0 && (() => {
                        const mostRecentScore = [...userScores].sort((a, b) => 
                          new Date(b.scoreDate).getTime() - new Date(a.scoreDate).getTime()
                        )[0];
                        const recentScore = mostRecentScore.score;
                        const recentPercentage = targetScore ? Math.min((recentScore / targetScore) * 100, 100) : 0;
                        
                        return (
                          <div className="bg-white/50 rounded-xl p-4 md:p-5 border border-dark-blue/20">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-soft-gray">Última Nota</span>
                              <span className="text-2xl md:text-3xl font-bold text-dark-blue" data-testid="text-recent-score">{recentScore}</span>
                            </div>
                            <div className="relative h-3 md:h-4 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="absolute h-full bg-gradient-to-r from-dark-blue to-bright-blue rounded-full transition-all duration-500"
                                style={{width: `${recentPercentage}%`}}
                              />
                            </div>
                            <div className="flex justify-between mt-2">
                              <span className="text-sm text-soft-gray">Meta: {targetScore}</span>
                              <span className="text-sm text-dark-blue font-semibold" data-testid="text-points-to-goal-recent">
                                {targetScore && targetScore > recentScore ? `Faltam ${targetScore - recentScore} pts` : '✓ Atingida'}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Edit Target Button */}
                      {targetScore !== null && (
                        <div className="flex justify-center mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTarget(true)}
                            className="text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10"
                            data-testid="button-edit-target"
                          >
                            <Edit3 size={14} className="mr-2" />
                            Editar Meta
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </LiquidGlassCard>

          {/* Evolution Chart */}
          <LiquidGlassCard className="bg-gradient-to-br from-dark-blue/5 to-bright-blue/5 border-dark-blue/20" data-testid="card-evolution-chart">
            <div className="flex items-center mb-4 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-dark-blue to-bright-blue rounded-full flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                <TrendingUp className="text-white" size={14} />
              </div>
              <h4 className="text-sm md:text-base font-semibold text-dark-blue">Evolução das Notas</h4>
            </div>
            <div className="relative h-56 md:h-72 bg-white rounded-2xl border-2 border-bright-blue/20 p-3 md:p-6 shadow-lg overflow-visible" style={{ zIndex: 50 }} data-testid="chart-evolution">
              {scoresLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-pulse text-center">
                    <div className="w-12 h-12 bg-bright-blue/20 rounded-full mx-auto mb-2"></div>
                    <p className="text-xs text-soft-gray">Carregando...</p>
                  </div>
                </div>
              ) : scores.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-dark-blue/20 to-bright-blue/20 rounded-full flex items-center justify-center mx-auto">
                      <TrendingUp className="text-bright-blue" size={32} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-blue mb-1">Nenhuma nota cadastrada</p>
                      <p className="text-xs text-soft-gray">Adicione suas notas para acompanhar sua evolução</p>
                    </div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="30%" stopColor="#3b82f6" />
                      <stop offset="70%" stopColor="#5087ff" />
                      <stop offset="100%" stopColor="#09072e" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#5087ff" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#5087ff" stopOpacity={0.02}/>
                    </linearGradient>
                    <filter id="dropShadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#5087ff" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="1 3" 
                    stroke="#e5e7eb" 
                    strokeWidth={1}
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                    tick={{ dy: 8, fill: '#374151' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={11}
                    fontWeight={600}
                    domain={yAxisDomain}
                    tickLine={false}
                    axisLine={false}
                    tick={{ dx: -5, fill: '#374151' }}
                    tickFormatter={(value) => `${value}`}
                    width={50}
                    tickCount={6}
                  />
                  <Tooltip 
                    wrapperStyle={{ zIndex: 999999 }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                      border: '2px solid #5087ff',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      boxShadow: '0 20px 40px rgba(80, 135, 255, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px',
                      maxWidth: '200px',
                      wordWrap: 'break-word',
                      whiteSpace: 'normal'
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} pts`, 
                      props.payload.nome || 'Nota'
                    ]}
                    labelStyle={{ 
                      color: '#09072e', 
                      fontWeight: '700',
                      marginBottom: '2px',
                      borderBottom: '1px solid #e5e7eb',
                      paddingBottom: '2px',
                      fontSize: '11px',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="nota" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={5}
                    fill="url(#areaGradient)"
                    fillOpacity={1}
                    dot={{ 
                      fill: '#ffffff', 
                      stroke: '#5087ff', 
                      strokeWidth: 4, 
                      r: 8,
                      filter: 'url(#dropShadow)'
                    }}
                    activeDot={{ 
                      r: 12, 
                      stroke: '#ffffff', 
                      strokeWidth: 4,
                      fill: '#5087ff',
                      filter: 'url(#dropShadow)'
                    }}
                    connectNulls={false}
                  />
                </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            
            {/* Bottom Actions Row */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <Select value={scorePeriod} onValueChange={setScorePeriod} data-testid="select-chart-period">
                <SelectTrigger className="w-40 border-bright-blue/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7-days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30-days">Últimos 30 dias</SelectItem>
                  <SelectItem value="6-months">Últimos 6 meses</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={showAddScore} onOpenChange={setShowAddScore}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                    data-testid="button-add-score"
                  >
                    {userScores.length > 0 ? 'Gerenciar Notas' : 'Adicionar Nota'}
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </LiquidGlassCard>

          {/* Simulator Time Card */}
          <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20 py-2 px-6" data-testid="card-simulator-time">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                  <Clock className="text-white" size={14} />
                </div>
                <h4 className="text-sm md:text-base font-semibold text-dark-blue">Tempo Médio no Simulador</h4>
              </div>
              <Select value={simulatorPeriod} onValueChange={setSimulatorPeriod} data-testid="select-simulator-period">
                <SelectTrigger className="w-32 h-8 text-xs border-bright-blue/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="7days">7 dias</SelectItem>
                  <SelectItem value="15days">15 dias</SelectItem>
                  <SelectItem value="1month">1 mês</SelectItem>
                  <SelectItem value="3months">3 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {simulationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-center">
                  <div className="w-12 h-12 bg-bright-blue/20 rounded-full mx-auto mb-2"></div>
                  <p className="text-xs text-soft-gray">Carregando...</p>
                </div>
              </div>
            ) : !hasSimulationTimeData ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-soft-gray/20 to-bright-blue/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="text-bright-blue" size={32} />
                </div>
                <p className="text-sm font-medium text-dark-blue mb-1">Nenhuma simulação completa ainda</p>
                <p className="text-xs text-soft-gray">Faça simulações para ver seu tempo médio aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Total Time */}
                <div className="text-center p-3 bg-gradient-to-br from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                  <div className="text-2xl font-bold text-bright-blue mb-1" data-testid="text-total-time">
                    {formatTime(Math.floor(averageSimulationTimeMinutes / 60), averageSimulationTimeMinutes % 60)}
                  </div>
                  <div className="text-xs text-soft-gray font-medium">Tempo Médio Total</div>
                </div>

                {/* Breakdown by checkpoints */}
                {hasBreakdownData && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-dark-blue text-center mb-2">Média por Etapa</div>
                    
                    {/* Brainstorm */}
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <span className="text-xs font-medium text-dark-blue dark:text-white">💭 Brainstorm</span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400" data-testid="text-avg-brainstorm">
                        {averageBreakdown.brainstorm} min
                      </span>
                    </div>

                    {/* Rascunho */}
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <span className="text-xs font-medium text-dark-blue dark:text-white">✏️ Rascunho</span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400" data-testid="text-avg-rascunho">
                        {averageBreakdown.rascunho} min
                      </span>
                    </div>

                    {/* Passa a Limpo */}
                    <div className="flex items-center justify-between p-2 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700">
                      <span className="text-xs font-medium text-dark-blue dark:text-white">📝 Passa a Limpo</span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400" data-testid="text-avg-passalimpo">
                        {averageBreakdown.passaLimpo} min
                      </span>
                    </div>
                  </div>
                )}

                <div className="text-center p-2 bg-gradient-to-r from-soft-gray/5 to-bright-blue/5 rounded border border-bright-blue/10">
                  <p className="text-xs text-soft-gray">
                    Baseado em {completedSimulationsWithTime.length} {completedSimulationsWithTime.length === 1 ? 'simulação' : 'simulações'}
                    {hasBreakdownData && ` (${simulationsWithBreakdown.length} com dados detalhados)`}
                  </p>
                </div>
              </div>
            )}
          </LiquidGlassCard>
        </div>

        {/* Add Score Dialog */}
        <Dialog open={showAddScore} onOpenChange={(open) => {
          setShowAddScore(open);
          if (!open) {
            handleCancelEdit();
          }
        }}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg lg:max-w-2xl max-h-[85vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-dark-blue flex items-center">
                {editingScore ? (
                  <>
                    <Edit3 className="mr-2" size={16} />
                    Editar Nota
                  </>
                ) : (
                  <>
                    <Plus className="mr-2" size={16} />
                    Gerenciar Notas
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 sm:space-y-6">
              {/* List of existing scores */}
              {!editingScore && userScores.length > 0 && (
                <div className="border-b pb-4">
                  <h3 className="text-sm font-semibold text-dark-blue mb-3">Notas Cadastradas</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {[...userScores].sort((a, b) => new Date(b.scoreDate).getTime() - new Date(a.scoreDate).getTime()).map((score) => (
                      <div 
                        key={score.id} 
                        className="flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-soft-gray/10 to-bright-blue/10 border-soft-gray/20"
                        data-testid={`score-item-${score.id}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-dark-blue">{score.examName}</span>
                            <span className="text-xs text-soft-gray">
                              {new Date(score.scoreDate).toISOString().split('T')[0].split('-').reverse().join('/')}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-bright-blue mt-1">{score.score} pts</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditScore(score)}
                            className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10"
                            data-testid={`button-edit-score-${score.id}`}
                          >
                            <Edit3 size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteScore(score.id)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            data-testid={`button-delete-score-${score.id}`}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form for adding/editing */}
              {editingScore && (
                <div className="flex items-center gap-2 p-2 bg-bright-blue/10 rounded-lg border border-bright-blue/20">
                  <AlertCircle className="text-bright-blue" size={16} />
                  <span className="text-sm text-dark-blue">Editando nota existente</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-dark-blue">Nome da Prova/Simulado</Label>
                  <Input
                    value={newScore.examName}
                    onChange={(e) => setNewScore({...newScore, examName: e.target.value})}
                    placeholder="Ex: Simulado ENEM"
                    className="mt-1"
                    data-testid="input-exam-name"
                  />
                </div>
                
                <div>
                  <Label className="text-sm text-dark-blue">Data</Label>
                  <Input
                    type="date"
                    value={newScore.scoreDate}
                    onChange={(e) => setNewScore({...newScore, scoreDate: e.target.value})}
                    className="mt-1"
                    data-testid="input-score-date"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm text-dark-blue font-medium">Nota Total (obrigatório)</Label>
                <Input
                  type="number"
                  value={newScore.score}
                  onChange={(e) => setNewScore({...newScore, score: e.target.value})}
                  placeholder="Ex: 850"
                  className="mt-1"
                  max="1000"
                  min="0"
                  data-testid="input-total-score"
                />
              </div>
              
              <div>
                <Label className="text-sm text-dark-blue font-medium mb-3 block">Pontuação por Competência (opcional)</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                  {[
                    { key: 'competence1', label: 'Comp. 1', desc: 'Norma Culta' },
                    { key: 'competence2', label: 'Comp. 2', desc: 'Compreensão' },
                    { key: 'competence3', label: 'Comp. 3', desc: 'Argumentação' },
                    { key: 'competence4', label: 'Comp. 4', desc: 'Coesão' },
                    { key: 'competence5', label: 'Comp. 5', desc: 'Proposta' }
                  ].map((comp) => (
                    <div key={comp.key} className="space-y-2">
                      <Label className="text-xs text-soft-gray font-medium">{comp.label}</Label>
                      <Input
                        type="number"
                        value={newScore[comp.key as keyof typeof newScore]}
                        onChange={(e) => setNewScore({...newScore, [comp.key]: e.target.value})}
                        placeholder="0-200"
                        className="text-sm"
                        max="200"
                        min="0"
                        data-testid={`input-${comp.key}`}
                      />
                      <div className="text-xs text-soft-gray">{comp.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                <Button
                  onClick={handleAddScore}
                  className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 flex-1"
                  data-testid="button-save-score"
                  disabled={addScoreMutation.isPending || updateScoreMutation.isPending}
                >
                  {editingScore ? 'Salvar Alterações' : 'Salvar Nota'}
                </Button>
                {editingScore && (
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="sm:flex-none border-soft-gray/30"
                    data-testid="button-cancel-edit"
                  >
                    Cancelar Edição
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setShowAddScore(false)}
                  className="sm:flex-none"
                  data-testid="button-cancel-score"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>


        

        {/* Fourth Row: Cronograma de Estudos - Full Width */}
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-study-schedule">
          <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between md:mb-0 mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-3">
                  <Timer className="text-white" size={12} />
                </div>
                <h4 className="font-semibold text-dark-blue text-base md:text-lg">Cronograma de Estudos Personalizado</h4>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10 hidden md:flex"
                onClick={handleScheduleEdit}
                data-testid="button-customize-schedule"
              >
                Personalizar
              </Button>
            </div>
            <div className="md:hidden">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10"
                onClick={handleScheduleEdit}
                data-testid="button-customize-schedule-mobile"
              >
                Personalizar
              </Button>
            </div>
          </div>
          
          {!hasScheduleData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-bright-blue/20 to-dark-blue/20 rounded-full flex items-center justify-center mx-auto">
                  <Timer className="text-bright-blue" size={36} />
                </div>
                <div>
                  <p className="text-base font-medium text-dark-blue mb-2">Nenhum cronograma definido</p>
                  <p className="text-sm text-soft-gray mb-4">Personalize seu cronograma de estudos semanal para acompanhar seu progresso</p>
                  <Button 
                    variant="outline" 
                    onClick={handleScheduleEdit}
                    className="border-bright-blue/30 text-bright-blue hover:bg-bright-blue/10"
                  >
                    <Plus className="mr-2" size={16} />
                    Criar Cronograma
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid lg:grid-cols-7 gap-4">
                {/* Dias da Semana */}
                {scheduleData.map((schedule, index) => (
                  <div key={index} className="flex flex-col">
                    <div className={`p-4 rounded-lg border h-full ${
                      schedule.completed
                        ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                        : 'bg-gradient-to-br from-bright-blue/10 to-dark-blue/10 border-bright-blue/20'
                    }`}>
                      <div className="text-center mb-3">
                        <div className="text-sm font-bold text-dark-blue mb-1">{schedule.day}</div>
                        <div className={`text-xs font-medium ${
                          schedule.completed 
                            ? 'text-green-600'
                            : 'text-bright-blue'
                        }`}>
                          {formatTime(schedule.hours, schedule.minutes)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {schedule.activities.map((activity, i) => (
                          <div key={i} className={`text-xs px-2 py-1 rounded text-center ${
                            schedule.completed
                              ? 'bg-green-100 text-green-700 line-through'
                              : 'bg-white/50 text-dark-blue'
                          }`}>
                            {activity}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-center mt-3">
                      <button
                        onClick={() => toggleScheduleCompletion(index)}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          schedule.completed
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-white/70 text-dark-blue hover:bg-bright-blue/10 border border-bright-blue/30'
                        }`}
                        data-testid={`button-complete-${schedule.day.toLowerCase()}`}
                      >
                        <CheckCircle2 size={10} />
                        <span>{schedule.completed ? 'Concluído' : 'Marcar'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gradient-to-r from-bright-blue/10 to-dark-blue/10 rounded-lg border border-bright-blue/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="text-bright-blue mr-2" size={14} />
                    <div className="text-sm font-medium text-dark-blue">Meta Semanal de Estudos</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-bright-blue" data-testid="text-weekly-hours">{calculateWeeklyHours()}</div>
                    <div className="text-xs text-soft-gray">por semana</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </LiquidGlassCard>

        {/* Schedule Edit Modal */}
        <Dialog open={showScheduleEdit} onOpenChange={setShowScheduleEdit}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[85vh] overflow-y-auto mx-4 sm:mx-auto" data-testid="dialog-schedule-edit">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-dark-blue flex items-center">
                <Timer className="mr-3 text-bright-blue" size={20} />
                Editar Cronograma de Estudos
              </DialogTitle>
              <div className="text-sm text-soft-gray">Cronograma semanal de estudos</div>
            </DialogHeader>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {editingSchedule.map((day, index) => (
                  <div key={day.day} className="p-3 sm:p-4 rounded-lg border-2 bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/30" data-testid={`schedule-edit-${day.day.toLowerCase()}`}>
                    <div className="text-center mb-3 sm:mb-4">
                      <div className="text-base sm:text-lg font-bold text-dark-blue">{day.day}</div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-dark-blue mb-2 block">Tempo de Estudo</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Input
                              type="number"
                              value={day.hours}
                              onChange={(e) => updateScheduleDay(index, 'hours', e.target.value)}
                              placeholder="0"
                              min="0"
                              max="12"
                              className="text-center"
                              data-testid={`input-hours-${day.day.toLowerCase()}`}
                            />
                            <div className="text-xs text-center text-soft-gray">Horas</div>
                          </div>
                          <div className="space-y-1">
                            <Input
                              type="number"
                              value={day.minutes}
                              onChange={(e) => updateScheduleDay(index, 'minutes', e.target.value)}
                              placeholder="0"
                              min="0"
                              max="59"
                              step="15"
                              className="text-center"
                              data-testid={`input-minutes-${day.day.toLowerCase()}`}
                            />
                            <div className="text-xs text-center text-soft-gray">Minutos</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-dark-blue mb-2 block">Atividades</Label>
                        <Textarea
                          value={day.activities.join('\n')}
                          onChange={(e) => updateScheduleDay(index, 'activities', e.target.value)}
                          placeholder="Redação dissertativa&#10;Revisão de matemática&#10;Leitura de livro&#10;(Uma por linha)"
                          className="min-h-[80px] sm:min-h-[100px] resize-none"
                          data-testid={`textarea-activities-${day.day.toLowerCase()}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleCancelScheduleEdit}
                  className="text-soft-gray border-soft-gray/30 hover:bg-soft-gray/10 sm:flex-none order-2 sm:order-1"
                  data-testid="button-cancel-schedule"
                >
                  <X className="mr-2" size={12} />
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveSchedule}
                  className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 order-1 sm:order-2"
                  data-testid="button-save-schedule"
                >
                  <Save className="mr-2" size={12} />
                  Salvar Cronograma
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Features Configuration Modal */}
        <Dialog open={showFeaturesConfig} onOpenChange={setShowFeaturesConfig}>
          <DialogContent className="max-w-2xl" data-testid="dialog-features-config">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-dark-blue flex items-center">
                <Settings className="mr-3 text-bright-blue" size={20} />
                Configurar Funcionalidades de Acesso Rápido
              </DialogTitle>
              <div className="text-sm text-soft-gray">Escolha quais funcionalidades aparecem no seu dashboard</div>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="text-sm font-medium text-dark-blue mb-2">
                Selecione as funcionalidades que deseja ver no acesso rápido:
              </div>
              
              <div className="grid gap-3">
                {allFeatures.map((feature) => {
                  const IconComponent = feature.icon;
                  const isSelected = visibleFeatures.includes(feature.id);
                  
                  return (
                    <div 
                      key={feature.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-bright-blue/10 border-bright-blue/30' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      } ${
                        (!isSelected && visibleFeatures.length >= 4) || (isSelected && visibleFeatures.length <= 2)
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      onClick={() => {
                        if ((!isSelected && visibleFeatures.length >= 4) || (isSelected && visibleFeatures.length <= 2)) {
                          return;
                        }
                        toggleFeatureVisibility(feature.id);
                      }}
                      data-testid={`feature-toggle-${feature.id}`}
                    >
                      <Checkbox 
                        checked={isSelected}
                        disabled={(!isSelected && visibleFeatures.length >= 4) || (isSelected && visibleFeatures.length <= 2)}
                        onChange={() => {
                          if ((!isSelected && visibleFeatures.length >= 4) || (isSelected && visibleFeatures.length <= 2)) {
                            return;
                          }
                          toggleFeatureVisibility(feature.id);
                        }}
                        data-testid={`checkbox-${feature.id}`}
                      />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected 
                          ? `bg-gradient-to-br from-${feature.color === 'bright-blue' ? 'bright-blue' : feature.color === 'dark-blue' ? 'dark-blue' : 'soft-gray'} to-${feature.color === 'bright-blue' ? 'dark-blue' : feature.color === 'dark-blue' ? 'soft-gray' : 'bright-blue'}`
                          : 'bg-gray-300'
                      }`}>
                        <IconComponent className="text-white" size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-dark-blue">{feature.name}</div>
                        <div className="text-xs text-soft-gray">{feature.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className={`text-xs mt-2 ${
                visibleFeatures.length < 2 || visibleFeatures.length > 4 
                  ? 'text-red-500' 
                  : 'text-soft-gray'
              }`}>
                {visibleFeatures.length < 2 
                  ? 'Selecione pelo menos 2 funcionalidades'
                  : visibleFeatures.length > 4
                    ? 'Máximo de 4 funcionalidades'
                    : `Funcionalidades selecionadas: ${visibleFeatures.length}/4`
                }
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowFeaturesConfig(false)}
                className="text-soft-gray border-soft-gray/30 hover:bg-soft-gray/10"
                data-testid="button-cancel-features-config"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveFeaturesConfig}
                className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                data-testid="button-save-features-config"
              >
                <Save className="mr-2" size={12} />
                Salvar Configuração
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Goals Management Modal */}
        <Dialog open={showGoalsManagement} onOpenChange={setShowGoalsManagement}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto mx-4 sm:mx-auto" data-testid="dialog-goals-management">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-dark-blue flex items-center">
                <Target className="mr-3 text-bright-blue" size={20} />
                Gerenciar Metas da Semana
              </DialogTitle>
              <div className="text-sm text-soft-gray">Adicione, edite ou remova suas metas semanais</div>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Current Goals */}
              <div>
                <h3 className="text-lg font-semibold text-dark-blue mb-4">Metas Atuais</h3>
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div key={goal.id} className={`p-3 sm:p-4 rounded-lg border-2 ${
                      goal.completed 
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300'
                        : 'bg-gradient-to-r from-bright-blue/5 to-dark-blue/5 border-bright-blue/30'
                    }`} data-testid={`goal-item-${goal.id}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            goal.completed ? 'bg-green-500' : 'bg-bright-blue'
                          }`}>
                            <CheckCircle2 className="text-white" size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium ${goal.completed ? 'text-green-700 line-through' : 'text-dark-blue'}`}>
                              {goal.title}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 space-y-2 sm:space-y-0">
                              <div className="flex items-center space-x-2">
                                <label className="text-sm text-soft-gray flex-shrink-0">Progresso:</label>
                                <input
                                  type="number"
                                  value={goal.current}
                                  onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                                  className="w-16 px-2 py-1 text-sm border border-bright-blue/30 rounded focus:outline-none focus:border-bright-blue"
                                  min="0"
                                  max={goal.target}
                                  step="1"
                                  data-testid={`input-goal-progress-${goal.id}`}
                                />
                                <span className="text-sm text-soft-gray">/ {goal.target} {goal.unit}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:ml-4 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleGoalCompletion(goal.id)}
                            className={`text-xs sm:text-sm ${
                              goal.completed 
                                ? 'bg-green-500 text-white hover:bg-green-600 border-green-500'
                                : 'text-bright-blue border-bright-blue/30 hover:bg-bright-blue/10'
                            }`}
                            data-testid={`button-toggle-goal-${goal.id}`}
                          >
                            {goal.completed ? 'Desmarcar' : 'Concluir'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeGoal(goal.id)}
                            className="text-red-500 border-red-300 hover:bg-red-50"
                            data-testid={`button-remove-goal-${goal.id}`}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Add New Goal */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-dark-blue mb-4">Adicionar Nova Meta</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-dark-blue">Título da Meta</Label>
                    <Input
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                      placeholder="Ex: Ler livros"
                      className="mt-1"
                      data-testid="input-new-goal-title"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-dark-blue">Meta (quantidade)</Label>
                    <Input
                      type="number"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                      placeholder="Ex: 3"
                      className="mt-1"
                      min="1"
                      data-testid="input-new-goal-target"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-dark-blue">Unidade</Label>
                    <Input
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                      placeholder="Ex: livros"
                      className="mt-1"
                      data-testid="input-new-goal-unit"
                    />
                  </div>
                </div>
                <Button
                  onClick={addNewGoal}
                  className="mt-4 bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                  disabled={!newGoal.title || !newGoal.target || !newGoal.unit}
                  data-testid="button-add-new-goal"
                >
                  <Plus className="mr-2" size={12} />
                  Adicionar Meta
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowGoalsManagement(false)}
                className="text-soft-gray border-soft-gray/30 hover:bg-soft-gray/10"
                data-testid="button-close-goals-management"
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Exams Management Modal */}
        <Dialog open={showExamsManagement} onOpenChange={setShowExamsManagement}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-exams-management">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-dark-blue flex items-center">
                <Calendar className="mr-3 text-bright-blue" size={20} />
                Gerenciar Próximas Provas
              </DialogTitle>
              <div className="text-sm text-soft-gray">Adicione, edite ou remova suas provas e exames</div>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Current Exams */}
              <div>
                <h3 className="text-lg font-semibold text-dark-blue mb-4">Próximas Provas</h3>
                <div className="space-y-3">
                  {exams.map((exam) => (
                    <div key={exam.id} className="p-4 rounded-lg border-2 bg-gradient-to-r from-bright-blue/5 to-dark-blue/5 border-bright-blue/30" data-testid={`exam-item-${exam.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-8 h-8 bg-bright-blue rounded-full flex items-center justify-center">
                            <Calendar className="text-white" size={16} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="font-medium text-dark-blue">{exam.name}</div>
                              <span className="px-2 py-1 text-xs bg-bright-blue/10 text-bright-blue rounded-full border border-bright-blue/20">
                                {exam.type}
                              </span>
                            </div>
                            {exam.description && (
                              <div className="text-sm text-soft-gray mb-2">{exam.description}</div>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-soft-gray">
                              <span>📅 {exam.date.split('-').reverse().join('/')}</span>
                              {exam.time && exam.time.trim() && <span>🕐 {exam.time}</span>}
                              {exam.location && exam.location.trim() && <span>📍 {exam.location}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeExam(exam.id)}
                            className="text-red-500 border-red-300 hover:bg-red-50"
                            data-testid={`button-remove-exam-${exam.id}`}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Add New Exam */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-dark-blue mb-4">Adicionar Nova Prova</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                    <Label className="text-sm text-dark-blue">Tipo da Prova</Label>
                    <Select value={newExam.type} onValueChange={(value) => setNewExam({...newExam, type: value})} data-testid="select-new-exam-type">
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999]">
                        <SelectItem value="simulado">Simulado</SelectItem>
                        <SelectItem value="vestibular">Vestibular</SelectItem>
                        <SelectItem value="concurso">Concurso</SelectItem>
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm text-dark-blue">Horário (opcional)</Label>
                    <Input
                      type="time"
                      value={newExam.time}
                      onChange={(e) => setNewExam({...newExam, time: e.target.value})}
                      className="mt-1"
                      data-testid="input-new-exam-time"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-dark-blue">Local (opcional)</Label>
                    <Input
                      value={newExam.location}
                      onChange={(e) => setNewExam({...newExam, location: e.target.value})}
                      placeholder="Ex: FUVEST"
                      className="mt-1"
                      data-testid="input-new-exam-location"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Label className="text-sm text-dark-blue">Descrição (opcional)</Label>
                  <Input
                    value={newExam.description}
                    onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                    placeholder="Ex: Primeiro dia do ENEM - Redação, Linguagens e Ciências Humanas"
                    className="mt-1"
                    data-testid="input-new-exam-description"
                  />
                </div>
                <Button
                  onClick={addNewExam}
                  className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90"
                  disabled={!newExam.name || !newExam.date || !newExam.type}
                  data-testid="button-add-new-exam"
                >
                  <Plus className="mr-2" size={12} />
                  Adicionar Prova
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowExamsManagement(false)}
                className="text-soft-gray border-soft-gray/30 hover:bg-soft-gray/10"
                data-testid="button-close-exams-management"
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Fifth Row: Newsletter - Full Width */}
        <LiquidGlassCard className="bg-gradient-to-br from-soft-gray/5 to-bright-blue/5 border-soft-gray/20" data-testid="card-newsletter">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-soft-gray to-bright-blue rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <Book className="text-white" size={16} />
            </div>
            <h4 className="font-semibold text-dark-blue">Newsletter da Semana</h4>
          </div>
          
          {latestNewsletter ? (
            <div className="grid lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-medium text-dark-blue text-lg">{latestNewsletter.title}</div>
                  {latestNewsletter.isNew && (
                    <span className="px-2 py-0.5 bg-bright-blue/20 text-bright-blue text-xs font-medium rounded">
                      Novo
                    </span>
                  )}
                </div>
                {latestNewsletter.excerpt && (
                  <p className="text-soft-gray leading-relaxed mb-2">{latestNewsletter.excerpt}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-soft-gray">
                  {latestNewsletter.category && (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-bright-blue rounded-full mr-1.5"></span>
                      {latestNewsletter.category}
                    </span>
                  )}
                  {latestNewsletter.readTime && (
                    <span>{latestNewsletter.readTime} min de leitura</span>
                  )}
                  {latestNewsletter.publishDate && (
                    <span>
                      {new Date(latestNewsletter.publishDate).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setLocation('/newsletter')}
                  className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 px-8 py-3"
                  data-testid="button-read-newsletter"
                >
                  Ler Newsletter Completa
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-soft-gray/20 to-bright-blue/20 rounded-full flex items-center justify-center mx-auto">
                  <Book className="text-soft-gray" size={28} />
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-blue mb-1">Nenhuma newsletter publicada</p>
                  <p className="text-xs text-soft-gray">As newsletters aparecerão aqui assim que forem publicadas</p>
                </div>
              </div>
            </div>
          )}
        </LiquidGlassCard>

        {/* Simulador de Provas - Full Width */}
        <LiquidGlassCard className="bg-gradient-to-br from-bright-blue/5 to-dark-blue/5 border-bright-blue/20" data-testid="card-simulador-provas">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-bright-blue to-dark-blue rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <GraduationCap className="text-white" size={16} />
            </div>
            <h4 className="font-semibold text-dark-blue">Simulador de Provas</h4>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className="font-medium text-dark-blue mb-2 text-lg">Pratique redações em ambiente simulado 📝</div>
              <p className="text-soft-gray leading-relaxed">Teste seus conhecimentos com simulados completos que replicam o formato das principais provas do país. Cronômetro, temas atuais e correção detalhada.</p>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => handleQuickAccess('simulador')}
                className="bg-gradient-to-r from-bright-blue to-dark-blue text-white hover:from-bright-blue/90 hover:to-dark-blue/90 px-8 py-3"
                data-testid="button-access-simulador"
              >
                Iniciar Simulado
              </Button>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Biblioteca Pessoal - Full Width */}
        <LiquidGlassCard className="bg-gradient-to-br from-purple-50/80 to-purple-100/50 border-purple-200/50" data-testid="card-biblioteca-pessoal">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <Archive className="text-white" size={16} />
            </div>
            <h4 className="font-semibold text-dark-blue">Biblioteca Pessoal</h4>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className="font-medium text-dark-blue mb-2 text-lg">Repositório inteligente do seu aprendizado 📚</div>
              <p className="text-soft-gray leading-relaxed">Organize e acesse todo seu conteúdo criado: redações salvas, estruturas personalizadas, repertórios favoritos e argumentos desenvolvidos, tudo categorizado de forma inteligente.</p>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => setLocation('/biblioteca')}
                className="bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800 px-8 py-3"
                data-testid="button-access-biblioteca"
              >
                Acessar Biblioteca
              </Button>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Material Complementar - Full Width */}
        <LiquidGlassCard className="bg-gradient-to-br from-green-50/80 to-green-100/50 border-green-200/50" data-testid="card-material-complementar">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <BookOpen className="text-white" size={16} />
            </div>
            <h4 className="font-semibold text-dark-blue">Material Complementar</h4>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <div className="font-medium text-dark-blue mb-2 text-lg">Guias educativos para aprimorar sua redação 📖</div>
              <p className="text-soft-gray leading-relaxed">Acesse materiais didáticos essenciais sobre estrutura dissertativa, conectivos, repertório cultural, gramática e técnicas avançadas de escrita argumentativa.</p>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => setLocation('/material-complementar')}
                className="bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 px-8 py-3"
                data-testid="button-access-material-complementar"
              >
                Acessar Materiais
              </Button>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Initial Target Setup Dialog */}
        <Dialog open={showInitialTargetSetup} onOpenChange={setShowInitialTargetSetup}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] mx-4 sm:mx-auto" data-testid="dialog-initial-target-setup">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-dark-blue flex items-center">
                <Target className="mr-3 text-bright-blue" size={24} />
                Defina Sua Meta de Pontuação 🎯
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <p className="text-soft-gray leading-relaxed">
                  Olá! Bem-vindo ao <span className="font-semibold text-dark-blue">DissertIA</span>. 
                  Para personalizar sua experiência e acompanhar seu progresso, vamos definir sua meta de pontuação.
                </p>
                <p className="text-soft-gray leading-relaxed">
                  Qual pontuação você deseja alcançar nas suas redações?
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="initial-target" className="text-sm font-medium text-dark-blue">
                  Meta de Pontuação
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="initial-target"
                    type="number"
                    min="0"
                    max="1000"
                    value={initialTargetScore}
                    onChange={(e) => setInitialTargetScore(Number(e.target.value))}
                    className="flex-1 text-lg font-semibold"
                    placeholder="900"
                    data-testid="input-initial-target-score"
                  />
                  <span className="text-sm text-soft-gray whitespace-nowrap">pontos</span>
                </div>
                <p className="text-xs text-soft-gray">
                  💡 Dica: Para o ENEM, a pontuação máxima é 1000 pontos. Uma meta comum é 900 pontos.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => {
                    updateProgressMutation.mutate({ targetScore: initialTargetScore });
                    setShowInitialTargetSetup(false);
                    toast({
                      title: "Meta definida! 🎯",
                      description: `Sua meta de ${initialTargetScore} pontos foi salva com sucesso.`,
                    });
                  }}
                  className="flex-1 bg-bright-blue text-white hover:bg-bright-blue/90"
                  data-testid="button-save-initial-target"
                  disabled={updateProgressMutation.isPending}
                >
                  {updateProgressMutation.isPending ? "Salvando..." : "Definir Meta"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Onboarding Tour */}
        {showOnboarding && (
          <OnboardingTour
            onComplete={() => completeOnboardingMutation.mutate()}
            onSkip={() => {
              completeOnboardingMutation.mutate();
              setShowOnboarding(false);
            }}
          />
        )}
        
      </div>
    </div>
  );
}
