import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Award,
  FileText,
  Github,
  ArrowUpRight,
  MapPin,
  Mail,
  Link as LinkIcon,
  Calendar,
  Edit,
  Camera,
  Briefcase,
  GraduationCap,
  Users,
  Star,
  Plus,
  X,
  Save,
  Trash2,
  Globe,
  Check,
  AlertCircle,
  Linkedin,
  Twitter,
  Instagram
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useProfileStore, type ProfileState } from '../store/profile';

export function Profile() {
  const { user } = useAuthStore();
  const profile = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileState>>(profile);
  const [showToast, setShowToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  const handleImageUpload = useCallback((type: 'avatar' | 'banner') => {
    const inputRef = type === 'avatar' ? fileInputRef : bannerInputRef;
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile(prev => ({
          ...prev,
          [type === 'avatar' ? 'avatarUrl' : 'bannerUrl']: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSaveProfile = useCallback(() => {
    try {
      profile.updateProfile(editedProfile);
      setIsEditing(false);
      setShowToast({
        type: 'success',
        message: 'Perfil actualizado correctamente'
      });
      setTimeout(() => setShowToast(null), 3000);
    } catch (error) {
      setShowToast({
        type: 'error',
        message: 'Error al actualizar el perfil'
      });
      setTimeout(() => setShowToast(null), 3000);
    }
  }, [editedProfile, profile]);

  const handleAddEducation = useCallback(() => {
    setEditedProfile(prev => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          id: crypto.randomUUID(),
          degree: '',
          school: '',
          year: ''
        }
      ]
    }));
  }, []);

  const handleRemoveEducation = useCallback((id: string) => {
    setEditedProfile(prev => ({
      ...prev,
      education: prev.education?.filter(edu => edu.id !== id) || []
    }));
  }, []);

  const handleUpdateEducation = useCallback((id: string, field: string, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      education: prev.education?.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ) || []
    }));
  }, []);

  const handleAddSkill = useCallback((skill: string) => {
    if (skill && !editedProfile.skills?.includes(skill)) {
      setEditedProfile(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill]
      }));
    }
  }, [editedProfile.skills]);

  const handleRemoveSkill = useCallback((skill: string) => {
    setEditedProfile(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill) || []
    }));
  }, []);

  const handleAddLanguage = useCallback(() => {
    setEditedProfile(prev => ({
      ...prev,
      languages: [
        ...(prev.languages || []),
        {
          id: crypto.randomUUID(),
          name: '',
          level: 'Básico'
        }
      ]
    }));
  }, []);

  const handleRemoveLanguage = useCallback((id: string) => {
    setEditedProfile(prev => ({
      ...prev,
      languages: prev.languages?.filter(lang => lang.id !== id) || []
    }));
  }, []);

  const handleUpdateLanguage = useCallback((id: string, field: string, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      languages: prev.languages?.map(lang =>
        lang.id === id ? { ...lang, [field]: value } : lang
      ) || []
    }));
  }, []);

  const handleAddSocialLink = useCallback(() => {
    setEditedProfile(prev => ({
      ...prev,
      socialLinks: [
        ...(prev.socialLinks || []),
        {
          platform: '',
          url: ''
        }
      ]
    }));
  }, []);

  const handleRemoveSocialLink = useCallback((index: number) => {
    setEditedProfile(prev => ({
      ...prev,
      socialLinks: prev.socialLinks?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const handleUpdateSocialLink = useCallback((index: number, field: string, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      socialLinks: prev.socialLinks?.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ) || []
    }));
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Banner y Avatar */}
      <div className="relative">
        <div 
          className="h-48 md:h-64 bg-gray-800 rounded-xl overflow-hidden"
          style={profile.bannerUrl ? { backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        >
          {isEditing && (
            <button
              onClick={() => handleImageUpload('banner')}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white"
            >
              <Camera className="h-8 w-8" />
              <span className="ml-2">Cambiar banner</span>
            </button>
          )}
        </div>
        
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <div 
              className="h-32 w-32 rounded-full border-4 border-gray-900 bg-gray-800 overflow-hidden"
              style={profile.avatarUrl ? { backgroundImage: `url(${profile.avatarUrl})`, backgroundSize: 'cover' } : undefined}
            >
              {!profile.avatarUrl && (
                <div className="h-full w-full flex items-center justify-center text-4xl font-bold text-gray-600">
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            {isEditing && (
              <button
                onClick={() => handleImageUpload('avatar')}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full text-white"
              >
                <Camera className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Save className="h-5 w-5" />
                <span>Guardar cambios</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
                <span>Cancelar</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Edit className="h-5 w-5" />
              <span>Editar perfil</span>
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Información personal */}
        <div className="space-y-6">
          {/* Información básica */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Información personal</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Biografía
                  </label>
                  <textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 min-h-[100px]"
                    placeholder="Cuéntanos sobre ti..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={editedProfile.location || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="Ciudad, País"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={editedProfile.company || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="Nombre de la empresa"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Sitio web
                  </label>
                  <input
                    type="url"
                    value={editedProfile.website || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="https://..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span>{user?.name}</span>
                </div>
                {profile.bio && (
                  <p className="text-gray-300">{profile.bio}</p>
                )}
                {profile.location && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <span>{profile.company}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Educación */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Educación</h2>
              {isEditing && (
                <button
                  onClick={handleAddEducation}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {editedProfile.education?.map((edu) => (
                <div key={edu.id} className="relative bg-gray-700/50 rounded-lg p-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          placeholder="Título"
                        />
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => handleUpdateEducation(edu.id, 'school', e.target.value)}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          placeholder="Institución"
                        />
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => handleUpdateEducation(edu.id, 'year', e.target.value)}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          placeholder="Año"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <h3 className="font-medium">{edu.degree}</h3>
                      <p className="text-gray-400">{edu.school}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {(!editedProfile.education || editedProfile.education.length === 0) && (
                <p className="text-gray-500 text-center py-4">
                  No hay información de educación
                </p>
              )}
            </div>
          </div>

          {/* Habilidades */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Habilidades</h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Nueva habilidad"
                    className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSkill((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Nueva habilidad"]') as HTMLInputElement;
                      if (input.value) {
                        handleAddSkill(input.value);
                        input.value = '';
                      }
                    }}
                    className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {editedProfile.skills?.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center space-x-1 bg-gray-700 text-white px-3 py-1 rounded-full"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="p-1 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="bg-gray-700 text-white px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                
                {(!profile.skills || profile.skills.length === 0) && (
                  <p className="text-gray-500 text-center w-full py-4">
                    No hay habilidades registradas
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Idiomas */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Idiomas</h2>
              {isEditing && (
                <button
                  onClick={handleAddLanguage}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {editedProfile.languages?.map((lang) => (
                <div key={lang.id} className="relative bg-gray-700/50 rounded-lg p-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleRemoveLanguage(lang.id)}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={lang.name}
                          onChange={(e) => handleUpdateLanguage(lang.id, 'name', e.target.value)}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          placeholder="Idioma"
                        />
                        <select
                          value={lang.level}
                          onChange={(e) => handleUpdateLanguage(lang.id, 'level', e.target.value)}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        >
                          <option value="Básico">Básico</option>
                          <option value="Intermedio">Intermedio</option>
                          <option value="Avanzado">Avanzado</option>
                          <option value="Nativo">Nativo</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>{lang.name}</span>
                      <span className="text-gray-400">{lang.level}</span>
                    </div>
                  )}
                </div>
              ))}
              
              {(!editedProfile.languages || editedProfile.languages.length === 0) && (
                <p className="text-gray-500 text-center py-4">
                  No hay idiomas registrados
                </p>
              )}
            </div>
          </div>

          {/* Redes sociales */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Redes sociales</h2>
              {isEditing && (
                <button
                  onClick={handleAddSocialLink}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {editedProfile.socialLinks?.map((link, index) => (
                <div key={index} className="relative bg-gray-700/50 rounded-lg p-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleRemoveSocialLink(index)}
                        className="absolute top-2 right-2 p-1 hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="space-y-2">
                        <select
                          value={link.platform}
                          onChange={(e) => handleUpdateSocialLink(index, 'platform', e.target.value)}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                        >
                          <option value="">Selecciona una plataforma</option>
                          <option value="github">GitHub</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="twitter">Twitter</option>
                          <option value="instagram">Instagram</option>
                        </select>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleUpdateSocialLink(index, 'url', e.target.value)}
                          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                          placeholder="URL del perfil"
                        />
                      </div>
                    </>
                  ) : (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-gray-300 hover:text-emerald-400 transition-colors"
                    >
                      {link.platform === 'github' && <Github className="h-5 w-5" />}
                      {link.platform === 'linkedin' && <Linkedin className="h-5 w-5" />}
                      {link.platform === 'twitter' && <Twitter className="h-5 w-5" />}
                      {link.platform === 'instagram' && <Instagram className="h-5 w-5" />}
                      <span>{link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</span>
                    </a>
                  )}
                </div>
              ))}
              
              {(!editedProfile.socialLinks || editedProfile.socialLinks.length === 0) && (
                <p className="text-gray-500 text-center py-4">
                  No hay redes sociales registradas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Columna central y derecha - Portfolio y otros datos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portfolio */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Portfolio</h2>
              {isEditing && (
                <button className="btn">
                  <Plus className="h-5 w-5 mr-2" />
                  Nuevo proyecto
                </button>
              )}
            </div>

            {/* Filtros de categoría */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === null
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Todos
              </button>
              {editedProfile.portfolio?.categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Grid de proyectos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editedProfile.portfolio?.items
                .filter(item => !selectedCategory || item.category === selectedCategory)
                .map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-gray-700 rounded-lg overflow-hidden"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-lg font-medium text-white">{item.title}</h3>
                      <p className="text-sm text-gray-300">{item.description}</p>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          Ver proyecto
                          <ArrowUpRight className="h-4 w-4 ml-1" />
                        </a>
                      )}
                    </div>
                    {isEditing && (
                      <div className="absolute top-2 right-2 space-x-2">
                        <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {(!editedProfile.portfolio?.items || editedProfile.portfolio.items.length === 0) && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No hay proyectos en el portfolio
                </h3>
                <p className="text-gray-500">
                  {isEditing
                    ? 'Haz clic en "Nuevo proyecto" para agregar tu primer proyecto'
                    : 'Aún no se han agregado proyectos al portfolio'}
                </p>
              </div>
            )}
          </div>

          {/* Logros */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Logros</h2>
              {isEditing && (
                <button className="btn">
                  <Plus className="h-5 w-5 mr-2" />
                  Nuevo logro
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editedProfile.achievements?.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gray-700/50 rounded-lg p-4 flex items-start space-x-4"
                >
                  <div className="p-3 bg-emerald-600/20 rounded-lg">
                    <Award className="h-6  w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{achievement.title}</h3>
                    <p className="text-sm text-gray-400">{achievement.description}</p>
                    <span className="text-xs text-gray-500">{achievement.date}</span>
                  </div>
                  {isEditing && (
                    <div className="ml-auto space-x-2">
                      <button className="p-1 hover:text-emerald-400 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {(!editedProfile.achievements || editedProfile.achievements.length === 0) && (
              <div className="text-center py-12">
                <Award className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No hay logros registrados
                </h3>
                <p className="text-gray-500">
                  {isEditing
                    ? 'Haz clic en "Nuevo logro" para registrar tu primer logro'
                    : 'Aún no se han registrado logros'}
                </p>
              </div>
            )}
          </div>

          {/* Testimonios */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Testimonios</h2>
              {isEditing && (
                <button className="btn">
                  <Plus className="h-5 w-5 mr-2" />
                  Nuevo testimonio
                </button>
              )}
            </div>

            <div className="space-y-4">
              {editedProfile.testimonials?.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-gray-700/50 rounded-lg p-6"
                >
                  <p className="text-gray-300 italic mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{testimonial.author}</h4>
                      <p className="text-sm text-gray-400">
                        {testimonial.role} en {testimonial.company}
                      </p>
                    </div>
                    {isEditing && (
                      <div className="space-x-2">
                        <button className="p-2 hover:bg-gray-600 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-600 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {(!editedProfile.testimonials || editedProfile.testimonials.length === 0) && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No hay testimonios
                </h3>
                <p className="text-gray-500">
                  {isEditing
                    ? 'Haz clic en "Nuevo testimonio" para agregar tu primer testimonio'
                    : 'Aún no se han agregado testimonios'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      {showToast && (
        <div 
          className={`fixed bottom-4 right-4 flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
            showToast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {showToast.type === 'success' ? (
            <Check className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{showToast.message}</span>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'avatar')}
      />
      <input
        type="file"
        ref={bannerInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'banner')}
      />
    </div>
  );
}