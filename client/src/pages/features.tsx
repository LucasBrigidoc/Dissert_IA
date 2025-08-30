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
  TriangleAlert 
} from "lucide-react";

const iconMap = {
  comments: MessageCircle,
  search: Search,
  edit: Edit,
  newspaper: Newspaper,
  sliders: Sliders,
  "graduation-cap": GraduationCap,
  lightbulb: Lightbulb,
  archive: Archive
};

export default function Features() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-6 pt-24 pb-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-dark-blue mb-4" data-testid="text-features-title">
            Conheça as Principais Funcionalidades
          </h1>
          <p className="text-xl text-soft-gray">Ferramentas inteligentes para revolucionar sua escrita</p>
        </div>

        {/* Hero Feature */}
        <LiquidGlassCard className="rounded-3xl p-12 mb-16" data-testid="card-hero-feature">
          <div className="flex items-center justify-between">
            <div className="w-1/2">
              <h2 className="text-3xl font-bold text-dark-blue mb-4">
                Refine seu processo de escrita com IA
              </h2>
              <p className="text-soft-gray mb-6">
                Nosso sistema é projetado para te ajudar em cada etapa do processo de escrita com funcionalidades que utilizam IA para maximizar seus resultados. Então desde a geração de ideias até a revisão final tenha um professor que vai lhe ajudar a melhorar sua escrita.
              </p>
              <Button asChild className="bg-bright-blue text-white px-6 py-3 rounded-lg hover:bg-blue-600 smooth-transition hover-scale" data-testid="button-try-now">
                <Link href="/signup">Experimente Agora</Link>
              </Button>
            </div>
            <div className="w-1/2 text-center">
              <div className="w-64 h-64 mx-auto gradient-bg rounded-full flex items-center justify-center">
                <Brain className="text-white" size={80} />
              </div>
            </div>
          </div>
        </LiquidGlassCard>

        {/* Challenge Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-dark-blue mb-8" data-testid="text-challenge-title">
            Funcionalidades para os principais Desafio da Escrita
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <LiquidGlassCard className="p-8" data-testid="card-statistics">
              <div className="text-4xl text-red-500 mb-4">73%</div>
              <h3 className="text-xl font-semibold text-dark-blue mb-2">Estatísticas Alarmantes</h3>
              <p className="text-soft-gray">dos estudantes brasileiros têm dificuldade com redação no ENEM</p>
            </LiquidGlassCard>
            <LiquidGlassCard className="p-8" data-testid="card-challenges">
              <div className="text-4xl text-yellow-500 mb-4">
                <TriangleAlert className="mx-auto" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue mb-2">Principais Desafios</h3>
              <p className="text-soft-gray">Falta de estrutura, repertório limitado e gestão de tempo inadequada</p>
            </LiquidGlassCard>
            <LiquidGlassCard className="p-8" data-testid="card-solution">
              <div className="text-4xl text-green-500 mb-4">
                <Lightbulb className="mx-auto" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue mb-2">Nossa Solução</h3>
              <p className="text-soft-gray">IA que vai te acompanhar e escrever junto com você todos os pontos</p>
            </LiquidGlassCard>
          </div>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-dark-blue mb-12" data-testid="text-core-features-title">
            Funcionalidades que Transformam sua Escrita
          </h2>
          
          {/* Pre-writing Tools */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-dark-blue mb-6">Ferramentas de Pré-escrita:</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <LiquidGlassCard className="p-8 feature-card" data-testid="card-argument-architect">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Arquiteto de Argumentos</h4>
                </div>
                <p className="text-soft-gray mb-4">
                  Ferramenta de diálogo socrático que te faz perguntas inteligentes e profundas sobre o tema proposto para você encontrar argumentos sólidos.
                </p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Perguntas personalizadas baseadas no tema</li>
                  <li>• Desenvolvimento de raciocínio crítico</li>
                  <li>• Sugestões de contra-argumentos</li>
                </ul>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-8 feature-card" data-testid="card-repertoire-explorer">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <Search className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Explorador de Repertório</h4>
                </div>
                <p className="text-soft-gray mb-4">
                  Banco de dados inteligente conectado com mais de 50 fontes de notícias, artigos acadêmicos e bases de dados estatísticas atualizadas.
                </p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Conexão com fontes confiáveis</li>
                  <li>• Sugestões contextualizadas</li>
                  <li>• Dados estatísticos relevantes</li>
                </ul>
              </LiquidGlassCard>
            </div>
          </div>

          {/* Writing Tools */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-dark-blue mb-6">Ferramentas de Escrita:</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <LiquidGlassCard className="p-8 feature-card" data-testid="card-structure-creator">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <Edit className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Criador de Estrutura Personalizada</h4>
                </div>
                <p className="text-soft-gray mb-4">
                  A partir da análise do seu estilo de escrita, a IA cria estruturas de redação modelo que incorporam suas preferências e pontos fortes.
                </p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Análise do estilo pessoal</li>
                  <li>• Estruturas personalizadas</li>
                  <li>• Adaptação contínua</li>
                </ul>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-8 feature-card" data-testid="card-style-controller">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-4">
                    <Sliders className="text-white" size={24} />
                  </div>
                  <h4 className="text-xl font-semibold text-dark-blue">Controlador de Estilo</h4>
                </div>
                <p className="text-soft-gray mb-4">
                  Ajustes interativos de formalidade, tom e complexidade vocabular com visualização em tempo real das alterações no texto.
                </p>
                <ul className="text-sm text-soft-gray space-y-1">
                  <li>• Controle de formalidade</li>
                  <li>• Ajuste de complexidade</li>
                  <li>• Visualização em tempo real</li>
                </ul>
              </LiquidGlassCard>
            </div>
          </div>

          {/* Complementary Tools */}
          <div>
            <h3 className="text-2xl font-semibold text-dark-blue mb-6">Ferramentas Complementares:</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <LiquidGlassCard className="p-6 text-center feature-card" data-testid="card-exam-simulator">
                <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-dark-blue mb-2">Simulador de Prova</h4>
                <p className="text-soft-gray text-sm">Ambiente realista com cronômetro e condições idênticas ao exame</p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-6 text-center feature-card" data-testid="card-proposal-creator">
                <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-dark-blue mb-2">Criador de Propostas</h4>
                <p className="text-soft-gray text-sm">Elabore temas personalizados com textos motivadores</p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-6 text-center feature-card" data-testid="card-personal-library">
                <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Archive className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-dark-blue mb-2">Biblioteca Pessoal</h4>
                <p className="text-soft-gray text-sm">Repositório inteligente de todo seu processo de aprendizado</p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-6 text-center feature-card" data-testid="card-educational-newsletter">
                <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Newspaper className="text-white" size={24} />
                </div>
                <h4 className="font-semibold text-dark-blue mb-2">Newsletter Educacional</h4>
                <p className="text-soft-gray text-sm">Curadoria semanal dos temas mais relevantes</p>
              </LiquidGlassCard>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <LiquidGlassCard className="gradient-bg rounded-3xl p-12 text-center text-white" data-testid="card-cta">
          <h2 className="text-3xl font-bold mb-4">Pronto para Transformar sua Escrita?</h2>
          <p className="text-xl mb-8 text-white/90">
            Junte-se aos milhares de vestibulandos e concurseiros que já estão transformando sua escrita com o DissertAI
          </p>
          <Button asChild className="bg-white text-dark-blue px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 smooth-transition hover-scale" data-testid="button-try-free">
            <Link href="/signup">Experimente Grátis</Link>
          </Button>
        </LiquidGlassCard>
      </div>

      <Footer />
    </div>
  );
}
