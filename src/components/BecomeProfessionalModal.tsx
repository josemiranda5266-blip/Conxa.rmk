import React, { useState } from 'react';
import { X, Wrench, ShieldCheck, CheckCircle2, Sparkles, MapPin, Clock, Award, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INITIAL_PROFESSIONS } from '../data/mockData';
import { auth, db, cleanFirestoreData } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface BecomeProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BecomeProfessionalModal: React.FC<BecomeProfessionalModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, setCurrentUser, trackEvent } = useApp();

  const [professionName, setProfessionName] = useState(currentUser.professionName || 'Electricista Matriculado');
  const [businessName, setBusinessName] = useState(currentUser.businessName || '');
  const [specialtiesText, setSpecialtiesText] = useState((currentUser.specialties || ['Instalaciones domiciliarias', 'Reparaciones']).join(', '));
  const [description, setDescription] = useState(currentUser.description || '');
  const [workZoneRadiusKm, setWorkZoneRadiusKm] = useState(currentUser.workZoneRadiusKm || 20);
  const [workHours, setWorkHours] = useState(currentUser.workHours || 'Lunes a Sábado de 08:00 a 19:00');
  const [matriculaOrDegree, setMatriculaOrDegree] = useState(currentUser.matriculaOrDegree || '');
  const [hourlyRateArs, setHourlyRateArs] = useState<number>(currentUser.hourlyRateArs || 15000);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedSpecialties = specialtiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const targetUid = auth?.currentUser?.uid || currentUser.id;
    const safeRole = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN' ? currentUser.role : 'PROFESSIONAL' as const;

    const updatedUser = {
      ...currentUser,
      id: targetUid,
      isProfessional: true,
      hasProfessionalProfile: true,
      hasClientProfile: true,
      activeMode: 'PROFESSIONAL' as const,
      role: safeRole,
      professionName,
      businessName: businessName || `${professionName} ${currentUser.name.split(' ')[0]}`,
      specialties: updatedSpecialties.length > 0 ? updatedSpecialties : ['Atención rápida', 'Presupuestos sin cargo'],
      description: description || `Servicios profesionales de ${professionName} en Santiago del Estero y zonas aledañas. Atendido directamente por ${currentUser.name}.`,
      workZoneRadiusKm: Number(workZoneRadiusKm),
      workHours,
      matriculaOrDegree,
      hourlyRateArs: Number(hourlyRateArs),
      availabilityStatus: 'DISPONIBLE' as const
    };

    if (auth?.currentUser && db) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, cleanFirestoreData(updatedUser), { merge: true });
        console.log('[CONEXA PROFILE] Perfil profesional guardado en Firestore para UID:', auth.currentUser.uid);
      } catch (err) {
        console.error('[CONEXA PROFILE] Error guardando en Firestore:', err);
      }
    }

    setCurrentUser(updatedUser);
    trackEvent('became_professional', { userId: targetUid, professionName });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
            <Wrench size={24} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Perfil Profesional
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {currentUser.hasProfessionalProfile ? 'Editar mi Perfil Profesional' : 'Convertite en Profesional'}
            </h2>
            <p className="text-xs text-slate-500">
              Completá tus datos de servicio para empezar a recibir solicitudes en Santiago del Estero.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Profession Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-xs">
              Profesión u Oficio Principal *
            </label>
            <select
              value={professionName}
              onChange={(e) => setProfessionName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              {INITIAL_PROFESSIONS.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
              <option value="Otro Oficio / Técnico">Otro Oficio / Técnico Especializado</option>
            </select>
          </div>

          {/* Business / Brand Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs">
                Nombre de Fantasía o Nombre Comercial
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej: ElectroServicios Morales"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs">
                Precio Aproximado por Hora / Visita ($ ARS)
              </label>
              <input
                type="number"
                value={hourlyRateArs}
                onChange={(e) => setHourlyRateArs(Number(e.target.value))}
                placeholder="15000"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-xs">
              Especialidades (separadas por coma)
            </label>
            <input
              type="text"
              value={specialtiesText}
              onChange={(e) => setSpecialtiesText(e.target.value)}
              placeholder="Ej: Instalación de luminarias, Cortocircuitos, Tableros trifásicos"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-800 text-xs">
              Descripción Corta de tus Servicios y Experiencia
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contanos tus años de experiencia, trabajos que realizás, garantías que ofrecés y zonas que cubrís..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Work Zone & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <MapPin size={13} className="text-emerald-600" />
                Radio Cobertura (km)
              </label>
              <select
                value={workZoneRadiusKm}
                onChange={(e) => setWorkZoneRadiusKm(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={10}>10 km (Solo Ciudad Centro)</option>
                <option value={20}>20 km (Santiago del Estero + La Banda)</option>
                <option value={35}>35 km (Gran Santiago y alrededores)</option>
                <option value={50}>50 km (Toda la provincia)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1">
                <Clock size={13} className="text-emerald-600" />
                Horarios de Atención
              </label>
              <input
                type="text"
                value={workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                placeholder="Lun a Vie de 8 a 19hs / Urgencias 24hs"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Verification Credentials */}
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
            <label className="font-bold text-emerald-950 text-xs flex items-center gap-1">
              <Award size={15} className="text-emerald-600" />
              Matrícula / Registro / Título (Opcional)
            </label>
            <input
              type="text"
              value={matriculaOrDegree}
              onChange={(e) => setMatriculaOrDegree(e.target.value)}
              placeholder="Ej: Matrícula COPIT N° 4412 / Registro Municipal de Oficios"
              className="w-full p-2.5 bg-white border border-emerald-300/80 rounded-xl font-medium text-slate-900 focus:outline-none"
            />
            <p className="text-[11px] text-emerald-800">
              💡 Podrás adjuntar foto de tu matrícula o certificado para obtener la insignia de <strong>Profesional Verificado 🔵</strong>.
            </p>
          </div>

          {/* Privacy reminder */}
          <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200 text-slate-600 text-[11px]">
            🔒 <strong>Protección de Privacidad:</strong> Tu domicilio particular nunca será público. Solo se compartirá tu zona aproximada de trabajo ({workZoneRadiusKm}km).
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              <span>GUARDAR PERFIL PROFESIONAL</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
