import { Link } from "wouter";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { LiquidGlassCard } from "@/components/liquid-glass-card";
import { HeroCharacter } from "@/components/hero-character";
import { mockFeatures, mockTestimonials } from "@/lib/mock-data";
import { Brain, Book, Clock, MessageCircle, Search, Edit, Newspaper, Sliders, GraduationCap, Lightbulb, Archive, Users } from "lucide-react";

const iconMap = {
  brain: Brain,
  book: Book,
  clock: Clock,
  comments: MessageCircle,
  search: Search,
  edit: Edit,
  newspaper: Newspaper,
  sliders: Sliders,
  "graduation-cap": GraduationCap,
  lightbulb: Lightbulb,
  archive: Archive
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="gradient-bg pt-20 sm:pt-24 pb-12 sm:pb-16 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between min-h-[70vh] sm:min-h-[80vh] gap-8 lg:gap-12">
            <div className="w-full lg:w-1/2 text-white text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6" data-testid="text-hero-title">
                Revolucione Sua Escrita com IA
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4 text-white/90" data-testid="text-hero-subtitle">
                O Dissert AI é seu assistente pessoal 24/7 para dominar a arte de escrever redações incríveis para vestibulares e concursos
              </p>
              <p className="text-base sm:text-lg mb-6 sm:mb-8 text-white/80" data-testid="text-hero-description">
                Sua Redação Nota 1000 Apenas a Passos de Distância 
              </p>
              <Link href="/signup" className="bg-white text-dark-blue px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 smooth-transition hover-scale inline-block" data-testid="button-hero-signup">
                Começar Agora
              </Link>
              <div className="mt-6 sm:mt-8 text-white/70 text-sm sm:text-base" data-testid="text-online-students">
                <Users className="inline mr-2" size={16} />
                <span>Mais de 2.000 estudantes refinando sua escrita</span>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end">
              <div className="hidden sm:block">
                <HeroCharacter variant="default" size="lg" />
              </div>
              <div className="sm:hidden">
                <HeroCharacter variant="default" size="md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenge Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-blue mb-6 sm:mb-8" data-testid="text-challenge-title">
            Por Que mais de 70% dos Estudantes têm Dificuldade com Redação?
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <LiquidGlassCard className="smooth-transition hover-scale">
              <div className="text-4xl text-bright-blue mb-4">
                <Brain className="mx-auto" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue mb-4">Falta de Estrutura</h3>
              <p className="text-soft-gray">Dificuldade em organizar ideias de forma lógica e coerente</p>
            </LiquidGlassCard>
            <LiquidGlassCard className="smooth-transition hover-scale">
              <div className="text-4xl text-bright-blue mb-4">
                <Book className="mx-auto" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue mb-4">Repertório Limitado</h3>
              <p className="text-soft-gray">Falta de referências atualizadas e relevantes para argumentação</p>
            </LiquidGlassCard>
            <LiquidGlassCard className="smooth-transition hover-scale">
              <div className="text-4xl text-bright-blue mb-4">
                <Clock className="mx-auto" size={48} />
              </div>
              <h3 className="text-xl font-semibold text-dark-blue mb-4">Tempo Insuficiente</h3>
              <p className="text-soft-gray">Pressão do tempo limita a capacidade de revisão e aperfeiçoamento</p>
            </LiquidGlassCard>
          </div>
          <Link href="/features" className="bg-bright-blue text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-600 smooth-transition hover-scale inline-block" data-testid="button-discover-solution">
            Descubra a solução com nossas Funcionalidades
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-dark-blue mb-12 sm:mb-16" data-testid="text-features-title">
            Funcionalidades em Destaque
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {mockFeatures
              .filter((feature) => feature.name !== "Newsletter Educacional")
              .map((feature) => {
                const IconComponent = iconMap[feature.icon as keyof typeof iconMap];
                return (
                  <LiquidGlassCard key={feature.id} className="feature-card" data-testid={`card-feature-${feature.id}`}>
                    <div className="text-3xl text-bright-blue mb-4">
                      <IconComponent className="mx-auto" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-dark-blue mb-3">{feature.name}</h3>
                    <p className="text-soft-gray text-sm">{feature.description}</p>
                  </LiquidGlassCard>
                );
              })}</div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-dark-blue mb-12 sm:mb-16" data-testid="text-how-works-title">Como Funciona</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center sm:col-span-2 md:col-span-1" data-testid="step-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-bright-blue rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">1</div>
              <h3 className="text-lg sm:text-xl font-semibold text-dark-blue mb-3 sm:mb-4">Ferramentas de Pré-escrita</h3>
              <p className="text-soft-gray text-sm sm:text-base">Nossa plataforma tem ferramnetas com IA que te ajudam desde o momento inicial de escrever</p>
            </div>
            <div className="text-center" data-testid="step-2">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-bright-blue rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">2</div>
              <h3 className="text-lg sm:text-xl font-semibold text-dark-blue mb-3 sm:mb-4">Pratique com IA</h3>
              <p className="text-soft-gray text-sm sm:text-base">Utilize nosso simulador para praticar em ambiente realista com feedback imediato</p>
            </div>
            <div className="text-center" data-testid="step-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-bright-blue rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6">3</div>
              <h3 className="text-lg sm:text-xl font-semibold text-dark-blue mb-3 sm:mb-4">Evolua continuamente</h3>
              <p className="text-soft-gray text-sm sm:text-base">Acompanhe seu progresso e alcance a nota 1000 com métricas detalhadas</p>
            </div>
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <Link href="/signup" className="bg-bright-blue text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-600 smooth-transition hover-scale inline-block" data-testid="button-start-plan">
              Iniciar Meu Plano de Estudos
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-dark-blue mb-6 sm:mb-8" data-testid="text-testimonials-title">Resultado dos nosso alunos:</h2>
          <div className="text-center mb-8 sm:mb-12">
            <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2" data-testid="text-success-rate">87%</div>
            <p className="text-soft-gray text-sm sm:text-base">dos usuários aumentaram suas notas em média 180 pontos</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {mockTestimonials.map((testimonial) => (
              <LiquidGlassCard key={testimonial.id} className="text-center" data-testid={`testimonial-${testimonial.id}`}>
                <div className="w-16 h-16 bg-bright-blue rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold">
                  {testimonial.initials}
                </div>
                <h4 className="font-semibold text-dark-blue mb-2">{testimonial.name}</h4>
                <p className="text-soft-gray text-sm mb-4">"{testimonial.text}"</p>
                <div className="text-yellow-400" data-testid={`rating-${testimonial.id}`}>
                  {"★".repeat(testimonial.rating)}
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-bg py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" data-testid="text-cta-title">Pronto para Transformar Sua Escrita?</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-white/90" data-testid="text-cta-subtitle">Junte-se a milhares de estudantes que já estão alcançando seus objetivos</p>
          <div className="max-w-sm sm:max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Seu melhor email" 
              className="w-full px-4 py-3 rounded-lg text-dark-blue mb-4 text-sm sm:text-base" 
              data-testid="input-cta-email"
            />
            <Link href="/signup" className="w-full bg-white text-dark-blue px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-gray-100 smooth-transition inline-block" data-testid="button-cta-signup">
              Começar Gratuitamente
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-white/70 mt-4" data-testid="text-trial-info">7 dias grátis. Cancele quando quiser.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
