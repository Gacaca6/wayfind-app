import { useState, useEffect } from 'react';
import { 
  Search, 
  Heart, 
  User, 
  Home, 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  Moon,
  Type,
  Bell,
  Check,
  Flame,
  BookOpen,
  Music,
  HelpCircle,
  Calendar,
  MessageCircle
} from 'lucide-react';
import './App.css';

// Types
type Screen = 
  | 'splash' 
  | 'welcome' 
  | 'q1' 
  | 'q2' 
  | 'q3' 
  | 'ready' 
  | 'signup' 
  | 'paywall'
  | 'home'
  | 'emotion-search'
  | 'curiosity-search'
  | 'results'
  | 'verse-detail'
  | 'profile';

interface UserProfile {
  name: string;
  purpose: string;
  connection: string;
  frequency: string;
  isGuest: boolean;
}

interface Verse {
  id: string;
  text: string;
  reference: string;
  translation: string;
  explanation: string;
}

// Sample verses data
const sampleVerses: Verse[] = [
  {
    id: '1',
    text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
    reference: 'Jeremiah 29:11',
    translation: 'NIV',
    explanation: 'God has a purpose for your life, even when things feel uncertain. His plans are filled with hope.'
  },
  {
    id: '2',
    text: 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters.',
    reference: 'Psalm 23:1-2',
    translation: 'NIV',
    explanation: 'God provides for your needs and offers peace in the midst of life\'s chaos.'
  },
  {
    id: '3',
    text: 'Come to me, all you who are weary and burdened, and I will give you rest.',
    reference: 'Matthew 11:28',
    translation: 'NIV',
    explanation: 'Jesus invites you to bring your exhaustion and worries to Him for true rest.'
  },
  {
    id: '4',
    text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    reference: 'Joshua 1:9',
    translation: 'NIV',
    explanation: 'You are never alone. God\'s presence goes with you through every challenge.'
  },
  {
    id: '5',
    text: 'Cast all your anxiety on him because he cares for you.',
    reference: '1 Peter 5:7',
    translation: 'NIV',
    explanation: 'God wants to carry your worries. His care for you is personal and deep.'
  }
];

// Emotions data
const emotions = [
  { id: 'sad', label: 'Sad', icon: Heart },
  { id: 'lonely', label: 'Lonely', icon: User },
  { id: 'joyful', label: 'Joyful', icon: Flame },
  { id: 'grateful', label: 'Grateful', icon: Heart },
  { id: 'angry', label: 'Angry', icon: Flame },
  { id: 'stressed', label: 'Stressed', icon: HelpCircle },
  { id: 'afraid', label: 'Afraid', icon: HelpCircle },
  { id: 'hopeful', label: 'Hopeful', icon: Flame },
  { id: 'confused', label: 'Confused', icon: HelpCircle },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: HelpCircle },
  { id: 'peaceful', label: 'Peaceful', icon: Heart },
  { id: 'ashamed', label: 'Ashamed', icon: User },
];

