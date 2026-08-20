import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useIntersectionObserver } from 'react-intersection-observer';
import {
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Target,
  Calendar,
  DollarSign,
  BookOpen,
  Trophy,
  Smartphone,
  Globe,
  Lock,
  TrendingUp,
  Heart,
  MessageSquare,
  Play,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { trackEvent, trackPageView } from '../utils/analytics';
import { PricingSection } from './marketing/PricingSection';
import { TestimonialsSection } from './marketing/TestimonialsSection';
import { FeaturesSection } from './marketing/FeaturesSection';
import { NewsletterSignup } from './marketing/NewsletterSignup';
import { SocialProof } from './marketing/SocialProof';

const FEATURES = [
  {
    icon: Target,
    title: 'Gestión de Objetivos',
    description: 'Define, rastrea y alcanza tus metas con nuestro sistema inteligente de objetivos.',
    color: '#10B981'
  },
  {
    icon: BarChart3,
    title: 'Analytics Avanzado',
    description: 'Obtén insights profundos sobre tu productividad y progreso con dashboards interactivos.',
    color: '#3B82F6'
  },
  {
    icon: Clock,
    title: 'Pomodoro Inteligente',
    description: 'Maximiza tu concentración con técnicas de tiempo probadas y gamificación.',
    color: '#F59E0B'
  },
  {
    icon: DollarSign,
    title: 'Control Financiero',
    description: 'Gestiona tus finanzas personales con herramientas profesionales de tracking.',
    color: '#EF4444'
  },
  {
    icon: Calendar,
    title: 'Calendario Inteligente',
    description: 'Organiza tu tiempo con un calendario que se adapta a tu estilo de vida.',
    color: '#8B5CF6'
  },
  {
    icon: BookOpen,
    title: 'Aprendizaje Continuo',
    description: 'Rastrea tu progreso educativo y mantén un registro de tus certificaciones.',
    color: '#EC4899'
  }
];

const TESTIMONIALS = [
  {
    name: 'María González',
    role: 'Emprendedora',
    company: 'TechStart',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    content: 'Personal Hub transformó completamente mi productividad. Ahora puedo gestionar todos mis proyectos desde un solo lugar.',
    rating: 5
  },
  {
    name: 'Carlos Ruiz',
    role: 'Desarrollador Senior',
    company: 'Microsoft',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    content: 'La integración de todas las herramientas que necesito en una sola plataforma es increíble. Mi eficiencia aumentó un 40%.',
    rating: 5
  },
  {
    name: 'Ana Martínez',
    role: 'Product Manager',
    company: 'Spotify',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    content: 'El sistema de objetivos y analytics me ayuda a mantener el foco en lo que realmente importa. Resultados medibles.',
    rating: 5
  }
];

const STATS = [
  { number: '50K+', label: 'Usuarios Activos' },
  { number: '1M+', label: 'Tareas Completadas' },
  { number: '99.9%', label: 'Uptime' },
  { number: '4.9/5', label: 'Rating Promedio' }
];

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { ref: heroRef, inView: heroInView } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  const { ref: featuresRef, inView: featuresInView } = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    trackPageView('/landing');
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Aquí integrarías con tu servicio de email marketing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      
      trackEvent('email_signup', {
        source: 'hero_section',
        email: email
      });
      
      setEmail('');
      alert('¡Gracias! Te hemos agregado a nuestra lista de espera.');
    } catch (error) {
      console.error('Error al suscribirse:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetStarted = () => {
    trackEvent('cta_click', {
      location: 'hero',
      action: 'get_started'
    });
    // Redirigir a registro o demo
    window.location.href = '/register';
  };

  return (
    <>
      <Helmet>
        <title>Personal Hub - Tu Centro de Productividad Personal</title>
        <meta name="description" content="Gestiona objetivos, finanzas, proyectos y más en una sola plataforma. Aumenta tu productividad con Personal Hub." />
        <meta name="keywords" content="productividad, gestión personal, objetivos, finanzas, pomodoro, calendario" />
        <meta property="og:title" content="Personal Hub - Tu Centro de Productividad Personal" />
        <meta property="og:description" content="La plataforma todo-en-uno para gestionar tu vida personal y profesional" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=630&fit=crop" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Personal Hub</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="hover:text-emerald-400 transition-colors">Características</a>
                <a href="#pricing" className="hover:text-emerald-400 transition-colors">Precios</a>
                <a href="#testimonials" className="hover:text-emerald-400 transition-colors">Testimonios</a>
                <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors">
                  Comenzar Gratis
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden bg-gray-900 border-t border-gray-800"
            >
              <div className="px-4 py-4 space-y-4">
                <a href="#features" className="block hover:text-emerald-400 transition-colors">Características</a>
                <a href="#pricing" className="block hover:text-emerald-400 transition-colors">Precios</a>
                <a href="#testimonials" className="block hover:text-emerald-400 transition-colors">Testimonios</a>
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors">
                  Comenzar Gratis
                </button>
              </div>
            </motion.div>
          )}
        </nav>

        {/* Hero Section */}
        <section ref={heroRef} className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={heroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="inline-flex items-center space-x-2 bg-emerald-600/10 border border-emerald-600/20 rounded-full px-4 py-2"
                  >
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">Aumenta tu productividad 10x</span>
                  </motion.div>

                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    Tu Centro de{' '}
                    <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                      Productividad
                    </span>{' '}
                    Personal
                  </h1>

                  <p className="text-xl text-gray-300 leading-relaxed">
                    Gestiona objetivos, finanzas, proyectos y más en una sola plataforma inteligente. 
                    Diseñada para profesionales que buscan maximizar su potencial.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleGetStarted}
                    className="group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <span>Comenzar Gratis</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>

                  <button className="group border border-gray-600 hover:border-gray-500 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-800">
                    <span className="flex items-center justify-center space-x-2">
                      <Play className="h-5 w-5" />
                      <span>Ver Demo</span>
                    </span>
                  </button>
                </div>

                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enviando...' : 'Notificarme'}
                  </button>
                </form>

                <p className="text-sm text-gray-400">
                  Únete a más de 50,000 profesionales que ya usan Personal Hub
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <div className="relative z-10">
                  <img
                    src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop"
                    alt="Personal Hub Dashboard"
                    className="rounded-2xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/20 to-blue-600/20 rounded-2xl" />
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -left-4 bg-emerald-600 p-4 rounded-xl shadow-lg"
                >
                  <Trophy className="h-8 w-8 text-white" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-4 -right-4 bg-blue-600 p-4 rounded-xl shadow-lg"
                >
                  <BarChart3 className="h-8 w-8 text-white" />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <SocialProof stats={STATS} />

        {/* Features Section */}
        <FeaturesSection features={FEATURES} />

        {/* Testimonials */}
        <TestimonialsSection testimonials={TESTIMONIALS} />

        {/* Pricing */}
        <PricingSection />

        {/* Newsletter Signup */}
        <NewsletterSignup />

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">Personal Hub</span>
                </div>
                <p className="text-gray-400">
                  La plataforma todo-en-uno para gestionar tu vida personal y profesional.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Producto</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Empresa</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Sobre nosotros</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Soporte</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Centro de ayuda</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Estado del servicio</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">© 2024 Personal Hub. Todos los derechos reservados.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}