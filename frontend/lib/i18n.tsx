'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Lang = 'en' | 'fr';

// ─── Flat translation lookup ──────────────────────────────────────────────────
// Keys use dot-notation e.g. "nav.dashboard", "common.save"
type Translations = Record<string, string>;

const EN: Translations = {
  // ── Common ──────────────────────────────────────────────────────────────────
  'common.save':           'Save',
  'common.cancel':         'Cancel',
  'common.delete':         'Delete',
  'common.uploading':      'Uploading...',
  'common.loading':        'Loading...',
  'common.submit':         'Submit',
  'common.back':           'Back',
  'common.logout':         'Log out',
  'common.edit':           'Edit',
  'common.close':          'Close',
  'common.yes':            'Yes',
  'common.no':             'No',
  'common.deleting':       'Deleting…',

  // ── Nav ─────────────────────────────────────────────────────────────────────
  'nav.dashboard':         'Dashboard',
  'nav.taxYear':           'Tax Year',

  // ── Landing page ────────────────────────────────────────────────────────────
  'home.title':            'Tax documents — handled.',
  'home.subtitle':         'Upload your tax slips securely. Your accountant reviews everything.',
  'home.clientLogin':      'Client Login',
  'home.accountantLogin':  'Accountant Login',
  'home.feature1.title':   'Secure Upload',
  'home.feature1.desc':    'All files encrypted in transit and at rest.',
  'home.feature2.title':   'Smart Checklist',
  'home.feature2.desc':    'We tell you exactly which documents to upload based on your profile.',
  'home.feature3.title':   'Real-Time Status',
  'home.feature3.desc':    'Know instantly when your accountant approves or requests changes.',

  // ── Login ───────────────────────────────────────────────────────────────────
  'login.title':           'Welcome back',
  'login.subtitle':        'Sign in to your account',
  'login.email':           'Email address',
  'login.password':        'Password',
  'login.signIn':          'Sign in',
  'login.signingIn':       'Signing in…',
  'login.forgotPassword':  'Forgot password?',
  'login.noAccount':       "Don't have an account?",
  'login.contactAdmin':    'Contact your accountant.',
  'login.errorInvalid':    'Invalid email or password.',

  // ── Forgot / Reset password ──────────────────────────────────────────────────
  'forgotPw.title':        'Reset your password',
  'forgotPw.subtitle':     "Enter your email and we'll send a reset link.",
  'forgotPw.email':        'Email address',
  'forgotPw.send':         'Send reset link',
  'forgotPw.sending':      'Sending…',
  'forgotPw.backToLogin':  'Back to login',
  'forgotPw.successTitle': 'Check your email',
  'forgotPw.successMsg':   'If an account exists for that email, a reset link has been sent.',
  'resetPw.title':         'Set new password',
  'resetPw.newPassword':   'New password',
  'resetPw.confirm':       'Confirm password',
  'resetPw.submit':        'Set password',
  'resetPw.submitting':    'Saving…',
  'resetPw.mismatch':      'Passwords do not match.',
  'resetPw.success':       'Password updated. You can now log in.',

  // ── Client Dashboard ─────────────────────────────────────────────────────────
  'clientDash.title':      'My Tax Files',
  'clientDash.greeting':   'Hello',
  'clientDash.activeyear': 'Active Year',
  'clientDash.status.pending':     'In Progress',
  'clientDash.status.submitted':   'Submitted',
  'clientDash.status.completed':   'Completed',
  'clientDash.status.inreview':    'In Review',
  'clientDash.openFile':   'Open file',
  'clientDash.previous':   'Previous years',
  'clientDash.noYears':    'No tax years found.',
  'clientDash.changePassword': 'Change password',

  // ── Tax Year page ────────────────────────────────────────────────────────────
  'taxYear.step1.title':   'Step 1 — Complete your tax profile',
  'taxYear.step1.desc':    'Tell us about your income sources and deductions so we can show you exactly which documents to upload.',
  'taxYear.step1.start':   'Start profile',
  'taxYear.step2.title':   'Step 2 — Upload Documents',
  'taxYear.step2.editProfile': 'Edit Profile',
  'taxYear.step2.docType': 'Document Type',
  'taxYear.step2.label':   'Label',
  'taxYear.step2.labelHint': '(optional — helps tell copies apart)',
  'taxYear.step2.owner':   'Name on document',
  'taxYear.step2.ownerRequired': '(yours, spouse, child, etc.)',
  'taxYear.step2.ownerPlaceholder': 'e.g. John Smith',
  'taxYear.step2.file':    'Select File',
  'taxYear.step2.uploadBtn': 'Upload Document',
  'taxYear.step2.province': 'Showing document types for',
  'taxYear.required.title': 'Required Documents',
  'taxYear.required.uploaded': 'uploaded',
  'taxYear.required.progress': '% complete — based on your tax profile',
  'taxYear.required.none': 'No required documents identified from your profile.',
  'taxYear.required.missing': 'Missing',
  'taxYear.required.addAnother': 'Add another',
  'taxYear.required.received': 'Received',
  'taxYear.required.underReview': 'Under review',
  'taxYear.required.reupload': 'Re-upload',
  'taxYear.required.delete': '',
  'taxYear.additional.title': 'Additional Documents',
  'taxYear.additional.delete': 'Delete',
  'taxYear.submit.title':  'Ready? Submit your file for review',
  'taxYear.submit.desc':   'Your accountant will be notified and can start reviewing your documents.',
  'taxYear.submit.btn':    'Submit for Review',
  'taxYear.submit.submitting': 'Submitting…',
  'taxYear.submit.issues': 'document(s) have issues. Please delete and re-upload the correct files before submitting.',
  'taxYear.submitted.title': 'File submitted for review',
  'taxYear.submitted.desc':  'Your accountant has been notified. You will be alerted if any correction is needed.',
  'taxYear.toast.uploaded': 'uploaded successfully!',
  'taxYear.toast.deleted':  'Document removed. You can now upload the correct one.',
  'taxYear.toast.submitted': 'File submitted for review! Your accountant will be notified.',
  'taxYear.toast.duplicate': 'This file is already uploaded. Delete the existing one first if you want to replace it.',

  // ── Profile page ─────────────────────────────────────────────────────────────
  'profile.title':         'Tax Profile',
  'profile.subtitle':      'Tell us about your situation for',
  'profile.save':          'Save Profile',
  'profile.saving':        'Saving…',
  'profile.saved':         'Profile saved!',
  'profile.section.income':      'Income Sources',
  'profile.section.savings':     'Savings & Plans',
  'profile.section.deductions':  'Deductions & Credits',
  'profile.section.living':      'Living Situation',
  'profile.section.business':    'Business & Self-Employment',
  'profile.section.family':      'Family',
  'profile.income.employment':   'Employment income (T4)',
  'profile.income.selfEmploy':   'Self-employment / freelance',
  'profile.income.gig':          'Gig economy (Uber, Airbnb…)',
  'profile.income.investment':   'Investment income (dividends, interest)',
  'profile.income.securities':   'Securities transactions',
  'profile.income.rental':       'Rental income',
  'profile.income.retirement':   'Retirement / pension income',
  'profile.income.ei':           'Employment Insurance (EI / RQAP)',
  'profile.income.social':       'Social assistance / welfare',
  'profile.savings.rrsp':        'RRSP contributions',
  'profile.savings.fhsa':        'First Home Savings Account (FHSA)',
  'profile.deductions.childcare': 'Childcare expenses',
  'profile.deductions.tuition':   'Tuition / student fees',
  'profile.deductions.student':   'Student loan interest',
  'profile.deductions.medical':   'Medical / dental expenses',
  'profile.deductions.donations': 'Charitable donations',
  'profile.deductions.homeOffice':'Home office expenses',
  'profile.deductions.moving':    'Moving expenses',
  'profile.deductions.disability':'Disability tax credit',
  'profile.living.tenant':        'Tenant (renting)',
  'profile.business.vehicle':     'Vehicle used for business',
  'profile.family.married':       'Married or common-law',
  'profile.family.dependents':    'Dependants (children, elderly parent…)',

  // ── Change Password ──────────────────────────────────────────────────────────
  'changePw.title':        'Change Password',
  'changePw.current':      'Current password',
  'changePw.new':          'New password',
  'changePw.confirm':      'Confirm new password',
  'changePw.submit':       'Update password',
  'changePw.submitting':   'Updating…',
  'changePw.mismatch':     'New passwords do not match.',
  'changePw.success':      'Password updated successfully.',

  // ── Common extras ────────────────────────────────────────────────────────────
  'common.province':       'Province',

  // ── Accountant Dashboard ─────────────────────────────────────────────────────
  'acctDash.title':        'Accountant Dashboard',
  'acctDash.subtitle':     'Manage your clients and review their tax documents.',
  'acctDash.addClient':    'Add Client',
  'acctDash.clients':      'Clients',
  'acctDash.total':        'Total Clients',
  'acctDash.allTime':      'all time',
  'acctDash.pending':      'Pending Review',
  'acctDash.needAttention':'need attention',
  'acctDash.completed':    'Completed',
  'acctDash.closed':       'files closed',
  'acctDash.urgent':       'Urgent',
  'acctDash.waiting':      '3+ docs waiting',
  'acctDash.submitted':    'Submitted',
  'acctDash.status':       'Status',
  'acctDash.name':         'Name',
  'acctDash.year':         'Year',
  'acctDash.action':       'Action',
  'acctDash.review':       'Review',
  'acctDash.noClients':    'No clients yet.',
  'acctDash.noMatch':      'No clients match your search.',

  // ── Accountant Client page ───────────────────────────────────────────────────
  'acctClient.backToDash':    'Dashboard',
  'acctClient.markComplete':  'Mark as Complete',
  'acctClient.completing':    'Completing…',
  'acctClient.approve':       'Approve',
  'acctClient.reject':        'Reject',
  'acctClient.rejectionReason': 'Rejection reason (shown to client)',
  'acctClient.rejectBtn':     'Reject Document',
  'acctClient.documents':     'Documents',
  'acctClient.noDocuments':   'No documents uploaded yet.',
  'acctClient.status.pending':   'Pending review',
  'acctClient.status.approved':  '✓ Approved',
  'acctClient.status.rejected':  '✗ Rejected',
};