// App Component
function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [, setPreviousScreen] = useState<Screen>('splash');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // User state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    purpose: '',
    connection: '',
    frequency: '',
    isGuest: false
  });
  
  // Search and results state
  const [, setSelectedEmotion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Verse[]>([]);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [savedVerses, setSavedVerses] = useState<Verse[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Settings
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [notifications, setNotifications] = useState(true);
  const [translation, setTranslation] = useState('NIV');

  // Navigation function with transition
  const navigateTo = (screen: Screen) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setPreviousScreen(currentScreen);
    
    setTimeout(() => {
      setCurrentScreen(screen);
      setIsTransitioning(false);
    }, 200);
  };

  // Splash screen auto-navigate
  useEffect(() => {
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        navigateTo('welcome');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  // Handle emotion selection
  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
    setSearchResults(sampleVerses);
    navigateTo('results');
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
      setSearchResults(sampleVerses);
      navigateTo('results');
    }
  };

  // Save verse
  const toggleSaveVerse = (verse: Verse) => {
    setSavedVerses(prev => {
      const exists = prev.find(v => v.id === verse.id);
      if (exists) {
        return prev.filter(v => v.id !== verse.id);
      }
      return [...prev, verse];
    });
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen onNavigate={navigateTo} />;
      case 'q1':
        return <PersonalizationQ1 
          onNavigate={navigateTo} 
          onSelect={(purpose) => setUserProfile(prev => ({ ...prev, purpose }))}
          selected={userProfile.purpose}
        />;
      case 'q2':
        return <PersonalizationQ2 
          onNavigate={navigateTo} 
          onSelect={(connection) => setUserProfile(prev => ({ ...prev, connection }))}
          selected={userProfile.connection}
        />;
      case 'q3':
        return <PersonalizationQ3 
          onNavigate={navigateTo} 
          onSelect={(frequency) => setUserProfile(prev => ({ ...prev, frequency }))}
          selected={userProfile.frequency}
        />;
      case 'ready':
        return <ReadyScreen onNavigate={navigateTo} profile={userProfile} />;
      case 'signup':
        return <SignUpScreen onNavigate={navigateTo} setProfile={setUserProfile} />;
      case 'paywall':
        return <PaywallScreen onNavigate={navigateTo} />;
      case 'home':
        return <HomeScreen 
          onNavigate={navigateTo} 
          profile={userProfile}
          savedVerses={savedVerses}
        />;
      case 'emotion-search':
        return <EmotionSearchScreen 
          onNavigate={navigateTo}
          onSelect={handleEmotionSelect}
        />;
      case 'curiosity-search':
        return <CuriositySearchScreen 
          onNavigate={navigateTo}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          recentSearches={recentSearches}
        />;
      case 'results':
        return <ResultsScreen 
          onNavigate={navigateTo}
          results={searchResults}
          onSelectVerse={(verse) => {
            setSelectedVerse(verse);
            navigateTo('verse-detail');
          }}
          savedVerses={savedVerses}
          onToggleSave={toggleSaveVerse}
        />;
      case 'verse-detail':
        return <VerseDetailScreen 
          onNavigate={navigateTo}
          verse={selectedVerse}
          savedVerses={savedVerses}
          onToggleSave={toggleSaveVerse}
          translation={translation}
        />;
      case 'profile':
        return <ProfileScreen 
          onNavigate={navigateTo}
          profile={userProfile}
          savedVerses={savedVerses}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          fontSize={fontSize}
          setFontSize={setFontSize}
          notifications={notifications}
          setNotifications={setNotifications}
          translation={translation}
          setTranslation={setTranslation}
        />;
      default:
        return <SplashScreen />;
    }
  };

  return (
    <div className={`screen-container ${darkMode ? 'dark' : ''}`}>
      <div className={`transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {renderScreen()}
      </div>
    </div>
  );
}

// S01: Splash Screen
function SplashScreen() {
  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="relative w-32 h-32 flame-flicker">
          <img 
            src="/wayfind-logo.jpeg" 
            alt="Wayfind" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="app-name animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Wayfind
        </h1>
      </div>
    </div>
  );
}

// S02: Welcome Screen
function WelcomeScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col safe-area">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-fade-in">
        <div className="w-24 h-24">
          <img 
            src="/wayfind-logo.jpeg" 
            alt="Wayfind" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="text-center max-w-xs">
          <h2 className="font-lora text-2xl text-wayfind-brown mb-4 leading-relaxed">
            "Find scripture for what you're feeling right now."
          </h2>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => onNavigate('q1')}
          className="btn-primary w-full text-center"
        >
          Get Started
        </button>
        <button 
          onClick={() => onNavigate('home')}
          className="btn-text w-full text-center py-3"
        >
          I'll browse first — guest mode
        </button>
      </div>
    </div>
  );
}

// S03: Personalization Q1
function PersonalizationQ1({ 
  onNavigate, 
  onSelect,
  selected 
}: { 
  onNavigate: (screen: Screen) => void;
  onSelect: (purpose: string) => void;
  selected: string;
}) {
  const options = [
    { id: 'daily', label: 'Daily guidance', icon: Calendar },
    { id: 'hard', label: 'Going through something hard', icon: Heart },
    { id: 'deepen', label: 'Deepen my faith', icon: BookOpen },
    { id: 'curious', label: 'Curious about scripture', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col safe-area">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        <div className="progress-dot active"></div>
        <div className="progress-dot"></div>
        <div className="progress-dot"></div>
      </div>
      
      <h2 className="section-header mb-8">What brings you to Wayfind?</h2>
      
      <div className="flex-1 grid grid-cols-2 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`emotion-tile ${selected === option.id ? 'active' : ''}`}
            >
              <Icon className="w-8 h-8" />
              <span className="font-dmsans text-sm text-center">{option.label}</span>
            </button>
          );
        })}
      </div>
      
      <div className="flex gap-4 mt-8">
        <button 
          onClick={() => onNavigate('welcome')}
          className="btn-secondary flex-1"
        >
          Back
        </button>
        <button 
          onClick={() => onNavigate('q2')}
          disabled={!selected}
          className="btn-primary flex-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// S04: Personalization Q2
function PersonalizationQ2({ 
  onNavigate, 
  onSelect,
  selected 
}: { 
  onNavigate: (screen: Screen) => void;
  onSelect: (connection: string) => void;
  selected: string;
}) {
  const options = [
    { id: 'reading', label: 'Reading scripture', icon: BookOpen },
    { id: 'prayer', label: 'Prayer', icon: MessageCircle },
    { id: 'worship', label: 'Worship music', icon: Music },
    { id: 'figuring', label: "I'm still figuring it out", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col safe-area">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        <div className="progress-dot active"></div>
        <div className="progress-dot active"></div>
        <div className="progress-dot"></div>
      </div>
      
      <h2 className="section-header mb-8">How do you usually connect with God?</h2>
      
      <div className="flex-1 grid grid-cols-2 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`emotion-tile ${selected === option.id ? 'active' : ''}`}
            >
              <Icon className="w-8 h-8" />
              <span className="font-dmsans text-sm text-center">{option.label}</span>
            </button>
          );
        })}
      </div>
      
      <div className="flex gap-4 mt-8">
        <button 
          onClick={() => onNavigate('q1')}
          className="btn-secondary flex-1"
        >
          Back
        </button>
        <button 
          onClick={() => onNavigate('q3')}
          disabled={!selected}
          className="btn-primary flex-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// S05: Personalization Q3
function PersonalizationQ3({ 
  onNavigate, 
  onSelect,
  selected 
}: { 
  onNavigate: (screen: Screen) => void;
  onSelect: (frequency: string) => void;
  selected: string;
}) {
  const options = [
    { id: 'daily', label: 'Daily', icon: Calendar },
    { id: 'weekly', label: 'A few times a week', icon: Calendar },
    { id: 'whenever', label: 'Whenever I need it', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col safe-area">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        <div className="progress-dot active"></div>
        <div className="progress-dot active"></div>
        <div className="progress-dot active"></div>
      </div>
      
      <h2 className="section-header mb-8">How often would you like to check in?</h2>
      
      <div className="flex-1 flex flex-col gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`emotion-tile flex-row justify-start px-6 py-5 ${selected === option.id ? 'active' : ''}`}
            >
              <Icon className="w-6 h-6" />
              <span className="font-dmsans text-base">{option.label}</span>
            </button>
          );
        })}
      </div>
      
      <div className="flex gap-4 mt-8">
        <button 
          onClick={() => onNavigate('q2')}
          className="btn-secondary flex-1"
        >
          Back
        </button>
        <button 
          onClick={() => onNavigate('ready')}
          disabled={!selected}
          className="btn-primary flex-1"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// S06: Ready Screen
function ReadyScreen({ 
  onNavigate, 
  profile 
}: { 
  onNavigate: (screen: Screen) => void;
  profile: UserProfile;
}) {
  const frequencyText: Record<string, string> = {
    daily: 'every morning',
    weekly: 'a few times a week',
    whenever: 'whenever you need it'
  };

  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col safe-area">
      <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-fade-in">
        <div className="w-20 h-20 bg-wayfind-amber/20 rounded-full flex items-center justify-center">
          <Check className="w-10 h-10 text-wayfind-amber" />
        </div>
        
        <div className="text-center">
          <h2 className="section-header mb-4">Your Wayfind is ready</h2>
          <p className="body-text text-center max-w-xs opacity-80">
            We've personalized your experience. Your daily verse arrives {frequencyText[profile.frequency] || 'when you need it'}.
          </p>
        </div>
      </div>
      
      <button 
        onClick={() => onNavigate('signup')}
        className="btn-primary w-full"
      >
        Let's go
      </button>
    </div>
  );
}

// S07: Sign Up / Login Screen
function SignUpScreen({ 
  onNavigate, 
  setProfile 
}: { 
  onNavigate: (screen: Screen) => void;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}) {
  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col safe-area">
      <button 
        onClick={() => onNavigate('ready')}
        className="absolute top-12 left-6 p-2 -ml-2 text-wayfind-brown hover:text-wayfind-amber transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-8 mt-8">
        <div className="w-20 h-20">
          <img 
            src="/wayfind-logo.jpeg" 
            alt="Wayfind" 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="text-center">
          <h2 className="section-header mb-2">Join Wayfind</h2>
          <p className="caption">Save verses and personalize your journey</p>
        </div>
        
        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={() => onNavigate('paywall')}
            className="w-full bg-wayfind-brown text-white font-dmsans font-semibold px-6 py-4 rounded-xl 
                       transition-all duration-300 hover:bg-wayfind-brown/90 flex items-center justify-center gap-3"
          >
            <span>Continue with Email</span>
          </button>
          
          <button 
            onClick={() => onNavigate('paywall')}
            className="w-full bg-white text-wayfind-near-black font-dmsans font-semibold px-6 py-4 rounded-xl 
                       border border-wayfind-brown/10 transition-all duration-300 hover:bg-wayfind-offwhite 
                       flex items-center justify-center gap-3"
          >
            <span>Continue with Google</span>
          </button>
          
          <button 
            onClick={() => onNavigate('paywall')}
            className="w-full bg-wayfind-near-black text-white font-dmsans font-semibold px-6 py-4 rounded-xl 
                       transition-all duration-300 hover:bg-wayfind-near-black/90 flex items-center justify-center gap-3"
          >
            <span>Continue with Apple</span>
          </button>
        </div>
      </div>
      
      <button 
        onClick={() => {
          setProfile(prev => ({ ...prev, isGuest: true }));
          onNavigate('home');
        }}
        className="btn-text w-full text-center py-4"
      >
        Continue as Guest
      </button>
    </div>
  );
}

// S08: Paywall Screen
function PaywallScreen({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col safe-area">
      <button 
        onClick={() => onNavigate('signup')}
        className="absolute top-12 left-6 p-2 -ml-2 text-wayfind-brown hover:text-wayfind-amber transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
      
      <div className="flex-1 flex flex-col mt-16">
        <div className="text-center mb-8">
          <h2 className="section-header mb-2">Unlock Wayfind Premium</h2>
          <p className="caption">Deeper guidance, more features</p>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="wayfind-card">
            <h3 className="font-dmsans font-bold text-wayfind-brown mb-4">Free</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 body-text">
                <Check className="w-5 h-5 text-wayfind-amber" />
                Daily verse
              </li>
              <li className="flex items-center gap-3 body-text">
                <Check className="w-5 h-5 text-wayfind-amber" />
                Basic search
              </li>
              <li className="flex items-center gap-3 body-text">
                <Check className="w-5 h-5 text-wayfind-amber" />
                Save up to 10 verses
              </li>
            </ul>
          </div>
          
          <div className="wayfind-card border-2 border-wayfind-amber">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-dmsans font-bold text-wayfind-brown">Premium</h3>
              <span className="bg-wayfind-amber text-white text-xs font-dmsans font-semibold px-2 py-1 rounded">7-day free trial</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 body-text">
                <Check className="w-5 h-5 text-wayfind-amber" />
                Unlimited verse saves
              </li>
              <li className="flex items-center gap-3 body-text">
                <Check className="w-5 h-5 text-wayfind-amber" />
                Guided journeys
              </li>
              <li className="flex items-center gap-3 body-text">
                <Check className="w-5 h-5 text-wayfind-amber" />
                Multiple translations
              </li>
              <li className="flex items-center gap-3 body-text">
                <Check className="w-5 h-5 text-wayfind-amber" />
                Offline access
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mt-8">
          <button 
            onClick={() => onNavigate('home')}
            className="btn-primary w-full"
          >
            Start 7-Day Free Trial
          </button>
          <button 
            onClick={() => onNavigate('home')}
            className="btn-text w-full text-center py-3"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

// S09: Home Screen
function HomeScreen({ 
  onNavigate, 
  profile,
  savedVerses
}: { 
  onNavigate: (screen: Screen) => void;
  profile: UserProfile;
  savedVerses: Verse[];
}) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const dailyVerse = sampleVerses[0];

  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col">
      <div className="flex-1 safe-area pb-24">
        {/* Header */}
        <div className="mb-8">
          <p className="caption mb-1">{today}</p>
          <h2 className="section-header">
            {profile.name ? `Good morning, ${profile.name}` : 'Good morning'}
          </h2>
        </div>
        
        {/* Daily Verse */}
        <div className="wayfind-card mb-8">
          <p className="caption mb-4">Today's verse</p>
          <p className="verse-text mb-4">"{dailyVerse.text}"</p>
          <p className="verse-reference">{dailyVerse.reference}</p>
        </div>
        
        {/* Search Options */}
        <div className="space-y-4">
          <p className="caption">How can we help you today?</p>
          
          <button 
            onClick={() => onNavigate('emotion-search')}
            className="w-full bg-wayfind-brown text-white font-dmsans font-semibold px-6 py-5 rounded-xl 
                       transition-all duration-300 hover:bg-wayfind-brown/90 flex items-center justify-between"
          >
            <span>Search by Feeling</span>
            <Heart className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => onNavigate('curiosity-search')}
            className="w-full bg-wayfind-amber text-white font-dmsans font-semibold px-6 py-5 rounded-xl 
                       transition-all duration-300 hover:bg-wayfind-amber/90 flex items-center justify-between"
          >
            <span>Search by Curiosity</span>
            <Search className="w-5 h-5" />
          </button>
        </div>
        
        {/* Saved Verses Preview */}
        {savedVerses.length > 0 && (
          <div className="mt-8">
            <p className="caption mb-4">Recently saved</p>
            <div className="wayfind-card">
              <p className="verse-text text-sm">"{savedVerses[0].text.substring(0, 100)}..."</p>
              <p className="verse-reference mt-2">{savedVerses[0].reference}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentScreen="home" />
    </div>
  );
}

// S10: Emotion Search Screen
function EmotionSearchScreen({ 
  onNavigate,
  onSelect
}: { 
  onNavigate: (screen: Screen) => void;
  onSelect: (emotionId: string) => void;
}) {
  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col">
      <div className="safe-area pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => onNavigate('home')}
            className="p-2 -ml-2 text-wayfind-brown hover:text-wayfind-amber transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="section-header">How are you feeling?</h2>
        </div>
        
        {/* Emotion Grid */}
        <div className="grid grid-cols-3 gap-3">
          {emotions.map((emotion) => {
            const Icon = emotion.icon;
            return (
              <button
                key={emotion.id}
                onClick={() => onSelect(emotion.id)}
                className="emotion-tile aspect-square"
              >
                <Icon className="w-6 h-6" />
                <span className="font-dmsans text-xs text-center">{emotion.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentScreen="emotion-search" />
    </div>
  );
}

// S11: Curiosity Search Screen
function CuriositySearchScreen({ 
  onNavigate,
  searchQuery,
  setSearchQuery,
  onSearch,
  recentSearches
}: { 
  onNavigate: (screen: Screen) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  recentSearches: string[];
}) {
  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col">
      <div className="safe-area pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => onNavigate('home')}
            className="p-2 -ml-2 text-wayfind-brown hover:text-wayfind-amber transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="section-header">What are you going through?</h2>
        </div>
        
        {/* Search Input */}
        <div className="relative mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Search by feeling or question..."
            className="wayfind-input w-full pr-12"
          />
          <button 
            onClick={onSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-wayfind-amber hover:text-wayfind-amber/80 transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
        
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div>
            <p className="caption mb-4">Recent searches</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(search);
                    onSearch();
                  }}
                  className="bg-wayfind-amber-tint text-wayfind-brown font-dmsans text-sm px-4 py-2 rounded-full
                           transition-all duration-300 hover:bg-wayfind-amber/20"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Suggested Topics */}
        <div className="mt-8">
          <p className="caption mb-4">Popular topics</p>
          <div className="flex flex-wrap gap-2">
            {['Anxiety', 'Hope', 'Strength', 'Peace', 'Love', 'Healing'].map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSearchQuery(topic);
                  onSearch();
                }}
                className="bg-wayfind-amber-tint text-wayfind-brown font-dmsans text-sm px-4 py-2 rounded-full
                         transition-all duration-300 hover:bg-wayfind-amber/20"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentScreen="curiosity-search" />
    </div>
  );
}

// S12: Results Screen
function ResultsScreen({ 
  onNavigate,
  results,
  onSelectVerse,
  savedVerses,
  onToggleSave
}: { 
  onNavigate: (screen: Screen) => void;
  results: Verse[];
  onSelectVerse: (verse: Verse) => void;
  savedVerses: Verse[];
  onToggleSave: (verse: Verse) => void;
}) {
  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col">
      <div className="safe-area pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => onNavigate('emotion-search')}
            className="p-2 -ml-2 text-wayfind-brown hover:text-wayfind-amber transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="section-header">Verses for you</h2>
            <p className="caption">{results.length} scriptures found</p>
          </div>
        </div>
        
        {/* Results */}
        <div className="space-y-4">
          {results.map((verse) => {
            const isSaved = savedVerses.some(v => v.id === verse.id);
            return (
              <div 
                key={verse.id}
                className="wayfind-card cursor-pointer"
                onClick={() => onSelectVerse(verse)}
              >
                <p className="verse-text mb-3">"{verse.text.substring(0, 120)}..."</p>
                <div className="flex items-center justify-between">
                  <p className="verse-reference">{verse.reference}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(verse);
                      }}
                      className="p-2 text-wayfind-brown hover:text-wayfind-amber transition-colors"
                    >
                      <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-wayfind-amber text-wayfind-amber' : ''}`} />
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-wayfind-brown hover:text-wayfind-amber transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentScreen="results" />
    </div>
  );
}

