export const mockUserData = {
  name: "Lucas Brigido",
  email: "lucas@dissertai.com",
  averageScore: 785,
  targetScore: 900,
  essaysCount: 47,
  studyHours: 89,
  streak: 12,
  progressPercentage: 87,
  nextExam: "ENEM 2024",
  recentActivity: [
    {
      id: 1,
      type: "essay",
      title: "Tecnologia e Sociedade",
      score: 820,
      date: "2024-01-15"
    },
    {
      id: 2,
      type: "practice",
      title: "Argumentação sobre Meio Ambiente",
      score: 750,
      date: "2024-01-14"
    }
  ]
};

export const mockFeatures = [
  {
    id: 1,
    name: "Arquiteto de Argumentos",
    description: "Diálogo socrático para construção de argumentos sólidos",
    icon: "comments"
  },
  {
    id: 2,
    name: "Explorador de Repertório",
    description: "Banco de dados inteligente com referências atualizadas",
    icon: "search"
  },
  {
    id: 3,
    name: "Criador de Estrutura",
    description: "Adaptação ao seu estilo único de escrita",
    icon: "edit"
  },
  {
    id: 4,
    name: "Newsletter Educacional",
    description: "Curadoria semanal dos temas mais relevantes",
    icon: "newspaper"
  },
  {
    id: 5,
    name: "Controlador de Estilo",
    description: "Ajustes interativos de formalidade e tom",
    icon: "sliders"
  },
  {
    id: 6,
    name: "Simulador de Prova",
    description: "Ambiente realista idêntico ao dia da prova",
    icon: "graduation-cap"
  },
  {
    id: 7,
    name: "Criador de Propostas",
    description: "Ferramenta para elaborar temas de redação",
    icon: "lightbulb"
  },
  {
    id: 8,
    name: "Biblioteca Pessoal",
    description: "Repositório inteligente de todo seu aprendizado",
    icon: "archive"
  }
];

export const mockPricingPlans = [
  {
    id: "free",
    name: "Plano Gratuito",
    price: "R$0",
    period: "",
    features: [
      "Acesso à Newsletter",
      "Cronograma simples",
      "Newsletter semanal",
      "Acesso limitado às funcionalidades"
    ],
    buttonText: "Testar Gratuitamente",
    popular: false
  },
  {
    id: "base",
    name: "Plano Base",
    price: "R$39,90",
    period: "/Mês",
    annualPrice: "R$439/Ano",
    features: [
      "Acesso a todas as funcionalidades",
      "Dashboard e Cronograma",
      "Resposta aprofundada",
      "Sem anúncios"
    ],
    buttonText: "Assine Agora",
    popular: true
  },
  {
    id: "pro",
    name: "Plano Pro",
    price: "R$59,90",
    period: "/Mês",
    annualPrice: "R$599/Ano",
    features: [
      "Acesso a todas as funcionalidades",
      "Dashboard e Cronograma com IA",
      "Resposta aprofundada",
      "Material complementar"
    ],
    buttonText: "Assine Agora",
    popular: false
  }
];

export const mockTestimonials = [
  {
    id: 1,
    name: "Maria Fernanda",
    initials: "MF",
    text: "Passei na USP graças ao Dissert AI! A ferramenta me ajudou a estruturar melhor meus argumentos.",
    rating: 5
  },
  {
    id: 2,
    name: "João Silva",
    initials: "JS",
    text: "Minha nota em redação subiu de 600 para 920. O simulador é idêntico à prova real!",
    rating: 5
  },
  {
    id: 3,
    name: "Ana Clara",
    initials: "AC",
    text: "O repertório cultural nunca mais foi um problema. Consegui 980 na redação!",
    rating: 5
  }
];

export const mockFAQ = [
  {
    id: 1,
    question: "Como funciona o período gratuito?",
    answer: "O plano gratuito oferece acesso limitado às funcionalidades básicas com cronograma de estudo simples, newsletter semanal e sem anúncios."
  },
  {
    id: 2,
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem penalidades. Cancele através do seu dashboard ou entre em contato conosco."
  },
  {
    id: 3,
    question: "O plano gratuito realmente não tem custo?",
    answer: "Sim, o plano gratuito é totalmente gratuito e oferece acesso às funcionalidades básicas para você experimentar a plataforma antes de escolher um plano pago."
  },
  {
    id: 4,
    question: "Como funciona a garantia de 7 dias?",
    answer: "Oferecemos 7 dias grátis para testar todas as funcionalidades premium. Se não cancelar dentro dos primeiros 7 dias, oferecemos reembolso integral se você solicitar dentro dos primeiros 30 dias de compra."
  },
  {
    id: 5,
    question: "O plano anual tem desconto?",
    answer: "Sim! O plano Base anual custa R$439 (economia de R$39,80) e o plano Pro anual custa R$599 (economia de R$119,80). Você economiza até 2 meses de anuidade."
  }
];
