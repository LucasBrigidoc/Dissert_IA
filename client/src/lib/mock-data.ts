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
    name: "Refinamento de Ideias",
    description: "Converse com uma IA para organizar suas redações",
    icon: "brain"
  },
  {
    id: 2,
    name: "Explorador de Repertório",
    description: "Banco de dados inteligente com referências atualizadas",
    icon: "search"
  },
  {
    id: 3,
    name: "Estrutura Roterizada",
    description: "Sistema inteligente de roteirização de redações com análise estrutural avançada",
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
    name: "Controlador de Escrita",
    description: "Ajustes interativos de formalidade e tom",
    icon: "edit3"
  },
  {
    id: 6,
    name: "Simulador de Prova",
    description: "Ambiente realista idêntico ao dia da prova",
    icon: "graduation-cap"
  },
  {
    id: 7,
    name: "Explorador de Propostas",
    description: "Ferramenta para elaborar e pesquisar temas de redação",
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
      "Acesso a funcionalidades básicas",
      "Newsletter educacional semanal",
      "Material complementar educacional",
      "Dashboard personalizado",
      "Biblioteca pessoal limitada",
      "Uso limitado de IA",
      "Limite demora 15 dias para zerar"
    ],
    buttonText: "Começar Grátis",
    popular: false
  },
  {
    id: "pro",
    name: "Plano Pro",
    price: "R$55,00",
    period: "/Mês",
    annualPrice: "R$479,88/Ano",
    features: [
      "Acesso a todas funcionalidades",
      "IA avançada com correção por competência",
      "Estrutura Roterizada: sistema inteligente de roteirização",
      "Repertório inteligente com milhares de referências",
      "Controlador de Escrita: ajuste tom e formalidade",
      "Simulador completo idêntico ao dia da prova",
      "Biblioteca completa + Material exclusivo",
      "Uso completo de IA + Suporte prioritário",
      "Limite zera em 7 dias"
    ],
    buttonText: "Assinar Pro",
    popular: true
  }
];

export const mockTestimonials = [
  {
    id: 1,
    name: "Irlanda Araújo",
    initials: "IA",
    text: "A ferramenta de Repertório transformou minhas redações! Agora consigo fundamentar meus argumentos com dados reais e citações relevantes. Passei de 700 para 920 pontos!",
    rating: 5
  },
  {
    id: 2,
    name: "Claúdio Sergio",
    initials: "CS",
    text: "A ferramenta Simulador me ajudou muito! Treino diariamente em um ambiente idêntico à prova real, com tempo cronometrado e interface igual ao ENEM. Com cada simulado, vejo minha evolução e ganho mais confiança!",
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
    question: "Qual a diferença entre o Plano Gratuito e Pro?",
    answer: "O Plano Gratuito oferece acesso básico às funcionalidades principais com uso limitado para você testar a plataforma. O Plano Pro inclui acesso total a todas funcionalidades, uso completo de IA, correção avançada e material complementar exclusivo."
  },
  {
    id: 2,
    question: "O que está incluído no plano gratuito?",
    answer: "O plano gratuito inclui acesso a funcionalidades básicas, newsletter educacional semanal, dashboard personalizado, biblioteca pessoal limitada, uso limitado de IA e simulador básico de redação."
  },
  {
    id: 3,
    question: "Como funciona o uso de IA?",
    answer: "O uso determina quantas vezes você pode utilizar nossas ferramentas de IA por dia. Plano Gratuito: uso limitado. Plano Pro: uso completo de todas as funcionalidades de IA."
  },
  {
    id: 4,
    question: "O que é a IA avançada para correção?",
    answer: "É nossa funcionalidade premium que oferece análises detalhadas com critérios ENEM/vestibular, correções personalizadas por competência e sugestões avançadas. Disponível apenas no Plano Pro."
  },
  {
    id: 5,
    question: "Posso cancelar minha assinatura a qualquer momento?",
    answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem penalidades. O cancelamento pode ser feito através do seu dashboard ou entrando em contato conosco."
  },
  {
    id: 6,
    question: "Como funciona a biblioteca pessoal?",
    answer: "No plano gratuito, você pode salvar uma quantidade limitada de itens na sua biblioteca pessoal. No Plano Pro, você tem espaço completo para salvar todas suas redações, repertórios e acompanhar seu progresso completo."
  },
  {
    id: 7,
    question: "O que é o Material Complementar Exclusivo?",
    answer: "Disponível apenas no Plano Pro, inclui e-books avançados, templates de redação premium e materiais de estudo aprofundado para maximizar sua nota."
  },
  {
    id: 8,
    question: "Posso fazer upgrade do meu plano?",
    answer: "Sim! Você pode fazer upgrade do seu plano a qualquer momento. O valor será ajustado proporcionalmente e você terá acesso imediato às novas funcionalidades."
  },
  {
    id: 9,
    question: "Os planos anuais têm desconto?",
    answer: "Sim! Assinando o Plano Pro anualmente você economiza: de R$55,00/mês por R$479,88/ano (equivale a R$39,99/mês), garantindo economia de 27% e acesso completo a todas as funcionalidades."
  },
  {
    id: 10,
    question: "Como funciona o acesso à Newsletter?",
    answer: "Todos os planos incluem nossa newsletter educacional semanal com temas atuais, repertório cultural, dicas de redação e análises de propostas para você se manter sempre atualizado."
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