// S13: Verse Detail Screen
function VerseDetailScreen({ 
  onNavigate,
  verse,
  savedVerses,
  onToggleSave,
  translation
}: { 
  onNavigate: (screen: Screen) => void;
  verse: Verse | null;
  savedVerses: Verse[];
  onToggleSave: (verse: Verse) => void;
  translation: string;
}) {
  if (!verse) return null;
  
  const isSaved = savedVerses.some(v => v.id === verse.id);

  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col">
      <div className="safe-area pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => onNavigate('results')}
            className="p-2 -ml-2 text-wayfind-brown hover:text-wayfind-amber transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => onToggleSave(verse)}
              className="p-2 text-wayfind-brown hover:text-wayfind-amber transition-colors"
            >
              <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-wayfind-amber text-wayfind-amber' : ''}`} />
            </button>
            <button className="p-2 text-wayfind-brown hover:text-wayfind-amber transition-colors">
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Verse */}
        <div className="text-center mb-8">
          <p className="verse-text text-xl leading-loose mb-6">"{verse.text}"</p>
          <p className="verse-reference text-lg">{verse.reference} • {translation}</p>
        </div>
        
        {/* Explanation */}
        <div className="wayfind-card mb-8">
          <p className="caption mb-3">Reflection</p>
          <p className="body-text">{verse.explanation}</p>
        </div>
        
        {/* Related Verses */}
        <div>
          <p className="caption mb-4">You might also like</p>
          <div className="space-y-3">
            {sampleVerses.filter(v => v.id !== verse.id).slice(0, 2).map((relatedVerse) => (
              <button
                key={relatedVerse.id}
                onClick={() => onToggleSave(relatedVerse)}
                className="w-full wayfind-card text-left"
              >
                <p className="verse-text text-sm mb-2">"{relatedVerse.text.substring(0, 80)}..."</p>
                <p className="verse-reference">{relatedVerse.reference}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentScreen="verse-detail" />
    </div>
  );
}

// S14: Profile Screen
function ProfileScreen({ 
  onNavigate,
  profile: _profile,
  savedVerses,
  darkMode,
  setDarkMode,
  fontSize,
  setFontSize,
  notifications,
  setNotifications,
  translation,
  setTranslation
}: { 
  onNavigate: (screen: Screen) => void;
  profile: UserProfile;
  savedVerses: Verse[];
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  fontSize: number;
  setFontSize: (value: number) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  translation: string;
  setTranslation: (value: string) => void;
}) {
  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col">
      <div className="safe-area pb-24">
        {/* Header */}
        <h2 className="section-header mb-8">Profile</h2>
        
        {/* Saved Verses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="caption">Saved verses</p>
            <span className="bg-wayfind-amber text-white text-xs font-dmsans font-semibold px-2 py-1 rounded-full">
              {savedVerses.length}
            </span>
          </div>
          
          {savedVerses.length > 0 ? (
            <div className="space-y-3">
              {savedVerses.map((verse) => (
                <div key={verse.id} className="wayfind-card">
                  <p className="verse-text text-sm mb-2">"{verse.text.substring(0, 100)}..."</p>
                  <p className="verse-reference">{verse.reference}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="wayfind-card text-center py-8">
              <p className="body-text opacity-60">No saved verses yet</p>
              <p className="caption mt-2">Start exploring to save your favorites</p>
            </div>
          )}
        </div>
        
        {/* Settings */}
        <div className="space-y-6">
          <p className="caption">Settings</p>
          
          {/* Translation */}
          <div className="wayfind-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-wayfind-brown" />
                <span className="body-text">Translation</span>
              </div>
              <select 
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="bg-transparent font-dmsans text-wayfind-amber font-medium text-right"
              >
                <option value="NIV">NIV</option>
                <option value="KJV">KJV</option>
                <option value="WEB">WEB</option>
              </select>
            </div>
          </div>
          
          {/* Dark Mode */}
          <div className="wayfind-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-wayfind-brown" />
                <span className="body-text">Dark mode</span>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full transition-colors duration-300 ${darkMode ? 'bg-wayfind-amber' : 'bg-wayfind-brown/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
          
          {/* Font Size */}
          <div className="wayfind-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-wayfind-brown" />
                <span className="body-text">Font size</span>
              </div>
              <span className="font-dmsans text-wayfind-amber font-medium">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-wayfind-amber"
            />
          </div>
          
          {/* Notifications */}
          <div className="wayfind-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-wayfind-brown" />
                <span className="body-text">Daily reminders</span>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors duration-300 ${notifications ? 'bg-wayfind-amber' : 'bg-wayfind-brown/20'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-300 ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Account */}
        <div className="mt-8 space-y-3">
          <p className="caption">Account</p>
          <button className="w-full wayfind-card flex items-center justify-between">
            <span className="body-text">Subscription</span>
            <span className="font-dmsans text-wayfind-amber font-medium">Free</span>
          </button>
          <button 
            onClick={() => onNavigate('welcome')}
            className="w-full wayfind-card flex items-center justify-center text-wayfind-brown/60"
          >
            <span className="body-text">Sign out</span>
          </button>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav onNavigate={onNavigate} currentScreen="profile" />
    </div>
  );
}

// Bottom Navigation Component
function BottomNav({ 
  onNavigate, 
  currentScreen 
}: { 
  onNavigate: (screen: Screen) => void;
  currentScreen: Screen;
}) {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'emotion-search', label: 'Search', icon: Search },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-wayfind-offwhite border-t border-wayfind-brown/10 px-6 py-3">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id || 
            (item.id === 'search' && ['emotion-search', 'curiosity-search', 'results', 'verse-detail'].includes(currentScreen));
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Screen)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-dmsans">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default App;
