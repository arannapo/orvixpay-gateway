"use client";

import { useState, useEffect } from 'react';
import { Upload, CheckCircle2, User, Lock, Palette, Link2, Globe, Key, Copy, Eye, EyeOff, Check, AlertCircle, Plus, Trash2, ShieldCheck, Fingerprint, Code, FileText } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

export default function SettingsPage() {
  const { t, language } = useLanguage();
  
  const s = {
    emailAddress: language === 'es' ? 'Dirección de Correo' : 'Email Address',
    emailDesc: language === 'es' ? 'Actualice la dirección de correo electrónico asociada con su espacio de trabajo.' : 'Update the email address associated with your merchant workspace.',
    workspaceEmail: language === 'es' ? 'Correo Electrónico de Trabajo' : 'Workspace Email Address',
    updateEmailBtn: language === 'es' ? 'Actualizar Correo' : 'Update Email',
    updating: language === 'es' ? 'Actualizando...' : 'Updating...',
    changePassword: language === 'es' ? 'Cambiar Contraseña' : 'Change Password',
    changePasswordDesc: language === 'es' ? 'Actualice la contraseña de su cuenta regularmente para mantener la seguridad.' : 'Update your account password regularly to keep your workspace secure.',
    newPassword: language === 'es' ? 'Nueva Contraseña' : 'New Password',
    passRequirements: language === 'es' ? 'Requisitos de Fuerza de Contraseña:' : 'Password Strength Requirements:',
    minChars: language === 'es' ? '8+ caracteres' : '8+ characters',
    oneUpper: language === 'es' ? '1 letra mayúscula' : '1 uppercase letter',
    oneNum: language === 'es' ? '1 número' : '1 number',
    oneSpecial: language === 'es' ? '1 carácter especial' : '1 special character',
    twoFactor: language === 'es' ? 'Autenticación de Dos Factores' : 'Two-Factor Authentication',
    twoFactorDesc: language === 'es' ? 'Proteja su cuenta con una capa adicional de seguridad usando Google Authenticator.' : 'Protect your workspace with an extra layer of security using Google Authenticator.',
    active: language === 'es' ? 'Activo' : 'Active',
    disabled: language === 'es' ? 'Desactivado' : 'Disabled',
    authenticatorApp: language === 'es' ? 'Aplicación Autenticadora (TOTP)' : 'Authenticator App (TOTP)',
    authenticatorDesc: language === 'es' ? 'Use una aplicación de autenticación para generar códigos de verificación (OTP).' : 'Use an authenticator application to generate verification codes (OTP).',
    disable2FA: language === 'es' ? 'Desactivar 2FA' : 'Disable 2FA',
    enable2FA: language === 'es' ? 'Activar 2FA' : 'Enable 2FA',
    loading: language === 'es' ? 'Cargando...' : 'Loading...',
    loadingKeys: language === 'es' ? 'Cargando claves...' : 'Loading keys...',
    noKeysFound: language === 'es' ? 'No se encontraron claves API' : 'No API Keys Found',
    noKeysDesc: language === 'es' ? 'Genere su primera clave API para comenzar a crear facturas programáticamente.' : 'Generate your first API key to start creating crypto invoices programmatically.',
    createdOn: language === 'es' ? 'Creado el' : 'Created on',
    secretKey: language === 'es' ? 'Clave Secreta' : 'Secret Key',
    maskedSecurity: language === 'es' ? 'Oculta por seguridad' : 'Masked for security',
    deleteKeyTitle: language === 'es' ? 'Eliminar Clave API' : 'Delete API Key',
    deleteKeyConfirm: language === 'es' ? '¿Está seguro de que desea eliminar esta clave API? Esta acción es permanente e invalidará las integraciones conectadas.' : 'Are you sure you want to delete this API key? This action is permanent and will instantly break any connected integrations.',
    cancel: language === 'es' ? 'Cancelar' : 'Cancel',
    delete: language === 'es' ? 'Eliminar' : 'Delete',
    createKeyTitle: language === 'es' ? 'Crear Clave API' : 'Create API Key',
    createKeyDesc: language === 'es' ? 'Ingrese un nombre para identificar esta clave.' : 'Enter a name to identify this key.',
    productionPlaceholder: language === 'es' ? 'ej. Servidor de Producción' : 'e.g. Production Server',
    generate: language === 'es' ? 'Generar' : 'Generate',
    creating: language === 'es' ? 'Creando...' : 'Creating...',
    copySecretKeyTitle: language === 'es' ? 'Copie su Clave Secreta' : 'Copy your Secret Key',
    copySecretKeyDesc: language === 'es' ? 'Por seguridad, esta clave solo se muestra una vez. Asegúrese de copiarla ahora.' : 'For security, this key is only shown once. Make sure to copy it now. You will not be able to see it again.',
    copiedBtn: language === 'es' ? 'He copiado la clave' : "I've Copied the Key",
    enable2FATitle: language === 'es' ? 'Activar 2FA' : 'Enable 2FA',
    enable2FASub: language === 'es' ? 'Escanee el código QR con Google Authenticator.' : 'Scan the QR code with Google Authenticator.',
    manualEntryCode: language === 'es' ? 'Código de entrada manual' : 'Manual Entry Code',
    verificationCode: language === 'es' ? 'Código de Verificación' : 'Verification Code',
    verify: language === 'es' ? 'Verificar' : 'Verify',
    verifyIdentity: language === 'es' ? 'Verificar Identidad' : 'Verify Identity',
    verifyIdentityDesc: language === 'es' ? 'Hemos enviado un código de verificación de 6 dígitos a su correo electrónico.' : 'We\'ve sent a 6-digit verification code to your email.',
    confirm: language === 'es' ? 'Confirmar' : 'Confirm',
    verifying: language === 'es' ? 'Verificando...' : 'Verifying...',
    customerRedirects: language === 'es' ? 'Redirecciones de Clientes' : 'Customer Redirects',
    successRedirectUrl: language === 'es' ? 'URL de redirección de éxito' : 'Success Redirect URL',
    cancelRedirectUrl: language === 'es' ? 'URL de redirección de cancelación' : 'Cancel Redirect URL',
    webhookEndpoint: language === 'es' ? 'Endpoint de Webhook' : 'Webhook Endpoint',
    testConnection: language === 'es' ? 'Probar Conexión' : 'Test Connection',
    testing: language === 'es' ? 'Probando...' : 'Testing...',
    webhookDesc: language === 'es' ? 'Enviaremos una solicitud POST con los detalles del pago cuando una factura cambie al estado Pagada.' : 'We will send a POST request with invoice details whenever an invoice changes status to Paid.',
    customHeaders: language === 'es' ? 'Encabezados Personalizados (Opcional)' : 'Custom Headers (Optional)',
    addHeader: language === 'es' ? 'Agregar Encabezado' : 'Add Header',
    headerKeyPlaceholder: language === 'es' ? 'Clave (ej. Authorization)' : 'Header Key (e.g. Authorization)',
    headerValuePlaceholder: language === 'es' ? 'Valor (ej. Bearer token...)' : 'Value (e.g. Bearer token...)',
    saveConfig: language === 'es' ? 'Guardar Configuración' : 'Save Configuration',
    saving: language === 'es' ? 'Guardando...' : 'Saving...',
    whatWasSent: language === 'es' ? 'Datos Enviados (Request Payload)' : 'What Was Sent (Request Payload)',
    responseStatus: language === 'es' ? 'Estado de Respuesta:' : 'Response Status:',
    disable2FAConfirmTitle: language === 'es' ? '¿Desactivar Autenticación de Dos Factores?' : 'Disable Two-Factor Auth?',
    disable2FAConfirmDesc: language === 'es' ? 'Esto eliminará la capa adicional de seguridad de su cuenta. Cualquiera con su contraseña podrá iniciar sesión.' : 'This will remove the extra layer of security from your account. Anyone with your password will be able to log in directly.',
    disable2FAWarningBadge: language === 'es' ? 'Recomendamos encarecidamente mantener 2FA activado para proteger su cuenta de comercio y sus fondos.' : 'We strongly recommend keeping 2FA enabled to protect your merchant account and funds.',
    keepEnabled: language === 'es' ? 'Mantener Activado' : 'Keep Enabled',
    yesDisable: language === 'es' ? 'Sí, Desactivar' : 'Yes, Disable'
  };

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabling2FA, setEnabling2FA] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('account');
  
  // API Keys state
  const [keys, setKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [visibleSecrets, setVisibleSecrets] = useState({});
  const [keyToDelete, setKeyToDelete] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [originalWallet, setOriginalWallet] = useState('');
 
  const [formData, setFormData] = useState({
    merchantWallet: '',
    webhookUrl: '',
    successUrl: '',
    cancelUrl: '',
    logo: '',
    businessName: '',
    website: '',
    webhookHeaders: [{ key: 'Content-Type', value: 'application/json' }]
  });

  const [passwordForm, setPasswordForm] = useState({
    password: ''
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Security Email & 2FA State
  const [emailForm, setEmailForm] = useState({
    email: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDisable2FAConfirm, setShowDisable2FAConfirm] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchKeys();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/user/settings');
      const data = await res.json();
      if (data.success && data.user) {
        setFormData({
          merchantWallet: data.user.merchantWallet || '',
          webhookUrl: data.user.webhookUrl || '',
          successUrl: data.user.successUrl || '',
          cancelUrl: data.user.cancelUrl || '',
          logo: data.user.logo || '',
          businessName: data.user.businessName || '',
          website: data.user.website || '',
          webhookHeaders: data.user.webhookHeaders && data.user.webhookHeaders.length > 0 
            ? data.user.webhookHeaders 
            : [{ key: 'Content-Type', value: 'application/json' }]
        });
        setOriginalWallet(data.user.merchantWallet || '');
        setEmailForm({
          email: data.user.email || ''
        });
        setTwoFactorEnabled(data.user.twoFactorEnabled || false);
        setTwoFactorSecret(data.user.twoFactorSecret || '');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKeys = async () => {
    try {
      const res = await fetch('/api/api-key/list');
      const data = await res.json();
      if (data.success) {
        setKeys(data.apiKeys);
      }
    } catch (error) {
      console.error('Error fetching API keys', error);
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleGenerate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newKeyName || newKeyName.trim() === '') {
      toast.error('Key name is required');
      return;
    }
    setGenerating(true);
    const toastId = toast.loading('Generating API key...');
    try {
      const res = await fetch('/api/api-key/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      });
      const data = await res.json();
      if (data.success) {
        setNewlyCreatedKey(data.apiKey);

        const last4 = data.apiKey.secretKey.substring(data.apiKey.secretKey.length - 4);
        const maskedKey = {
          ...data.apiKey,
          secretKey: `••••••••••••••••••••••••••••${last4}`
        };
        setKeys([maskedKey, ...keys]);

        setShowCreateModal(false);
        setNewKeyName('');
        toast.success('API Key generated successfully!', { id: toastId });
      } else {
        toast.error(data.error || 'Failed to generate key', { id: toastId });
      }
    } catch (error) {
      toast.error('Error generating key', { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const copyKeyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleSecret = (id) => {
    setVisibleSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteKey = (id) => {
    setKeyToDelete(id);
  };

  const confirmDeleteKey = async (id) => {
    const toastId = toast.loading('Deleting API key...');
    try {
      const res = await fetch('/api/api-key/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setKeys(keys.filter(k => k._id !== id));
        toast.success('API key deleted successfully!', { id: toastId });
      } else {
        toast.error(data.error || 'Failed to delete API key', { id: toastId });
      }
    } catch (error) {
      toast.error('Error deleting API key', { id: toastId });
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    const data = new FormData();
    data.append('file', file);
    if (formData.logo) {
      data.append('oldLogoUrl', formData.logo);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      if (result.success) {
        setFormData({ ...formData, logo: result.url });
        toast.success('Logo uploaded successfully!');
        window.dispatchEvent(new CustomEvent('logoUpdated', { detail: result.url }));
        
        // Auto-save the new logo
        try {
          const saveRes = await fetch('/api/user/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ logo: result.url })
          });
          const saveData = await saveRes.json();
          if (!saveData.success) {
            toast.error(saveData.error || 'Failed to auto-save logo');
          }
        } catch (e) {
          toast.error('Error auto-saving logo');
        }
      } else {
        toast.error(result.error || 'Failed to upload logo.');
      }
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error('Error uploading image.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isWalletChanged = formData.merchantWallet.trim() !== originalWallet.trim();

    if (activeTab === 'account' && isWalletChanged) {
      if (formData.merchantWallet.trim() !== '') {
        const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(formData.merchantWallet.trim());
        if (!isValidAddress) {
          toast.error('Invalid receiving wallet address. Must be a valid EVM address (0x...).');
          return;
        }
      }
      triggerOtpVerification({ type: 'change_wallet', data: { ...formData, merchantWallet: formData.merchantWallet.trim() } });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!formData.webhookUrl) {
      toast.error('Please enter a Webhook URL first');
      return;
    }
    setTestingWebhook(true);
    setTestResponse(null);
    const toastId = toast.loading('Testing webhook...');
    try {
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          webhookUrl: formData.webhookUrl,
          headers: (formData.webhookHeaders || []).filter(h => h.key.trim() !== '')
        })
      });
      const data = await res.json();
      setTestResponse({
        status: data.status || (data.success ? 200 : res.status),
        body: data.data || data.error,
        success: data.success,
        sent: data.sent
      });

      if (data.success) {
        toast.success(`Success! Webhook responded with status ${data.status}`, { id: toastId });
      } else {
        toast.error(data.error || 'Webhook test failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error testing webhook', { id: toastId });
      setTestResponse({ status: 'Error', body: 'Network error or timeout.', success: false });
    } finally {
      setTestingWebhook(false);
    }
  };

  const triggerOtpVerification = async (action) => {
    setPendingAction(action);
    setSendingOtp(true);
    const toastId = toast.loading('Sending verification code to your email...');
    try {
      const res = await fetch('/api/user/otp/send', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setShowOtpModal(true);
        toast.success('Verification code sent to your email!', { id: toastId });
      } else {
        toast.error(data.error || 'Failed to send verification code', { id: toastId });
      }
    } catch (err) {
      toast.error('Error sending verification code', { id: toastId });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleConfirmOtpChange = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!emailVerificationCode || emailVerificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }
    setSaving(true);
    const toastId = toast.loading('Verifying and saving changes...');
    try {
      let bodyData = { code: emailVerificationCode };
      if (pendingAction.type === 'change_email') {
        bodyData.email = pendingAction.data.email;
      } else if (pendingAction.type === 'change_password') {
        bodyData.password = pendingAction.data.password;
      } else if (pendingAction.type === 'change_wallet') {
        bodyData = { ...bodyData, ...pendingAction.data };
      }

      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (data.success) {
        if (pendingAction.type === 'change_email') {
          toast.success('Email updated successfully!', { id: toastId });
        } else if (pendingAction.type === 'change_password') {
          toast.success('Password updated successfully!', { id: toastId });
          setPasswordForm({ password: '' });
        } else if (pendingAction.type === 'change_wallet') {
          toast.success('Wallet and settings saved successfully!', { id: toastId });
          setOriginalWallet(pendingAction.data.merchantWallet);
          fetchSettings();
        }
        setShowOtpModal(false);
        setEmailVerificationCode('');
        setPendingAction(null);
      } else {
        toast.error(data.error || 'Verification failed', { id: toastId });
      }
    } catch (err) {
      toast.error('Error saving changes', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.password) return;
    triggerOtpVerification({ type: 'change_password', data: { password: passwordForm.password } });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailForm.email) return;
    triggerOtpVerification({ type: 'change_email', data: { email: emailForm.email } });
  };

  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      setShowDisable2FAConfirm(true);
    } else {
      handleToggle2FAEnable();
    }
  };

  const confirmDisable2FA = async () => {
    setShowDisable2FAConfirm(false);
    setSaving(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twoFactorEnabled: false, twoFactorSecret: '' })
      });
      const data = await res.json();
      if (data.success) {
        setTwoFactorEnabled(false);
        setTwoFactorSecret('');
        setQrCodeUrl('');
        toast.success('Two-factor authentication disabled.');
      } else {
        toast.error(data.error || 'Failed to update 2FA status');
      }
    } catch (error) {
      toast.error('Error updating 2FA');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FAEnable = async () => {
    setEnabling2FA(true);
    try {
      const res = await fetch('/api/user/2fa/generate');
      const data = await res.json();
      if (data.success) {
        setTwoFactorSecret(data.secret);
        setQrCodeUrl(data.qrCodeUrl);
        setShow2FAModal(true);
      } else {
        toast.error(data.error || 'Failed to load 2FA configuration');
      }
    } catch (err) {
      toast.error('Error connecting to authentication service');
    } finally {
      setEnabling2FA(false);
    }
  };


  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setSaving(true);
    const toastId = toast.loading('Enabling 2FA...');
    try {
      const res = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: twoFactorSecret, code: otpCode })
      });
      const data = await res.json();
      if (data.success) {
        setTwoFactorEnabled(true);
        setShow2FAModal(false);
        setOtpCode('');
        toast.success('Two-factor authentication enabled successfully!', { id: toastId });
      } else {
        toast.error(data.error || 'Failed to verify OTP code', { id: toastId });
      }
    } catch (error) {
      toast.error('Error verifying 2FA', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 items-start mt-2 animate-pulse">
        {/* Sidebar Navigation Skeleton */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 border-b lg:border-b-0 border-slate-100">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-200/60 rounded-xl w-32 lg:w-full shrink-0"></div>
          ))}
        </div>

        {/* Main Settings Card Skeleton */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-h-[520px] w-full space-y-6">
          <div className="space-y-2">
            <div className="h-6 bg-slate-200/60 rounded w-48"></div>
            <div className="h-4 bg-slate-200/60 rounded w-72"></div>
          </div>

          <div className="space-y-6 pt-4">
            {/* Logo Upload Section Skeleton */}
            <div className="flex items-center gap-6 p-6 bg-slate-50/50 border border-slate-200/60 rounded-2xl">
              <div className="w-20 h-20 bg-slate-200/60 rounded-2xl shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-8 bg-slate-200/60 rounded-full w-28"></div>
                <div className="h-3 bg-slate-200/60 rounded w-40"></div>
              </div>
            </div>

            {/* Inputs Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200/60 rounded w-24"></div>
                <div className="h-12 bg-slate-200/60 rounded-xl w-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200/60 rounded w-24"></div>
                <div className="h-12 bg-slate-200/60 rounded-xl w-full"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-4 bg-slate-200/60 rounded w-40"></div>
              <div className="h-12 bg-slate-200/60 rounded-xl w-full"></div>
              <div className="h-3 bg-slate-200/60 rounded w-72"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'account', label: language === 'es' ? 'Cuenta' : 'Account', icon: User },
    { id: 'security', label: language === 'es' ? 'Seguridad' : 'Security', icon: Lock },
    { id: 'apikeys', label: language === 'es' ? 'Claves API' : 'API Keys', icon: Key },
    { id: 'webhooks', label: language === 'es' ? 'Opciones de Desarrollador' : 'Developer Options', icon: Code },
  ];

  const passwordVal = passwordForm.password || '';
  const hasMinLength = passwordVal.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordVal);
  const hasNumber = /[0-9]/.test(passwordVal);
  const hasSpecial = /[!@#$%^&*()_+={}\[\]:;<>,.?/~\\-]/.test(passwordVal);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecial;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start mt-2">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-4 lg:pb-0 border-b lg:border-b-0 border-slate-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-slate-100 text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-55 hover:text-slate-800'
              }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-slate-900' : 'text-slate-400'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Settings Panel */}
      <div className="flex-1 bg-white min-h-[520px] w-full flex flex-col relative">
        {/* Dynamic Header with Mesh Background */}
        <div className="relative overflow-hidden p-6 md:p-8 border-b border-slate-100 bg-white shrink-0">
          {/* Background mesh & grid */}
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-fuchsia-100/60 pointer-events-none z-0"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MCAwIEwgMCAwIDAgNDApIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwwLDAsMC4wMikiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4n)] opacity-85 pointer-events-none z-0"></div>
          <div className="absolute -left-10 -top-10 w-48 h-48 bg-indigo-200/30 blur-[60px] rounded-full pointer-events-none z-0"></div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-300/30 blur-[60px] rounded-full pointer-events-none z-0"></div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-955 tracking-tight mb-1">
                {activeTab === 'account' && (language === 'es' ? 'Información de Cuenta' : 'Account Information')}
                {activeTab === 'security' && (language === 'es' ? 'Configuración de Seguridad' : 'Security Settings')}
                {activeTab === 'apikeys' && (language === 'es' ? 'Credenciales de API' : 'API Credentials')}
                {activeTab === 'webhooks' && (language === 'es' ? 'Opciones de Desarrollador' : 'Developer Options')}
              </h2>
              <p className="text-sm text-slate-500">
                {activeTab === 'account' && (language === 'es' ? 'Administra los detalles de tu empresa, logotipo de marca y dirección de recepción.' : 'Manage your core business details, brand logo, and wallet endpoints.')}
                {activeTab === 'security' && (language === 'es' ? 'Actualiza credenciales, códigos OTP y configura la autenticación 2FA.' : 'Update credentials, OTP codes, and configure Google Authenticator 2FA.')}
                {activeTab === 'apikeys' && (language === 'es' ? 'Administra claves de API seguras para autenticar solicitudes de pago.' : 'Manage secure API keys for authenticating payment requests.')}
                {activeTab === 'webhooks' && (language === 'es' ? 'Recibe notificaciones de pago en tiempo real y gestiona redirecciones.' : 'Receive real-time payment notifications and manage customer redirects.')}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {(activeTab === 'apikeys' || activeTab === 'webhooks') && (
                <Link 
                  href="/dashboard/docs" 
                  className="px-5 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 font-bold text-[13px] transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <FileText size={16} strokeWidth={1.5} />
                  {language === 'es' ? 'Leer Documentación' : 'Read API Docs'}
                </Link>
              )}
              {activeTab === 'apikeys' && (
                <button 
                  onClick={() => setShowCreateModal(true)} 
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[13px] transition flex items-center justify-center gap-2 shadow-md shadow-purple-100 shrink-0"
                >
                  <Plus size={16} strokeWidth={1.5} />
                  {language === 'es' ? 'Generar Nueva Clave' : 'Generate New Key'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Settings Tab Content Body */}
        <div className="p-6 md:p-8 flex-1 flex flex-col">
        {activeTab === 'account' && (
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-6">
              {/* Logo Upload Section */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-3">{language === 'es' ? 'Logotipo de Comercio (Se muestra en la factura)' : 'Merchant Logo (Shown on Invoice)'}</label>
                <div className="flex items-center gap-6 bg-slate-50/50 border border-slate-200/60 p-6 rounded-2xl">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm bg-white" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-white border border-dashed border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-400">
                      {language === 'es' ? 'Sin Logotipo' : 'No Logo'}
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-55 text-slate-700 rounded-xl transition text-[13px] font-semibold shadow-sm">
                      <Upload size={14} strokeWidth={2} className="text-slate-500" />
                      {uploadingLogo ? (language === 'es' ? 'Subiendo...' : 'Uploading...') : (language === 'es' ? 'Subir Logotipo' : 'Upload Logo')}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                    </label>
                    <p className="text-xs text-slate-400 mt-2 font-medium">{language === 'es' ? 'Recomendado: PNG o JPG de 200x200px.' : 'Recommended: 200x200px PNG or JPG.'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">{language === 'es' ? 'Nombre de la Empresa' : 'Business Name'}</label>
                  <input 
                    type="text" 
                    value={formData.businessName} 
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})} 
                    placeholder={language === 'es' ? 'ej. Mi Empresa S.A.' : 'e.g. Merchant Inc.'} 
                    className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-slate-50/50 hover:bg-slate-55 transition shadow-sm" 
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">Website URL</label>
                  <input 
                    type="url" 
                    value={formData.website} 
                    onChange={(e) => setFormData({...formData, website: e.target.value})} 
                    placeholder="https://www.merchant.com" 
                    className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-slate-50/50 hover:bg-slate-55 transition shadow-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-2">{language === 'es' ? 'Dirección de Billetera Receptora (BEP20)' : 'Receiving Wallet Address (BEP20)'}</label>
                <input 
                  type="text" 
                  value={formData.merchantWallet} 
                  onChange={(e) => setFormData({...formData, merchantWallet: e.target.value})} 
                  placeholder="0x..." 
                  className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-slate-50/50 hover:bg-slate-55 transition shadow-sm font-mono text-sm" 
                />
                <p className="text-xs text-slate-400 mt-2 font-medium">{language === 'es' ? 'Aquí es donde se transferirán sus fondos, o donde los usuarios pagan directamente.' : 'This is where your funds will be swept to, or where users pay directly.'}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={saving} 
                className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-md shadow-purple-100 disabled:bg-slate-400"
              >
                {saving ? (language === 'es' ? 'Guardando...' : 'Saving...') : (language === 'es' ? 'Guardar Cuenta' : 'Save Account')}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="space-y-8 divide-y divide-slate-100">
            {/* Email configuration block */}
            <form onSubmit={handleEmailSubmit} className="space-y-6 first:pt-0">
              <div>
                <h2 className="text-xl font-semibold text-slate-955 tracking-tight mb-1">{s.emailAddress}</h2>
                <p className="text-sm text-slate-500">{s.emailDesc}</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">{s.workspaceEmail}</label>
                  <input 
                    type="email" 
                    required 
                    value={emailForm.email} 
                    onChange={(e) => setEmailForm({email: e.target.value})} 
                    placeholder="merchant@example.com" 
                    className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition shadow-sm text-sm" 
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-md shadow-purple-100 disabled:bg-slate-400"
                >
                  {saving ? s.updating : s.updateEmailBtn}
                </button>
              </div>
            </form>

            {/* Password configuration block */}
            <form onSubmit={handlePasswordSubmit} className="space-y-6 pt-8">
              <div>
                <h2 className="text-xl font-semibold text-slate-955 tracking-tight mb-1">{s.changePassword}</h2>
                <p className="text-sm text-slate-500">{s.changePasswordDesc}</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-2">{s.newPassword}</label>
                  <div className="relative flex items-center">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      minLength="8" 
                      pattern="(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?/~\\-]).{8,}" 
                      title="Must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character" 
                      value={passwordForm.password} 
                      onChange={(e) => setPasswordForm({password: e.target.value})} 
                      placeholder={language === 'es' ? 'Ingrese una nueva contraseña segura' : 'Enter new secure password'} 
                      className="w-full pl-5 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition shadow-sm" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-700 transition-colors"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Dynamic Password Validation Hint */}
                  <div className="mt-3 space-y-2 text-xs font-semibold">
                    <p className="text-slate-500 font-bold mb-1.5 uppercase tracking-wider text-[10px] font-sans">{s.passRequirements}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 transition-colors">
                        {passwordVal ? (
                          hasMinLength ? (
                            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                          ) : (
                            <AlertCircle size={14} className="text-red-500 shrink-0" />
                          )
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-350 shrink-0"></div>
                        )}
                        <span className={passwordVal ? (hasMinLength ? 'text-green-600' : 'text-red-500') : 'text-slate-450'}>
                          {s.minChars}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 transition-colors">
                        {passwordVal ? (
                          hasUppercase ? (
                            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                          ) : (
                            <AlertCircle size={14} className="text-red-500 shrink-0" />
                          )
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-350 shrink-0"></div>
                        )}
                        <span className={passwordVal ? (hasUppercase ? 'text-green-600' : 'text-red-500') : 'text-slate-450'}>
                          {s.oneUpper}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 transition-colors">
                        {passwordVal ? (
                          hasNumber ? (
                            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                          ) : (
                            <AlertCircle size={14} className="text-red-500 shrink-0" />
                          )
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-350 shrink-0"></div>
                        )}
                        <span className={passwordVal ? (hasNumber ? 'text-green-600' : 'text-red-500') : 'text-slate-450'}>
                          {s.oneNum}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 transition-colors">
                        {passwordVal ? (
                          hasSpecial ? (
                            <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                          ) : (
                            <AlertCircle size={14} className="text-red-500 shrink-0" />
                          )
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-350 shrink-0"></div>
                        )}
                        <span className={passwordVal ? (hasSpecial ? 'text-green-600' : 'text-red-500') : 'text-slate-450'}>
                          {s.oneSpecial}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving || (passwordVal.length > 0 && !isPasswordValid)} 
                  className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-md shadow-purple-100 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                  {saving ? s.updating : s.changePassword}
                </button>
              </div>
            </form>

            {/* Two Factor Authentication block */}
            <div className="space-y-6 pt-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-955 tracking-tight mb-1">{s.twoFactor}</h2>
                  <p className="text-sm text-slate-500">{s.twoFactorDesc}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                  twoFactorEnabled 
                    ? 'bg-green-50 text-green-600 border-green-200' 
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  {twoFactorEnabled ? s.active : s.disabled}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 bg-slate-50/50 border border-slate-200/60 p-6 rounded-2xl">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  twoFactorEnabled ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-450'
                }`}>
                  <ShieldCheck size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-slate-800 text-sm">{s.authenticatorApp}</h4>
                  <p className="text-xs text-slate-400 font-medium">{s.authenticatorDesc}</p>
                </div>
                <button 
                  onClick={handleToggle2FA}
                  disabled={enabling2FA}
                  className={`px-6 py-2.5 rounded-xl font-bold text-[13px] transition shadow-sm disabled:opacity-60 ${
                    twoFactorEnabled 
                      ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-100'
                  }`}
                >
                  {enabling2FA ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block"></span>
                      {s.loading}
                    </span>
                  ) : twoFactorEnabled ? s.disable2FA : s.enable2FA}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'apikeys' && (
          <div className="space-y-6">

            {loadingKeys ? (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-medium text-sm">{s.loadingKeys}</p>
              </div>
            ) : keys.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-350">
                  <Key size={36} className="text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">{s.noKeysFound}</h3>
                <p className="text-slate-500 text-sm max-w-sm">{s.noKeysDesc}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {keys.map((apiKey) => (
                  <div key={apiKey._id} className="py-6 first:pt-0 last:pb-0 font-sans">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-slate-800 text-[15px] leading-tight">{apiKey.name || 'API Key'}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                          apiKey.status === 'active' 
                            ? 'bg-green-50 text-green-600 border-green-200' 
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {apiKey.status === 'active' ? s.active : apiKey.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold">{s.createdOn} {new Date(apiKey.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200/60 font-mono">
                      {/* Secret Key */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2 font-sans">
                          {s.secretKey}
                          <span className="flex items-center gap-1 text-slate-500 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full text-[9px] tracking-normal">
                            {s.maskedSecurity}
                          </span>
                        </label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-slate-400 font-mono shadow-sm break-all select-none">
                            {apiKey.secretKey}
                          </code>
                          <button 
                            onClick={() => handleDeleteKey(apiKey._id)}
                            className="p-2.5 bg-white border border-slate-200 text-slate-455 hover:text-red-650 hover:border-red-200 rounded-xl transition-all shadow-sm flex-shrink-0"
                            title={s.deleteKeyTitle}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {activeTab === 'webhooks' && (
          <form onSubmit={handleSubmit} className="space-y-8">

            <div className="space-y-8">
              {/* Redirect URLs */}
              <div className="bg-slate-50/40 border border-slate-200/60 p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.customerRedirects}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-655 mb-2">{s.successRedirectUrl}</label>
                    <input 
                      type="url" 
                      value={formData.successUrl} 
                      onChange={(e) => setFormData({...formData, successUrl: e.target.value})} 
                      placeholder="https://your-website.com/success" 
                      className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-white hover:bg-slate-50/50 transition shadow-sm text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-slate-655 mb-2">{s.cancelRedirectUrl}</label>
                    <input 
                      type="url" 
                      value={formData.cancelUrl} 
                      onChange={(e) => setFormData({...formData, cancelUrl: e.target.value})} 
                      placeholder="https://your-website.com/cancel" 
                      className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-white hover:bg-slate-50/50 transition shadow-sm text-sm" 
                    />
                  </div>
                </div>
              </div>

              {/* Endpoint Settings */}
              <div className="bg-slate-50/40 border border-slate-200/60 p-6 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.webhookEndpoint}</h3>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="flex-1">
                      <input 
                        type="url" 
                        value={formData.webhookUrl} 
                        onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})} 
                        placeholder="https://your-website.com/api/webhook" 
                        className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-white hover:bg-slate-50/50 transition shadow-sm text-sm" 
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleTestWebhook} 
                      disabled={testingWebhook || !formData.webhookUrl} 
                      className="px-5 py-3 bg-white border border-slate-200 hover:bg-slate-55 text-slate-700 text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                    >
                      {testingWebhook ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-650 border-t-transparent rounded-full animate-spin"></div>
                          {s.testing}
                        </>
                      ) : s.testConnection}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {s.webhookDesc}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-200/60">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{s.customHeaders}</h4>
                      <button 
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          webhookHeaders: [...(formData.webhookHeaders || []), { key: '', value: '' }]
                        })}
                        className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> {s.addHeader}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(formData.webhookHeaders || []).map((header, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder={s.headerKeyPlaceholder}
                            value={header.key}
                            onChange={(e) => {
                              const newHeaders = formData.webhookHeaders.map((h, i) => 
                                i === index ? { ...h, key: e.target.value } : h
                              );
                              setFormData({ ...formData, webhookHeaders: newHeaders });
                            }}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-white text-xs shadow-sm"
                          />
                          <input 
                            type="text" 
                            placeholder={s.headerValuePlaceholder}
                            value={header.value}
                            onChange={(e) => {
                              const newHeaders = formData.webhookHeaders.map((h, i) => 
                                i === index ? { ...h, value: e.target.value } : h
                              );
                              setFormData({ ...formData, webhookHeaders: newHeaders });
                            }}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-white text-xs shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newHeaders = formData.webhookHeaders.filter((_, i) => i !== index);
                              setFormData({
                                ...formData,
                                webhookHeaders: newHeaders.length ? newHeaders : [{ key: '', value: '' }]
                              });
                            }}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {testResponse && (
                    <div className={`mt-6 p-4 border rounded-xl text-xs font-mono overflow-auto max-h-96 shadow-sm ${testResponse.success ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' : 'bg-rose-50/50 border-rose-200 text-rose-800'}`}>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="font-bold mb-2 uppercase tracking-wider text-[10px] opacity-70">
                            {s.whatWasSent}
                          </div>
                          <pre className="whitespace-pre-wrap break-all leading-relaxed opacity-90 text-[11px] bg-black/5 p-3 rounded-lg border border-black/5">
                            {testResponse.sent ? JSON.stringify(testResponse.sent.payload, null, 2) : '...'}
                          </pre>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold mb-2 uppercase tracking-wider text-[10px] opacity-70">
                            {s.responseStatus} {testResponse.status}
                          </div>
                          <pre className="whitespace-pre-wrap break-all leading-relaxed opacity-90 text-[11px] bg-black/5 p-3 rounded-lg border border-black/5">
                            {testResponse.body || '<Empty Response>'}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                type="submit" 
                disabled={saving} 
                className="px-8 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition shadow-sm disabled:bg-slate-400"
              >
                {saving ? s.saving : s.saveConfig}
              </button>
            </div>
          </form>
        )}
        </div>
      </div>

      {/* Disable 2FA Confirmation Modal */}
      {showDisable2FAConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200 mx-4">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Warning icon */}
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{s.disable2FAConfirmTitle}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed font-medium">
                  {s.disable2FAConfirmDesc}
                </p>
              </div>

              {/* Warning badge */}
              <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5 text-left">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 shrink-0 mt-0.5"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>
                <p className="text-xs text-amber-700 font-semibold leading-relaxed">{s.disable2FAWarningBadge}</p>
              </div>

              <div className="flex gap-3 w-full pt-1">
                <button
                  onClick={() => setShowDisable2FAConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-full transition shadow-sm"
                >
                  {s.keepEnabled}
                </button>
                <button
                  onClick={confirmDisable2FA}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-full transition shadow-sm"
                >
                  {s.yesDisable}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Key Delete Confirmation Modal */}
      {keyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full border border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-200 mx-4">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950 tracking-tight">{s.deleteKeyTitle}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed font-medium">
                  {s.deleteKeyConfirm}
                </p>
              </div>
              <div className="flex gap-3 w-full pt-2">
                <button 
                  onClick={() => setKeyToDelete(null)}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-full transition shadow-sm"
                >
                  {s.cancel}
                </button>
                <button 
                  onClick={() => {
                    const id = keyToDelete;
                    setKeyToDelete(null);
                    confirmDeleteKey(id);
                  }}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-full transition shadow-sm"
                >
                  {s.delete}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full border border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-200 mx-4">
            <form onSubmit={handleGenerate} className="flex flex-col space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-955 tracking-tight">{s.createKeyTitle}</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">{s.createKeyDesc}</p>
              </div>
              
              <div>
                <input 
                  type="text" 
                  required
                  placeholder={s.productionPlaceholder}
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition shadow-sm"
                />
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewKeyName('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-full transition shadow-sm"
                >
                  {s.cancel}
                </button>
                <button 
                  type="submit"
                  disabled={generating}
                  className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full transition shadow-sm disabled:bg-slate-400"
                >
                  {generating ? s.creating : s.generate}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* One-Time Secret Key Reveal Modal */}
      {newlyCreatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full border border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-200 mx-4">
            <div className="flex flex-col space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-2">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-955 tracking-tight">{s.copySecretKeyTitle}</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">
                  {s.copySecretKeyDesc}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex flex-col space-y-2 font-mono">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">{s.secretKey}</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-slate-700 font-mono shadow-sm break-all select-all">
                    {newlyCreatedKey.secretKey}
                  </code>
                  <button 
                    onClick={() => copyKeyToClipboard(newlyCreatedKey.secretKey, 'new_secret')} 
                    className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition-all shadow-sm flex-shrink-0"
                    title={s.secretKey}
                  >
                    {copiedKey === 'new_secret' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setNewlyCreatedKey(null)}
                  className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full transition shadow-sm"
                >
                  {s.copiedBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enable 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full border border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-200 mx-4">
            <form onSubmit={handleVerify2FA} className="flex flex-col space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 mx-auto mb-2">
                  <Fingerprint size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-955 tracking-tight">{s.enable2FATitle}</h3>
                <p className="text-sm text-slate-500 font-medium">{s.enable2FASub}</p>
              </div>
              
              <div className="flex flex-col items-center py-4 bg-slate-50 rounded-2xl border border-slate-200/50 gap-3">
                {/* Live QR Code from Google QR API */}
                <div className="w-44 h-44 bg-white border border-slate-200 p-2 rounded-xl flex items-center justify-center shadow-sm select-none">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Scan with Google Authenticator" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h.01M14 17h.01M17 14h.01M17 17h3v3h-3z"/></svg>
                    </div>
                  )}
                </div>
                <div className="text-center px-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{s.manualEntryCode}</span>
                  <code className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 mt-1.5 inline-block tracking-widest break-all">
                    {twoFactorSecret || '—'}
                  </code>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">{s.verificationCode}</label>
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  pattern="[0-9]{6}"
                  title="Please enter a 6-digit numeric OTP code"
                  placeholder={language === 'es' ? 'Ingrese el código de 6 dígitos' : 'Enter 6-digit code'} 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition shadow-sm text-center font-mono font-bold text-lg tracking-widest"
                />
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setShow2FAModal(false);
                    setOtpCode('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-full transition shadow-sm"
                >
                  {s.cancel}
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full transition shadow-sm disabled:bg-slate-400"
                >
                  {s.verify}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full border border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-200 mx-4">
            <form onSubmit={handleConfirmOtpChange} className="flex flex-col space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-2">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-955 tracking-tight">{s.verifyIdentity}</h3>
                <p className="text-sm text-slate-550 font-medium leading-normal">
                  {s.verifyIdentityDesc}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">OTP</label>
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  pattern="[0-9]{6}"
                  title="Please enter a 6-digit numeric verification code"
                  placeholder="000000" 
                  value={emailVerificationCode}
                  onChange={(e) => setEmailVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-5 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition shadow-sm text-center font-mono font-bold text-lg tracking-widest"
                />
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setShowOtpModal(false);
                    setEmailVerificationCode('');
                    setPendingAction(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-full transition shadow-sm"
                >
                  {s.cancel}
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-full transition shadow-sm disabled:bg-slate-400"
                >
                  {saving ? s.verifying : s.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
