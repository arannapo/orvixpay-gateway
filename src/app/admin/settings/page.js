"use client";

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'react-hot-toast';
import { KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function AdminSettings() {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const t = (en, es) => (language === 'es' ? es : en);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error(t('All fields are required.', 'Todos los campos son obligatorios.'));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t('New passwords do not match.', 'Las nuevas contraseñas no coinciden.'));
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?/~\\-]).{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      toast.error(t(
        'Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.',
        'La contraseña debe contener al menos 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.'
      ));
      return;
    }

    setLoading(true);
    const toastId = toast.loading(t('Updating password...', 'Actualizando contraseña...'));

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.newPassword })
      });
      const data = await res.json();

      if (data.success) {
        toast.success(t('Password updated successfully!', '¡Contraseña actualizada con éxito!'), { id: toastId });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(data.error || t('Failed to update password.', 'Error al actualizar la contraseña.'), { id: toastId });
      }
    } catch (err) {
      toast.error(t('Network error occurred.', 'Ocurrió un error de red.'), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-lg mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('Admin Portal Settings', 'Configuración de la Cuenta de Administrador')}</h2>
        <p className="text-xs text-slate-400 font-medium">
          {t('Manage password authentication credentials and keep account access secure.', 'Administre las credenciales de contraseña y mantenga seguro el acceso a la cuenta.')}
        </p>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-650 flex items-center justify-center border border-purple-100">
            <KeyRound size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{t('Change System Password', 'Cambiar Contraseña del Sistema')}</h3>
            <p className="text-[11px] text-slate-400 font-medium">{t('Configure a high entropy credential.', 'Configure una credencial de alta entropía.')}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('Current Password', 'Contraseña Actual')}</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-medium text-slate-900 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 focus:outline-none transition-colors"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('New Password', 'Nueva Contraseña')}</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-medium text-slate-900 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 focus:outline-none transition-colors"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('Confirm New Password', 'Confirmar Nueva Contraseña')}</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-medium text-slate-900 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 focus:outline-none transition-colors"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition shadow-md shadow-purple-100 flex items-center justify-center gap-2 font-bold text-sm"
            >
              <ShieldCheck size={16} />
              {loading ? t('Updating...', 'Actualizando...') : t('Update Password', 'Actualizar Contraseña')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