// ─── French translations ──────────────────────────────────────────────────────
const FR: Translations = {
  'common.save':           'Enregistrer',
  'common.cancel':         'Annuler',
  'common.delete':         'Supprimer',
  'common.uploading':      'Téléversement…',
  'common.loading':        'Chargement…',
  'common.submit':         'Soumettre',
  'common.back':           'Retour',
  'common.logout':         'Déconnexion',
  'common.edit':           'Modifier',
  'common.close':          'Fermer',
  'common.yes':            'Oui',
  'common.no':             'Non',
  'common.deleting':       'Suppression…',

  'nav.dashboard':         'Tableau de bord',
  'nav.taxYear':           'Année fiscale',

  'home.title':            'Documents fiscaux — simplifiés.',
  'home.subtitle':         "Téléversez vos feuillets fiscaux en toute sécurité. Votre comptable s'occupe du reste.",
  'home.clientLogin':      'Connexion client',
  'home.accountantLogin':  'Connexion comptable',
  'home.feature1.title':   'Téléversement sécurisé',
  'home.feature1.desc':    'Tous les fichiers sont chiffrés en transit et au repos.',
  'home.feature2.title':   'Liste intelligente',
  'home.feature2.desc':    'Nous vous indiquons exactement quels documents téléverser selon votre profil.',
  'home.feature3.title':   'Statut en temps réel',
  'home.feature3.desc':    'Soyez informé instantanément lorsque votre comptable approuve ou demande des modifications.',

  'login.title':           'Bon retour',
  'login.subtitle':        'Connectez-vous à votre compte',
  'login.email':           'Adresse courriel',
  'login.password':        'Mot de passe',
  'login.signIn':          'Se connecter',
  'login.signingIn':       'Connexion en cours…',
  'login.forgotPassword':  'Mot de passe oublié?',
  'login.noAccount':       "Vous n'avez pas de compte?",
  'login.contactAdmin':    'Contactez votre comptable.',
  'login.errorInvalid':    'Courriel ou mot de passe invalide.',

  'forgotPw.title':        'Réinitialiser le mot de passe',
  'forgotPw.subtitle':     'Entrez votre courriel et nous vous enverrons un lien.',
  'forgotPw.email':        'Adresse courriel',
  'forgotPw.send':         'Envoyer le lien',
  'forgotPw.sending':      'Envoi…',
  'forgotPw.backToLogin':  'Retour à la connexion',
  'forgotPw.successTitle': 'Vérifiez votre courriel',
  'forgotPw.successMsg':   'Si un compte existe pour ce courriel, un lien a été envoyé.',
  'resetPw.title':         'Nouveau mot de passe',
  'resetPw.newPassword':   'Nouveau mot de passe',
  'resetPw.confirm':       'Confirmer le mot de passe',
  'resetPw.submit':        'Enregistrer',
  'resetPw.submitting':    'Enregistrement…',
  'resetPw.mismatch':      'Les mots de passe ne correspondent pas.',
  'resetPw.success':       'Mot de passe mis à jour. Vous pouvez maintenant vous connecter.',

  'clientDash.title':      'Mes dossiers fiscaux',
  'clientDash.greeting':   'Bonjour',
  'clientDash.activeyear': 'Année active',
  'clientDash.status.pending':   'En cours',
  'clientDash.status.submitted': 'Soumis',
  'clientDash.status.completed': 'Complété',
  'clientDash.status.inreview':  'En révision',
  'clientDash.openFile':   'Ouvrir le dossier',
  'clientDash.previous':   'Années précédentes',
  'clientDash.noYears':    'Aucune année fiscale trouvée.',
  'clientDash.changePassword': 'Changer le mot de passe',

  'taxYear.step1.title':   'Étape 1 — Complétez votre profil fiscal',
  'taxYear.step1.desc':    'Dites-nous vos sources de revenus et déductions pour que nous puissions vous indiquer exactement quels documents téléverser.',
  'taxYear.step1.start':   'Commencer le profil',
  'taxYear.step2.title':   'Étape 2 — Téléverser des documents',
  'taxYear.step2.editProfile': 'Modifier le profil',
  'taxYear.step2.docType': 'Type de document',
  'taxYear.step2.label':   'Étiquette',
  'taxYear.step2.labelHint': '(facultatif — pour différencier les copies)',
  'taxYear.step2.owner':   'Nom sur le document',
  'taxYear.step2.ownerRequired': '(vous, conjoint, enfant, etc.)',
  'taxYear.step2.ownerPlaceholder': 'ex. Jean Tremblay',
  'taxYear.step2.file':    'Sélectionner un fichier',
  'taxYear.step2.uploadBtn': 'Téléverser le document',
  'taxYear.step2.province': 'Types de documents affichés pour',
  'taxYear.required.title': 'Documents requis',
  'taxYear.required.uploaded': 'téléversé(s)',
  'taxYear.required.progress': '% complété — selon votre profil fiscal',
  'taxYear.required.none': 'Aucun document requis identifié à partir de votre profil.',
  'taxYear.required.missing': 'Manquant',
  'taxYear.required.addAnother': 'Ajouter un autre',
  'taxYear.required.received': 'Reçu',
  'taxYear.required.underReview': 'En révision',
  'taxYear.required.reupload': 'Re-téléverser',
  'taxYear.required.delete': '',
  'taxYear.additional.title': 'Documents supplémentaires',
  'taxYear.additional.delete': 'Supprimer',
  'taxYear.submit.title':  'Prêt? Soumettez votre dossier pour révision',
  'taxYear.submit.desc':   'Votre comptable sera notifié et pourra commencer la révision.',
  'taxYear.submit.btn':    'Soumettre pour révision',
  'taxYear.submit.submitting': 'Soumission…',
  'taxYear.submit.issues': 'document(s) ont des problèmes. Veuillez supprimer et re-téléverser les bons fichiers avant de soumettre.',
  'taxYear.submitted.title': 'Dossier soumis pour révision',
  'taxYear.submitted.desc':  'Votre comptable a été notifié. Vous serez alerté si une correction est nécessaire.',
  'taxYear.toast.uploaded': 'téléversé avec succès!',
  'taxYear.toast.deleted':  'Document supprimé. Vous pouvez maintenant téléverser le bon.',
  'taxYear.toast.submitted': 'Dossier soumis! Votre comptable a été notifié.',
  'taxYear.toast.duplicate': 'Ce fichier est déjà téléversé. Supprimez l\'existant d\'abord si vous souhaitez le remplacer.',

  'profile.title':         'Profil fiscal',
  'profile.subtitle':      'Parlez-nous de votre situation pour',
  'profile.save':          'Enregistrer le profil',
  'profile.saving':        'Enregistrement…',
  'profile.saved':         'Profil enregistré!',
  'profile.section.income':      'Sources de revenus',
  'profile.section.savings':     'Épargne et régimes',
  'profile.section.deductions':  'Déductions et crédits',
  'profile.section.living':      'Situation de logement',
  'profile.section.business':    'Affaires et travail autonome',
  'profile.section.family':      'Famille',
  'profile.income.employment':   'Revenus d\'emploi (T4)',
  'profile.income.selfEmploy':   'Travail autonome / freelance',
  'profile.income.gig':          'Économie de plateforme (Uber, Airbnb…)',
  'profile.income.investment':   'Revenus de placement (dividendes, intérêts)',
  'profile.income.securities':   'Transactions de titres',
  'profile.income.rental':       'Revenus de location',
  'profile.income.retirement':   'Revenus de retraite / pension',
  'profile.income.ei':           'Assurance-emploi (AE / RQAP)',
  'profile.income.social':       'Aide sociale',
  'profile.savings.rrsp':        'Cotisations REER',
  'profile.savings.fhsa':        'Compte d\'épargne libre d\'impôt pour l\'achat d\'une première propriété (CELIAPP)',
  'profile.deductions.childcare': 'Frais de garde d\'enfants',
  'profile.deductions.tuition':   'Frais de scolarité',
  'profile.deductions.student':   'Intérêts sur prêts étudiants',
  'profile.deductions.medical':   'Frais médicaux / dentaires',
  'profile.deductions.donations': 'Dons de bienfaisance',
  'profile.deductions.homeOffice':'Frais de bureau à domicile',
  'profile.deductions.moving':    'Frais de déménagement',
  'profile.deductions.disability':'Crédit d\'impôt pour personnes handicapées',
  'profile.living.tenant':        'Locataire',
  'profile.business.vehicle':     'Véhicule utilisé pour le travail',
  'profile.family.married':       'Marié ou conjoint de fait',
  'profile.family.dependents':    'Personnes à charge (enfants, parent âgé…)',

  'changePw.title':        'Changer le mot de passe',
  'changePw.current':      'Mot de passe actuel',
  'changePw.new':          'Nouveau mot de passe',
  'changePw.confirm':      'Confirmer le nouveau mot de passe',
  'changePw.submit':       'Mettre à jour',
  'changePw.submitting':   'Mise à jour…',
  'changePw.mismatch':     'Les nouveaux mots de passe ne correspondent pas.',
  'changePw.success':      'Mot de passe mis à jour avec succès.',

  'common.province':       'Province',

  'acctDash.title':        'Tableau de bord comptable',
  'acctDash.subtitle':     'Gérez vos clients et révisez leurs documents fiscaux.',
  'acctDash.addClient':    'Ajouter un client',
  'acctDash.clients':      'Clients',
  'acctDash.total':        'Total clients',
  'acctDash.allTime':      'au total',
  'acctDash.pending':      'En attente',
  'acctDash.needAttention':"nécessitent attention",
  'acctDash.completed':    'Complétés',
  'acctDash.closed':       'dossiers fermés',
  'acctDash.urgent':       'Urgents',
  'acctDash.waiting':      '3+ docs en attente',
  'acctDash.submitted':    'Soumis le',
  'acctDash.status':       'Statut',
  'acctDash.name':         'Nom',
  'acctDash.year':         'Année',
  'acctDash.action':       'Action',
  'acctDash.review':       'Réviser',
  'acctDash.noClients':    "Aucun client pour l'instant.",
  'acctDash.noMatch':      'Aucun client ne correspond à votre recherche.',

  'acctClient.backToDash':    'Tableau de bord',
  'acctClient.markComplete':  'Marquer comme terminé',
  'acctClient.completing':    'En cours…',
  'acctClient.approve':       'Approuver',
  'acctClient.reject':        'Rejeter',
  'acctClient.rejectionReason': 'Motif de rejet (affiché au client)',
  'acctClient.rejectBtn':     'Rejeter le document',
  'acctClient.documents':     'Documents',
  'acctClient.noDocuments':   'Aucun document téléversé pour l\'instant.',
  'acctClient.status.pending':   'En attente de révision',
  'acctClient.status.approved':  '✓ Approuvé',
  'acctClient.status.rejected':  '✗ Rejeté',
};

// ─── Context ──────────────────────────────────────────────────────────────────
interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('taxflow_lang') as Lang | null;
    if (stored === 'en' || stored === 'fr') setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem('taxflow_lang', l);
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    const dict = lang === 'fr' ? FR : EN;
    return dict[key] ?? fallback ?? key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used inside <LanguageProvider>');
  return ctx;
}
