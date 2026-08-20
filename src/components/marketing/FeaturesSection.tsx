import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Smartphone, Globe, Lock } from 'lucide-react';

interface Feature {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

export function FeaturesSection({ features }: FeaturesSectionProps) {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Todo lo que necesitas en{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              un solo lugar
            </span>
          </h2>
          <p className="text-xl text-gray-300">
            Herramientas poderosas diseñadas para maximizar tu productividad
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105"
              >
                <div
                  className="inline-flex p-3 rounded-xl mb-6"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <Icon className="h-8 w-8" style={{ color: feature.color }} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-emerald-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-8 border border-emerald-600/30"
          >
            <Smartphone className="h-12 w-12 text-emerald-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Mobile First</h3>
            <p className="text-gray-300 mb-4">
              Accede a todas tus herramientas desde cualquier dispositivo. Sincronización en tiempo real.
            </p>
            <button className="flex items-center space-x-2 text-emerald-400 hover:text-emerald-300 transition-colors">
              <span>Descargar app</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-2xl p-8 border border-blue-600/30"
          >
            <Globe className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Integraciones</h3>
            <p className="text-gray-300 mb-4">
              Conecta con tus herramientas favoritas: Google Calendar, Slack, Trello y más.
            </p>
            <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
              <span>Ver integraciones</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl p-8 border border-purple-600/30"
          >
            <Lock className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Seguridad</h3>
            <p className="text-gray-300 mb-4">
              Tus datos están protegidos con encriptación de nivel empresarial y backups automáticos.
            </p>
            <button className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors">
              <span>Más sobre seguridad</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}