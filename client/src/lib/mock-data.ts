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
    name: "Estrutura Coringa",
    description: "Crie modelos reutilizáveis e gere redações personalizadas",
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

export const mockNewsletters = [
  {
    id: 1,
    title: "Tecnologia e Sociedade 🤖",
    excerpt: "Explore como a inteligência artificial está transformando o mundo moderno e descubra como incorporar esse tema em suas redações com repertório atualizado e exemplos práticos.",
    content: "A inteligência artificial (IA) está revolucionando diversos setores da sociedade moderna, desde a medicina até a educação. Este tema é extremamente relevante para redações do ENEM e vestibulares, pois permite discussões sobre ética, transformação social e impactos tecnológicos.\n\nPontos importantes para abordar:\n\n1. **Transformação do mercado de trabalho**: A IA está automatizando diversas profissões, criando novas oportunidades enquanto elimina outras. Exemplo: chatbots substituindo atendentes, mas criando empregos para desenvolvedores de IA.\n\n2. **Ética na tecnologia**: Questões sobre privacidade, viés algorítmico e responsabilidade das empresas tecnológicas. Caso do reconhecimento facial que apresenta erros em pessoas negras.\n\n3. **Democratização do conhecimento**: Ferramentas como ChatGPT tornam informação acessível, mas levantam questões sobre veracidade e dependência tecnológica.\n\n**Repertório Cultural:**\n- Filme 'Ex Machina' (2014): Explora relações humano-máquina\n- Livro '1984' de George Orwell: Vigilância e controle social\n- Black Mirror: Série que critica excessos tecnológicos\n\n**Dados e Estatísticas:**\n- 47% dos empregos correm risco de automação nos próximos 20 anos\n- Brasil é o 4º país em uso de IA na América Latina\n- Investimento global em IA: US$ 91,5 bilhões em 2022",
    publishDate: "2024-01-22",
    readTime: "8 min",
    category: "Atualidades",
    isNew: true
  },
  {
    id: 2,
    title: "Sustentabilidade e Meio Ambiente 🌱",
    excerpt: "Análise completa sobre mudanças climáticas, políticas ambientais e desenvolvimento sustentável para enriquecer suas redações sobre meio ambiente.",
    content: "As questões ambientais estão no centro dos debates contemporâneos, sendo tema recorrente em provas de redação. O aquecimento global, desmatamento e políticas de sustentabilidade são tópicos essenciais para uma argumentação sólida.\n\nPontos de análise:\n\n1. **Mudanças climáticas**: Causas antropogênicas e consequências globais\n2. **Políticas públicas**: Acordos internacionais e legislação ambiental\n3. **Desenvolvimento sustentável**: Equilíbrio entre crescimento econômico e preservação\n\n**Repertório essencial:**\n- Acordo de Paris (2015)\n- Conferência ECO-92 no Rio de Janeiro\n- Greta Thunberg e ativismo jovem\n- Amazônia como pulmão do mundo",
    publishDate: "2024-01-15",
    readTime: "6 min",
    category: "Meio Ambiente",
    isNew: false
  },
  {
    id: 3,
    title: "Educação no Século XXI 📚",
    excerpt: "Como a pandemia transformou a educação e quais são os desafios para democratizar o ensino de qualidade no Brasil.",
    content: "A pandemia de COVID-19 acelerou transformações na educação que já estavam em curso. O ensino remoto, a educação híbrida e as tecnologias educacionais se tornaram protagonistas, revelando tanto oportunidades quanto desigualdades.\n\nTemas para desenvolver:\n\n1. **Desigualdade digital**: Nem todos os estudantes têm acesso à internet e equipamentos\n2. **Metodologias ativas**: Ensino centrado no aluno vs. métodos tradicionais\n3. **Formação de professores**: Necessidade de capacitação tecnológica\n\n**Dados relevantes:**\n- 4,8 milhões de estudantes sem acesso à internet durante a pandemia\n- 39% dos professores não tinham formação para ensino remoto\n- Investimento brasileiro em educação: 6% do PIB",
    publishDate: "2024-01-08",
    readTime: "7 min",
    category: "Educação",
    isNew: false
  },
  {
    id: 4,
    title: "Democracia e Participação Cidadã 🏛️",
    excerpt: "Reflexões sobre o papel da juventude na democracia, participação política e importância do voto consciente.",
    content: "A participação cidadã é fundamental para o fortalecimento da democracia. No Brasil, temas como voto obrigatório, participação jovem e educação política são centrais para compreender nossa realidade social.\n\nAspectos importantes:\n\n1. **Voto consciente**: Importância da informação e análise crítica\n2. **Participação juvenil**: Movimentos estudantis e engajamento político\n3. **Democracia digital**: Redes sociais como espaço de debate político\n\n**Referências históricas:**\n- Diretas Já (1984)\n- Constituição de 1988\n- Lei da Ficha Limpa (2010)\n- Jornadas de Junho (2013)",
    publishDate: "2024-01-01",
    readTime: "5 min",
    category: "Política",
    isNew: false
  }
];
