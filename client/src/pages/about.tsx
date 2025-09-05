import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { Button } from "@/components/ui/button";
import { Heart, Lightbulb, Users, Trophy, GraduationCap, Brain } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Hero Section */}
      <section className="gradient-bg pt-20 sm:pt-24 pb-16 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center text-white mb-12">
            <h1 className="font-bold mb-4 text-[45px]" data-testid="text-about-title">Sobre o Dissert AI</h1>
            <p className="text-white/90 text-[24px]">
              Democratizando excelência na escrita para todas as pessoas com foco no vestibular dos alunos do Brasil
            </p>
          </div>
          
          {/* Mission Statement */}
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 -my-8">
            <div className="w-full md:w-1/2 text-center md:text-left text-white">
              <h2 className="sm:text-3xl font-bold sm:mb-6 pt-[0px] pb-[0px] mt-[10px] mb-[10px] text-[65px] text-left">
                Nossa Proposta: Democratizando a Excelência na Escrita
              </h2>
              <p className="text-white/90 sm:mb-6 sm:text-base text-[36px] font-medium mt-[10px] mb-[10px]">
                Sabemos o quão desafiador é dominar a arte da escrita no contexto dos vestibulares brasileiros. Nossa missão é eliminar as barreiras que impedem estudantes de alcançar seu potencial máximo, oferecendo tecnologia de inteligência artificial que funciona como um tutor pessoal disponível 24/7.
              </p>
              <p className="text-white/80 sm:text-base text-[30px] pt-[8px] pb-[8px]">
                Combinamos ciências cognitivas, pedagogia e tecnologia para criar uma experiência de aprendizado que se adapta ao ritmo e estilo único de cada estudante.
              </p>
            </div>
            <div className="w-full md:w-1/2 text-center">
              <div className="mx-auto flex items-center justify-center">
                <img src="/imagem/fimagem3.svg" alt="Ilustração DissertAI" className="w-72 h-72 sm:w-80 sm:h-80 md:w-[22rem] md:h-[22rem] lg:w-[26rem] lg:h-[26rem] -my-0" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 sm:px-6 pb-8 sm:pb-12">

        {/* Our Project */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-dark-blue mb-8 sm:mb-12 pt-[10px] pb-[10px]" data-testid="text-project-title">
            Nosso Projeto:
          </h2>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <LiquidGlassCard className="p-8" data-testid="card-cognitive-technology">
              <h3 className="text-xl font-semibold text-dark-blue mb-4">Tecnologia Cognitiva Avançada</h3>
              <p className="text-soft-gray">
                Desenvolvemos algoritmos que entendem não apenas o que você escreve, mas como você pensa. Nossa IA foi treinada com metodologias neuropsicológicas reconhecidas, incluindo teoria do andaime cognitivo e aprendizagem personalizada baseada em estilos cognitivos únicos para cada estudante brasileiro.
              </p>
            </LiquidGlassCard>
            <LiquidGlassCard className="p-8" data-testid="card-evidence-based-pedagogy">
              <h3 className="text-xl font-semibold text-dark-blue mb-4">Pedagogia Baseada em Evidências</h3>
              <p className="text-soft-gray">
                Cada funcionalidade foi desenhada com base em pesquisas científicas sobre como o cérebro processa informações durante a escrita. Utilizamos métodos comprovados como o diálogo socrático e a metacognição para desenvolver competências fundamentais de forma eficaz.
              </p>
            </LiquidGlassCard>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-dark-blue mb-8 sm:mb-12" data-testid="text-values-title">
            Nossos Valores:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <LiquidGlassCard className="p-6 text-center" data-testid="card-value-empathy">
              <div className="w-16 h-16 bg-bright-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-dark-blue mb-2">Empatia</h3>
              <p className="text-soft-gray text-sm">Entendemos as dificuldades únicas de cada estudante brasileiro</p>
            </LiquidGlassCard>
            <LiquidGlassCard className="p-6 text-center" data-testid="card-value-innovation">
              <div className="w-16 h-16 bg-bright-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-dark-blue mb-2">Inovação</h3>
              <p className="text-soft-gray text-sm">Tecnologia de ponta aplicada à educação brasileira</p>
            </LiquidGlassCard>
            <LiquidGlassCard className="p-6 text-center" data-testid="card-value-democratization">
              <div className="w-16 h-16 bg-bright-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-dark-blue mb-2">Democratização</h3>
              <p className="text-soft-gray text-sm">Acesso igualitário à excelência educacional</p>
            </LiquidGlassCard>
            <LiquidGlassCard className="p-6 text-center" data-testid="card-value-excellence">
              <div className="w-16 h-16 bg-bright-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-dark-blue mb-2">Excelência</h3>
              <p className="text-soft-gray text-sm">Resultados mensuráveis e transformadores</p>
            </LiquidGlassCard>
          </div>
        </div>

        {/* Why DissertAI is Special */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-dark-blue mb-8 sm:mb-12" data-testid="text-why-special-title">
            Por Que o DissertAI é Tão Bom?
          </h2>
          <div className="space-y-6 sm:space-y-8">
            <LiquidGlassCard className="p-8" data-testid="card-neuropsychological-methodology">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-6 mt-1">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-dark-blue mb-3">
                    Metodologia Neuropsicológica de Andaimes Cognitivos
                  </h3>
                  <p className="text-soft-gray">
                    Baseado nas teorias de Vygotsky e Bruner, nosso sistema oferece suporte personalizado que se adapta à zona de desenvolvimento proximal de cada estudante, proporcionando desafios na medida certa para promover crescimento cognitivo acelerado.
                  </p>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-8" data-testid="card-brazilian-ai">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-6 mt-1">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-dark-blue mb-3">
                    IA Treinada Especificamente para o Contexto Brasileiro
                  </h3>
                  <p className="text-soft-gray">
                    Nossa inteligência artificial foi desenvolvida com milhares de redações de vestibulares brasileiros, entendendo nuances culturais, referências nacionais e expectativas específicas de bancas examinadoras como FUVEST, UERJ, e outras instituições renomadas.
                  </p>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard className="p-8" data-testid="card-multidimensional-learning">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-bright-blue rounded-lg flex items-center justify-center mr-6 mt-1">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-dark-blue mb-3">Aprendizagem Multidimensional</h3>
                  <p className="text-soft-gray">
                    Combinamos desenvolvimento de competências técnicas (gramática, estrutura) com habilidades metacognitivas (autoconhecimento, reflexão crítica) e socioemocionais (gestão de ansiedade, autoconfiança), oferecendo formação integral para o sucesso acadêmico e além.
                  </p>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        </div>

        {/* CTA Section */}
        <LiquidGlassCard className="gradient-bg rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center text-white" data-testid="card-mission-cta">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Faça Parte da Nossa Missão</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-white/90">
            Democratizar a excelência na escrita e transformar o futuro educacional do Brasil
          </p>
          <Button asChild className="bg-white text-dark-blue px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 smooth-transition hover-scale" data-testid="button-start-now">
            <Link href="/signup">Começar Agora</Link>
          </Button>
        </LiquidGlassCard>
      </div>
      <Footer />
    </div>
  );
}
