import React, { createContext, useContext, useState } from 'react';

export type Lang = 'en' | 'fr';

export const translations = {
  en: {
    // nav / sidebar
    appName:        'RootsBridge',
    home:           '🏠 Home',
    families:       '👨‍👩‍👧 Families',
    treePreview:    '🌳 Tree Preview',
    allMembers:     '👥 All Members',
    generations:    '📊 Generations',
    gallery:        '📷 Gallery',
    admin:          '🛡️ Admin',
    profile:        'Profile',
    logout:         'Logout',
    settings:       '⚙️ Settings',
    // topbar
    familyDashboard: 'Family Dashboard',
    // settings page
    settingsTitle:   'Settings',
    settingsSubtitle: 'Manage your preferences',
    appearance:      'Appearance',
    themeLabel:      'Theme',
    lightMode:       'Light mode',
    darkMode:        'Dark mode',
    language:        'Language',
    languageLabel:   'Interface Language',
    english:         'English',
    french:          'French',
    savedMsg:        'Preferences saved',
    // families
    browseFamilies:      'Browse existing families or create a new one',
    createFamily:        'Create Family',
    noFamilies:          'No families yet. Be the first to create one!',
    viewFamily:          'View Family',
    requestPending:      'Request Pending',
    requestToJoin:       'Request to Join',
    members:             'members',
    member:              'member',
    // family detail
    backToFamilies:   'Back to Families',
    viewTree:         'View Tree',
    joinRequests:     'Join Requests',
    noRequests:       'No pending join requests',
    accept:           'Accept',
    reject:           'Reject',
    removeMember:     'Remove member',
    // tree
    familyTree:       'Family Tree',
    dragToPan:        'Drag to pan · Scroll to zoom · Click to expand/collapse',
    noApprovedMembers: 'No approved members in the tree yet.',
    // members
    familyMembers:    'Family Members',
    searchMembers:    'Search members...',
    noMembers:        'No members yet',
    noMatchSearch:    'No members match your search',
    // generations
    generationsTitle: 'Generations',
    noPersons:        'No persons in the family tree yet',
    // auth form
    welcomeBack:      'Welcome Back',
    signInContinue:   'Sign in to continue to your account',
    createAccount:    'Create Your Account',
    setupCredentials: 'Set up your login credentials',
    tellAboutYou:     'Tell us about yourself',
    contactInfo:      'Contact and location information',
    signIn:           'Sign In',
    signingIn:        'Signing in...',
    creatingAccount:  'Creating Account...',
    completeReg:      'Complete Registration',
    noAccount:        "Don't have an account? Sign up",
    haveAccount:      'Already have an account? Sign in',
    // landing
    heroEyebrow:      'Family Genealogy Platform',
    heroTitle1:       "Your family's story,",
    heroTitle2:       'never forgotten',
    heroDesc:         'Build, visualize, and share your family tree across generations. Connect with relatives, preserve your lineage, and keep your family together — no matter the distance.',
    startTree:        'Start your family tree →',
    signInBtn:        'Sign in',
    getStarted:       'Get Started',
  },
  fr: {
    appName:        'RootsBridge',
    home:           '🏠 Accueil',
    families:       '👨‍👩‍👧 Familles',
    treePreview:    '🌳 Aperçu de l\'arbre',
    allMembers:     '👥 Tous les membres',
    generations:    '📊 Générations',
    gallery:        '📷 Galerie',
    admin:          '🛡️ Admin',
    profile:        'Profil',
    logout:         'Déconnexion',
    settings:       '⚙️ Paramètres',
    familyDashboard: 'Tableau de Bord Familial',
    settingsTitle:   'Paramètres',
    settingsSubtitle: 'Gérez vos préférences',
    appearance:      'Apparence',
    themeLabel:      'Thème',
    lightMode:       'Mode clair',
    darkMode:        'Mode sombre',
    language:        'Langue',
    languageLabel:   'Langue de l\'interface',
    english:         'Anglais',
    french:          'Français',
    savedMsg:        'Préférences enregistrées',
    browseFamilies:      'Parcourez les familles existantes ou créez-en une nouvelle',
    createFamily:        'Créer une famille',
    noFamilies:          'Aucune famille pour l\'instant. Soyez le premier à en créer une !',
    viewFamily:          'Voir la famille',
    requestPending:      'Demande en attente',
    requestToJoin:       'Demander à rejoindre',
    members:             'membres',
    member:              'membre',
    backToFamilies:   'Retour aux familles',
    viewTree:         'Voir l\'arbre',
    joinRequests:     'Demandes d\'adhésion',
    noRequests:       'Aucune demande en attente',
    accept:           'Accepter',
    reject:           'Rejeter',
    removeMember:     'Retirer le membre',
    familyTree:       'Arbre Généalogique',
    dragToPan:        'Glisser pour déplacer · Molette pour zoomer · Cliquer pour réduire',
    noApprovedMembers: 'Aucun membre approuvé dans l\'arbre pour l\'instant.',
    familyMembers:    'Membres de la Famille',
    searchMembers:    'Rechercher des membres...',
    noMembers:        'Aucun membre pour l\'instant',
    noMatchSearch:    'Aucun membre ne correspond à la recherche',
    generationsTitle: 'Générations',
    noPersons:        'Aucune personne dans l\'arbre généalogique',
    welcomeBack:      'Bon retour',
    signInContinue:   'Connectez-vous pour accéder à votre compte',
    createAccount:    'Créer votre compte',
    setupCredentials: 'Configurez vos identifiants de connexion',
    tellAboutYou:     'Parlez-nous de vous',
    contactInfo:      'Coordonnées et localisation',
    signIn:           'Se connecter',
    signingIn:        'Connexion en cours...',
    creatingAccount:  'Création du compte...',
    completeReg:      'Terminer l\'inscription',
    noAccount:        "Pas encore de compte ? S'inscrire",
    haveAccount:      'Déjà un compte ? Se connecter',
    heroEyebrow:      'Plateforme de Généalogie Familiale',
    heroTitle1:       "L'histoire de votre famille,",
    heroTitle2:       'jamais oubliée',
    heroDesc:         'Construisez, visualisez et partagez votre arbre généalogique à travers les générations. Connectez-vous avec vos proches et préservez votre lignée — peu importe la distance.',
    startTree:        'Commencer votre arbre →',
    signInBtn:        'Se connecter',
    getStarted:       'Commencer',
  },
} satisfies Record<Lang, Record<string, string>>;

export type TKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() =>
    (localStorage.getItem('lang') as Lang) || 'en'
  );

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const t = (key: TKey): string => translations[lang][key] ?? translations.en[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
};
