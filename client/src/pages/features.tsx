import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { mockFeatures } from "@/lib/mock-data";
import { 
  Brain, 
  MessageCircle, 
  Search, 
  Edit, 
  Sliders, 
  GraduationCap, 
  Lightbulb, 
  Archive, 
  Newspaper,
  AlertTriangle,
  CheckCircle,
  TriangleAlert,
  Sparkles,
  FileText,
  Target,
  Clock,
  BookOpen,
  Zap,
  PenTool,
  BarChart3,
  Mail
} from "lucide-react";

const iconMap = {
  comments: MessageCircle,
  search: Search,
  edit: Edit,
  newspaper: Newspaper,
  sliders: Sliders,
  "graduation-cap": GraduationCap,
  lightbulb: Lightbulb,
  archive: Archive,
  "file-text": FileText,
  target: Target,
  clock: Clock,
  "book-open": BookOpen,
  zap: Zap,
  "pen-tool": PenTool,
  "bar-chart-3": BarChart3
};

export default function Features() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Hero Section */}
      <section className="gradient-bg pt-20 sm:pt-24 pb-2 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Título centralizado ocupando toda a largura */}
          <div className="w-full text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#f4f4f4]" data-testid="text-features-title">
              Conheça as Principais Funcionalidades
            </h1>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-0">
            <div className="w-full lg:w-[55%] text-white text-center lg:text-left">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-[#5087ff] text-center lg:text-left font-semibold mt-4 mb-2" data-testid="text-features-subtitle">
                Ferramentas inteligentes para revolucionar sua escrita
              </p>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 font-medium text-center lg:text-left mt-3 mb-6" data-testid="text-features-description">
                Nosso sistema é projetado para te ajudar em cada etapa do processo de escrita com funcionalidades que utilizam IA para maximizar seus resultados. Desde a geração de ideias até a revisão final tenha um professor que vai lhe ajudar a melhorar sua escrita.
              </p>
              <Button asChild className="bg-bright-blue text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-600 smooth-transition hover-scale inline-flex items-center gap-2 mt-[7px] mb-[7px]" data-testid="button-try-now">
                <Link href="/signup">
                  <Sparkles size={20} />
                  Experimente Agora
                </Link>
              </Button>
            </div>
            
            <div className="w-full lg:w-[45%] relative flex justify-center lg:justify-start">
              <div className="w-80 h-80 sm:w-96 sm:h-96 md:w-[400px] md:h-[400px] mx-auto flex items-center justify-center">
                <img 
                  src="/imagem/fimagem1.svg" 
                  alt="Funcionalidades DissertAI" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-6 sm:pb-12">

        {/* Challenge Section */}
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-xl sm:text-3xl font-bold text-dark-blue mb-4 sm:mb-8" data-testid="text-challenge-title">
            Funcionalidades para os principais Desafio da Escrita
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            <LiquidGlassCard className="p-4 sm:p-8" data-testid="card-statistics">
              <h3 className="text-lg sm:text-xl font-semibold text-dark-blue mb-3 sm:mb-4">Estatísticas Alarmantes</h3>
              <div className="text-3xl sm:text-4xl text-red-500 mb-3 sm:mb-4">73%</div>
              <p className="text-soft-gray">dos estudantes brasileiros têm dificuldade com redação no ENEM</p>
            </LiquidGlassCard>
            <LiquidGlassCard className="p-4 sm:p-8" data-testid="card-challenges">
              <h3 className="text-lg sm:text-xl font-semibold text-dark-blue mb-3 sm:mb-4">Principais Desafios</h3>
              <div className="text-3xl sm:text-4xl text-yellow-500 mb-3 sm:mb-4">
                <TriangleAlert className="mx-auto" size={48} />
              </div>
              <p className="text-soft-gray">Falta de estrutura, repertório limitado e gestão de tempo inadequada</p>
            </LiquidGlassCard>
            <LiquidGlassCard className="p-4 sm:p-8" data-testid="card-solution">
              <h3 className="text-lg sm:text-xl font-semibold text-dark-blue mb-3 sm:mb-4">Nossa Solução</h3>
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-[#6b87f6]">
                <Lightbulb className="mx-auto" size={48} />
              </div>
              <p className="text-soft-gray">IA que vai te acompanhar e escrever junto com você todos os pontos</p>
            </LiquidGlassCard>
          </div>
        </div>

        {/* Core Features */}
        <div className="mb-8 sm:mb-16">
          <h2 className="text-xl sm:text-3xl font-bold text-center text-dark-blue mb-4 sm:mb-6" data-testid="text-core-features-title">
            Funcionalidades que Transformam sua Escrita
          </h2>
          <div className="text-center mb-6 sm:mb-12">
            <p className="text-soft-gray max-w-3xl mx-auto text-base sm:text-lg">
              Nossas funcionalidades são ferramentas pensadas para lhe ensinar e ajudar em toda as etapas da escrita de um texto.
            </p>
          </div>
          
          {/* Pre-writing Tools */}
          <div className="mb-6 sm:mb-12">
            <h3 className="text-lg sm:text-2xl font-semibold text-dark-blue mb-3 sm:mb-6">Ferramentas de Pré-escrita:</h3>
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
              <LiquidGlassCard className="p-4 sm:p-8 feature-card" data-testid="card-repertoire-explorer">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <Search className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Explorador de Repertório</h4>
                </div>
                <p className="text-soft-gray mb-4">
                  Banco de dados conectado a mais de 100 fontes confiáveis que fornece repertório atualizado, dados estatísticos e referências acadêmicas relevantes para enriquecer sua argumentação.
                </p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Acesso a fontes jornalísticas e acadêmicas verificadas</li>
                  <li>• Dados estatísticos atualizados e contextualizados</li>
                  <li>• Citações e referências organizadas por tema</li>
                  <li>• Filtros por área do conhecimento e relevância</li>
                  <li>• Sugestões automáticas baseadas no seu texto</li>
                </ul>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4 sm:p-8 feature-card" data-testid="card-brainstorm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <Lightbulb className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Refinamento do Brainstorming
</h4>
                </div>
                <p className="text-soft-gray mb-4">
                  Sistema que estimula a criatividade e organiza suas ideias através de técnicas de brainstorming estruturado, ajudando a mapear todos os aspectos do tema.
                </p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Técnicas de associação livre e mapeamento mental</li>
                  <li>• Organização automática de ideias por categoria</li>
                  <li>• Estímulos criativos personalizados</li>
                  <li>• Conexões entre diferentes conceitos</li>
                  <li>• Salvamento e recuperação de sessões anteriores</li>
                </ul>
              </LiquidGlassCard>
            </div>
          </div>

          {/* Writing Tools */}
          <div className="mb-6 sm:mb-12">
            <h3 className="text-lg sm:text-2xl font-semibold text-dark-blue mb-3 sm:mb-6">Ferramentas de Escrita:</h3>
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
              <LiquidGlassCard className="p-4 sm:p-8 feature-card" data-testid="card-structure-creator">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <FileText className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Estrutura Coringa Personalizada</h4>
                </div>
                <p className="text-soft-gray mb-4">Sistema que analisa seu estilo de escrita e cria estruturas de redação modelo adaptadas às suas preferências, estilo e ao tipo de prova que você vai fazer.</p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Análise do seu estilo pessoal de escrita</li>
                  <li>• Estruturas adaptadas por tipo de prova (ENEM, vestibulares, concursos)</li>
                  <li>• Templates personalizados </li>
                  <li>• Sugestões de transições e conectivos adequados</li>
                  <li>• Evolução contínua baseada no seu progresso</li>
                </ul>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4 sm:p-8 feature-card" data-testid="card-style-controller">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <Sliders className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Controlador de Escrita</h4>
                </div>
                <p className="text-soft-gray mb-4">Ferramenta interativa que permite ajustar em tempo real a formalidade, argumentação, complexidade vocabular e estilo do seu texto, com visualização imediata das mudanças.</p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Controle dinâmico de formalidade e registro linguístico</li>
                  <li>• Ajuste de complexidade vocabular por nível</li>
                  <li>• Adaptação da estrutura argumentativa</li>
                  <li>• Visualização em tempo real das alterações</li>
                  <li>• Sugestões de melhorias automáticas</li>
                </ul>
              </LiquidGlassCard>

            </div>
          </div>

          

          {/* Simulation and Practice Tools */}
          <div className="mb-6 sm:mb-12">
            <h3 className="text-lg sm:text-2xl font-semibold text-dark-blue mb-3 sm:mb-6">Ferramentas de Simulação e Prática:</h3>
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
              <LiquidGlassCard className="p-4 sm:p-8 feature-card" data-testid="card-exam-simulator">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <Clock className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Simulador de Prova Realista</h4>
                </div>
                <p className="text-soft-gray mb-4">
                  Ambiente de simulação que replica fielmente as condições reais de prova, incluindo cronômetro, interface similar ao exame oficial e limitações de recursos.
                </p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Cronômetro oficial com alertas de tempo</li>
                  <li>• Interface idêntica aos exames reais</li>
                  <li>• Simulação de pressão e condições adversas</li>
                  <li>• Diferentes modalidades (ENEM, vestibulares, concursos)</li>
                  <li>• Relatório de desempenho e tempo gasto por seção</li>
                </ul>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4 sm:p-8 feature-card" data-testid="card-proposal-creator">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <Newspaper className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Explorador de Propostas</h4>
                </div>
                <p className="text-soft-gray mb-4">Sistema que busca por proposta de provas antigas e pode cria propostas de redação customizadas baseadas em temas atuais, seu nível de conhecimento e áreas de interesse, incluindo textos motivadores relevantes.</p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Geração automática baseada em temas da atualidade</li>
                  <li>• Personalização por área de interesse e dificuldade</li>
                  <li>• Textos motivadores atualizados e relevantes</li>
                  <li>• Diferentes tipos de comando (dissertativo, narrativo, carta)</li>
                  <li>• Banco com milhares de propostas categorizadas</li>
                </ul>
              </LiquidGlassCard>
            </div>
          </div>

          {/* Learning and Development Tools */}
          <div>
            <h3 className="text-lg sm:text-2xl font-semibold text-dark-blue mb-3 sm:mb-6">Ferramentas de Aprendizado e Desenvolvimento:</h3>
            <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
              <LiquidGlassCard className="p-4 sm:p-8 feature-card" data-testid="card-progress-tracker">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <BarChart3 className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Acompanhamento de Progresso</h4>
                </div>
                <p className="text-soft-gray mb-4">
                  Dashboard personalizado que monitora sua evolução em todas as competências de escrita, identificando pontos fortes, áreas de melhoria e sugerindo planos de estudo específicos.
                </p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Métricas detalhadas de progresso por competência</li>
                  <li>• Gráficos de evolução temporal e comparativos</li>
                  <li>• Identificação automática de pontos fracos</li>
                  <li>• Sugestões de exercícios e práticas direcionadas</li>
                  <li>• Metas personalizadas e planos de estudo</li>
                </ul>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4 sm:p-8 feature-card" data-testid="card-knowledge-library">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Biblioteca pessoal</h4>
                </div>
                <p className="text-soft-gray mb-4">Salve de forma organize suas redações, propostas, estruturas de redação, repertórios que você desenvolve com o uso da nossa ferramenta e acesse materiais exclusivos.</p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Redações nota 1000 comentadas e analisadas</li>
                  <li>• Teoria gramatical aplicada à redação</li>
                  <li>• Técnicas de escrita e estratégias argumentativas</li>
                  <li>• Materiais organizados por tema e dificuldade</li>
                  <li>• Conteúdo atualizado com tendências dos exames</li>
                </ul>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4 sm:p-8 feature-card" data-testid="card-newsletter">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <Mail className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Newsletter Educacional</h4>
                </div>
                <p className="text-soft-gray mb-4">
                  Receba semanalmente conteúdos exclusivos, dicas de redação, temas atuais e estratégias de estudo enviados diretamente para seu email.
                </p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Temas de redação semanais comentados</li>
                  <li>• receba um resumo das principais noticias</li>
                  <li>• Análises de atualidades relevantes</li>
                  <li>• Estratégias de estudo personalizadas</li>
                  <li>• Conteúdo exclusivo para assinantes</li>
                </ul>
              </LiquidGlassCard>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <LiquidGlassCard className="gradient-bg rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center text-white" data-testid="card-cta">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Pronto para Transformar sua Escrita?</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-white/90">
            Junte-se aos milhares de vestibulandos e concurseiros que já estão transformando sua escrita com o DissertAI
          </p>
          <Button asChild className="bg-white text-dark-blue px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 smooth-transition hover-scale" data-testid="button-try-free">
            <Link href="/signup">Experimente Grátis</Link>
          </Button>
        </LiquidGlassCard>
      </div>
      <Footer />
    </div>
  );
}
