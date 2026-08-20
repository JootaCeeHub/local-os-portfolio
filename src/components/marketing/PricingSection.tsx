import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Crown, Rocket, ArrowRight } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

const PLANS = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    period: 'Siempre gratis',
    description: 'Perfecto para empezar tu journey de productividad',
    icon: Zap,
    color: 'emerald',
    features: [
      'Hasta 50 tareas',
      'Pomodoro básico',
      'Calendario personal',
      '3 objetivos activos',
      'Finanzas básicas',
      'Soporte por email'
    ],
    limitations: [
      'Sin analytics avanzado',
      'Sin integraciones',
      'Sin colaboración'
    ],
    cta: 'Comenzar Gratis',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    period: '/mes',
    description: 'Para profesionales que buscan maximizar su productividad',
    icon: Crown,
    color: 'blue',
    features: [
      'Tareas ilimitadas',
      'Pomodoro avanzado con estadísticas',
      'Calendario con integraciones',
      'Objetivos ilimitados',
      'Finanzas completas con presupuestos',
      'Analytics detallado',
      'Integraciones básicas',
      'Soporte prioritario',
      'Exportación de datos',
      'Temas personalizados'
    ],
    cta: 'Prueba 14 días gratis',
    popular: true,
    savings: 'Ahorra 20% anual'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    period: '/mes',
    description: 'Para equipos y organizaciones que necesitan colaboración',
    icon: Rocket,
    color: 'purple',
    features: [
      'Todo de Pro',
      'Colaboración en tiempo real',
      'Workspaces compartidos',
      'Analytics de equipo',
      'Integraciones avanzadas',
      'API completa',
      'SSO y seguridad avanzada',
      'Soporte 24/7',
      'Onboarding personalizado',
      'SLA garantizado'
    ],
    cta: 'Contactar Ventas',
    popular: false
  }
];

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handlePlanSelect = (planId: string) => {
    trackEvent('pricing_plan_selected', {
      plan: planId,
      billing_period: billingPeriod
    });

    if (planId === 'free') {
      window.location.href = '/register';
    } else if (planId === 'enterprise') {
      window.location.href = '/contact-sales';
    } else {
      window.location.href = `/checkout?plan=${planId}&billing=${billingPeriod}`;
    }
  };

  const getPrice = (plan: typeof PLANS[0]) => {
    if (plan.price === 0) return 'Gratis';
    
    const price = billingPeriod === 'yearly' ? plan.price * 10 : plan.price;
    return `$${price}`;
  };

  const getPeriod = (plan: typeof PLANS[0]) => {
    if (plan.price === 0) return plan.period;
    return billingPeriod === 'yearly' ? '/año' : plan.period;
  };

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Planes que se adaptan a{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
                tu crecimiento
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Comienza gratis y escala según tus necesidades
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-md transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-md transition-all relative ${
                  billingPeriod === 'yearly'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Anual
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-xs px-2 py-1 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, index) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative bg-gray-800 rounded-2xl p-8 border-2 transition-all duration-300 hover:scale-105 ${
                  isPopular
                    ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Más Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${
                    plan.color === 'emerald' ? 'bg-emerald-600/20' :
                    plan.color === 'blue' ? 'bg-blue-600/20' :
                    'bg-purple-600/20'
                  }`}>
                    <Icon className={`h-8 w-8 ${
                      plan.color === 'emerald' ? 'text-emerald-400' :
                      plan.color === 'blue' ? 'text-blue-400' :
                      'text-purple-400'
                    }`} />
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>

                  <div className="mb-4">
                    <span className="text-4xl font-bold">{getPrice(plan)}</span>
                    <span className="text-gray-400 ml-1">{getPeriod(plan)}</span>
                  </div>

                  {plan.savings && billingPeriod === 'yearly' && (
                    <div className="text-emerald-400 text-sm font-medium">
                      {plan.savings}
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations && (
                  <div className="mb-8">
                    <p className="text-sm text-gray-500 mb-2">Limitaciones:</p>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="text-sm text-gray-500">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                    isPopular
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white transform hover:scale-105'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold mb-2">¿Puedo cambiar de plan en cualquier momento?</h4>
              <p className="text-gray-400">Sí, puedes actualizar o degradar tu plan en cualquier momento desde tu configuración de cuenta.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">¿Hay descuentos para estudiantes?</h4>
              <p className="text-gray-400">Ofrecemos un 50% de descuento en el plan Pro para estudiantes verificados.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">¿Qué métodos de pago aceptan?</h4>
              <p className="text-gray-400">Aceptamos todas las tarjetas de crédito principales y PayPal.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">¿Puedo cancelar en cualquier momento?</h4>
              <p className="text-gray-400">Sí, puedes cancelar tu suscripción en cualquier momento sin penalizaciones.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}