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
import { posthog } from './lib/posthog';

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
  | 'saved'
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

// Full KJV Verse Database
const verseDb: (Verse & { emotions: string[] })[] = [
  // SAD
  { id: 's1', text: 'The Lord is nigh unto them that are of a broken heart; and saveth such as be of a contrite spirit.', reference: 'Psalm 34:18', translation: 'KJV', explanation: 'God is not far when your heart is shattered. He draws close to the brokenhearted — not away from them.', emotions: ['sad'] },
  { id: 's2', text: 'Weeping may endure for a night, but joy cometh in the morning.', reference: 'Psalm 30:5', translation: 'KJV', explanation: 'Your tears are real, but they are not the final word. A new morning — and new joy — is always coming.', emotions: ['sad', 'hopeful'] },
  { id: 's3', text: 'He healeth the broken in heart, and bindeth up their wounds.', reference: 'Psalm 147:3', translation: 'KJV', explanation: 'God is a healer — not just of bodies, but of broken hearts. He tends to your wounds with care.', emotions: ['sad', 'ashamed'] },
  { id: 's4', text: 'Cast thy burden upon the Lord, and he shall sustain thee: he shall never suffer the righteous to be moved.', reference: 'Psalm 55:22', translation: 'KJV', explanation: 'You were never meant to carry your grief alone. God invites you to place it in His hands.', emotions: ['sad', 'overwhelmed'] },
  { id: 's5', text: 'Jesus wept.', reference: 'John 11:35', translation: 'KJV', explanation: 'The shortest verse in the Bible carries one of its deepest truths — Jesus is not unmoved by your pain. He weeps with you.', emotions: ['sad', 'lonely'] },

  // LONELY
  { id: 'l1', text: 'Be strong and of a good courage, fear not, nor be afraid of them: for the Lord thy God, he it is that doth go with thee; he will not fail thee, nor forsake thee.', reference: 'Deuteronomy 31:6', translation: 'KJV', explanation: 'No matter how abandoned you feel, God has made a promise — He will not leave you. Not now, not ever.', emotions: ['lonely', 'afraid'] },
  { id: 'l2', text: 'I will never leave thee, nor forsake thee.', reference: 'Hebrews 13:5', translation: 'KJV', explanation: 'These words are a direct promise from God to you. His presence is constant, even when you cannot feel it.', emotions: ['lonely'] },
  { id: 'l3', text: 'God setteth the solitary in families: he bringeth out those which are bound with chains.', reference: 'Psalm 68:6', translation: 'KJV', explanation: 'God sees those who are alone and works to bring them into belonging. Isolation is not your permanent home.', emotions: ['lonely'] },
  { id: 'l4', text: 'Turn thee unto me, and have mercy upon me; for I am desolate and afflicted.', reference: 'Psalm 25:16', translation: 'KJV', explanation: 'Even David, a man after God\'s own heart, cried out from loneliness. God welcomes this honest prayer.', emotions: ['lonely', 'sad'] },
  { id: 'l5', text: 'Lo, I am with you always, even unto the end of the world.', reference: 'Matthew 28:20', translation: 'KJV', explanation: 'Jesus\' final promise before ascending was this: I am with you always. Always means now, too.', emotions: ['lonely', 'afraid'] },

  // JOYFUL
  { id: 'j1', text: 'This is the day which the Lord hath made; we will rejoice and be glad in it.', reference: 'Psalm 118:24', translation: 'KJV', explanation: 'Every single day is a gift crafted by God. Joy is not just an emotion — it\'s a choice to recognise His goodness.', emotions: ['joyful', 'grateful'] },
  { id: 'j2', text: 'Rejoice in the Lord always: and again I say, Rejoice.', reference: 'Philippians 4:4', translation: 'KJV', explanation: 'Paul wrote these words from prison — which tells us this joy isn\'t about circumstances. It\'s rooted in who God is.', emotions: ['joyful'] },
  { id: 'j3', text: 'The joy of the Lord is your strength.', reference: 'Nehemiah 8:10', translation: 'KJV', explanation: 'Joy isn\'t just a feeling — it\'s a source of power. When you find your joy in God, it strengthens you.', emotions: ['joyful', 'hopeful'] },
  { id: 'j4', text: 'Thou wilt shew me the path of life: in thy presence is fulness of joy; at thy right hand there are pleasures for evermore.', reference: 'Psalm 16:11', translation: 'KJV', explanation: 'True and lasting joy is found in God\'s presence — not in circumstances, achievements, or people.', emotions: ['joyful', 'peaceful'] },
  { id: 'j5', text: 'Delight thyself also in the Lord: and he shall give thee the desires of thine heart.', reference: 'Psalm 37:4', translation: 'KJV', explanation: 'When God becomes your delight, something beautiful happens — your deepest desires align with His will.', emotions: ['joyful', 'grateful'] },

  // GRATEFUL
  { id: 'g1', text: 'In every thing give thanks: for this is the will of God in Christ Jesus concerning you.', reference: '1 Thessalonians 5:18', translation: 'KJV', explanation: 'Gratitude isn\'t just polite — it\'s God\'s will for you. Thankfulness changes the lens through which you see everything.', emotions: ['grateful'] },
  { id: 'g2', text: 'O give thanks unto the Lord; for he is good: for his mercy endureth for ever.', reference: 'Psalm 136:1', translation: 'KJV', explanation: 'God\'s goodness and mercy are not occasional — they are eternal. This is the foundation of a grateful heart.', emotions: ['grateful'] },
  { id: 'g3', text: 'Bless the Lord, O my soul: and all that is within me, bless his holy name. Bless the Lord, O my soul, and forget not all his benefits.', reference: 'Psalm 103:1-2', translation: 'KJV', explanation: 'David reminds himself to remember God\'s blessings — because gratitude is often a discipline before it becomes a delight.', emotions: ['grateful', 'joyful'] },
  { id: 'g4', text: 'Every good gift and every perfect gift is from above, and cometh down from the Father of lights.', reference: 'James 1:17', translation: 'KJV', explanation: 'Every good thing in your life — big or small — traces back to a generous God. Gratitude is simply recognising the source.', emotions: ['grateful'] },
  { id: 'g5', text: 'Enter into his gates with thanksgiving, and into his courts with praise.', reference: 'Psalm 100:4', translation: 'KJV', explanation: 'Gratitude is the doorway into God\'s presence. A thankful heart opens you up to encounter Him.', emotions: ['grateful', 'peaceful'] },

  // ANGRY
  { id: 'a1', text: 'Be ye angry, and sin not: let not the sun go down upon your wrath.', reference: 'Ephesians 4:26', translation: 'KJV', explanation: 'Anger itself is not a sin — God made emotions. But unresolved, festering anger opens a door to harm. Bring it to God before the day ends.', emotions: ['angry'] },
  { id: 'a2', text: 'A soft answer turneth away wrath: but grievous words stir up anger.', reference: 'Proverbs 15:1', translation: 'KJV', explanation: 'There is power in gentleness. A calm response can defuse a situation that harsh words would only ignite.', emotions: ['angry'] },
  { id: 'a3', text: 'Cease from anger, and forsake wrath: fret not thyself in any wise to do evil.', reference: 'Psalm 37:8', translation: 'KJV', explanation: 'Holding onto anger rarely hurts the person who wronged you — it mostly hurts you. Let it go, and let God handle justice.', emotions: ['angry'] },
  { id: 'a4', text: 'Dearly beloved, avenge not yourselves, but rather give place unto wrath: for it is written, Vengeance is mine; I will repay, saith the Lord.', reference: 'Romans 12:19', translation: 'KJV', explanation: 'When someone has wronged you deeply, God says: let Me handle this. Release the need to repay, and find freedom.', emotions: ['angry'] },
  { id: 'a5', text: 'He that is slow to anger is better than the mighty; and he that ruleth his spirit than he that taketh a city.', reference: 'Proverbs 16:32', translation: 'KJV', explanation: 'Self-control is strength, not weakness. The person who masters their anger has won a greater battle than any warrior.', emotions: ['angry'] },

  // STRESSED
  { id: 'st1', text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', reference: 'Matthew 11:28', translation: 'KJV', explanation: 'Jesus doesn\'t say "manage better" or "try harder." He says come to Me. The rest you\'re looking for is found in Him.', emotions: ['stressed', 'overwhelmed'] },
  { id: 'st2', text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.', reference: 'Philippians 4:6', translation: 'KJV', explanation: '"Be careful for nothing" means don\'t be anxious about anything. Instead, bring it all to God in prayer — the big things and the small ones.', emotions: ['stressed', 'afraid'] },
  { id: 'st3', text: 'Cast all your care upon him; for he careth for you.', reference: '1 Peter 5:7', translation: 'KJV', explanation: 'God isn\'t burdened by your worries — He actually cares for you. You can give Him everything weighing on you.', emotions: ['stressed', 'overwhelmed'] },
  { id: 'st4', text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.', reference: 'John 14:27', translation: 'KJV', explanation: 'The peace Jesus offers is not the absence of problems — it\'s a deep, steady calm that exists even in the middle of chaos.', emotions: ['stressed', 'afraid', 'peaceful'] },
  { id: 'st5', text: 'Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.', reference: 'Isaiah 26:3', translation: 'KJV', explanation: 'The secret to peace in stressful times is where your mind rests. Fix your thoughts on God, and He will guard your peace.', emotions: ['stressed', 'peaceful'] },

  // AFRAID
  { id: 'af1', text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee.', reference: 'Isaiah 41:10', translation: 'KJV', explanation: 'God gives five promises in one verse: I am with you, I am your God, I will strengthen you, I will help you, I will uphold you. You are not facing this alone.', emotions: ['afraid'] },
  { id: 'af2', text: 'The Lord is my light and my salvation; whom shall I fear? the Lord is the strength of my life; of whom shall I be afraid?', reference: 'Psalm 27:1', translation: 'KJV', explanation: 'When God is your light in darkness and your strength in weakness, fear loses its grip. He is bigger than what you\'re facing.', emotions: ['afraid'] },
  { id: 'af3', text: 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.', reference: '2 Timothy 1:7', translation: 'KJV', explanation: 'Fear is not from God. When fear speaks loudly, remember what God has actually given you: power, love, and a clear mind.', emotions: ['afraid'] },
  { id: 'af4', text: 'What time I am afraid, I will trust in thee.', reference: 'Psalm 56:3', translation: 'KJV', explanation: 'This is one of the most honest prayers in scripture. Not "I am never afraid" but "when I am afraid, I choose trust." That is faith.', emotions: ['afraid'] },
  { id: 'af5', text: 'There is no fear in love; but perfect love casteth out fear.', reference: '1 John 4:18', translation: 'KJV', explanation: 'God\'s love for you is so complete, so certain, that if you truly receive it, fear has no room left to live.', emotions: ['afraid', 'lonely'] },

  // HOPEFUL
  { id: 'h1', text: 'For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.', reference: 'Jeremiah 29:11', translation: 'KJV', explanation: 'God is thinking about your future right now — and His thoughts are good. You have a hope and a future.', emotions: ['hopeful'] },
  { id: 'h2', text: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.', reference: 'Romans 15:13', translation: 'KJV', explanation: 'Hope is not wishful thinking — it\'s a gift from the God who is the very source of hope. Ask Him to fill you with it.', emotions: ['hopeful', 'joyful'] },
  { id: 'h3', text: 'But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles.', reference: 'Isaiah 40:31', translation: 'KJV', explanation: 'Waiting on God is not passive resignation — it\'s active trust that He is working. And in that waiting, strength is renewed.', emotions: ['hopeful', 'stressed'] },
  { id: 'h4', text: 'For the vision is yet for an appointed time, but at the end it shall speak, and not lie: though it tarry, wait for it; because it will surely come, it will not tarry.', reference: 'Habakkuk 2:3', translation: 'KJV', explanation: 'God\'s promises have a timing that is not always ours. But they will come. Hold on.', emotions: ['hopeful'] },
  { id: 'h5', text: 'And we know that all things work together for good to them that love God.', reference: 'Romans 8:28', translation: 'KJV', explanation: 'Not some things. All things. Even the painful, confusing, difficult things — God is weaving them into something good.', emotions: ['hopeful', 'confused'] },

  // CONFUSED
  { id: 'c1', text: 'Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.', reference: 'Proverbs 3:5-6', translation: 'KJV', explanation: 'When you can\'t figure out the path forward, God can. Release the need to understand everything and trust the One who does.', emotions: ['confused'] },
  { id: 'c2', text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.', reference: 'James 1:5', translation: 'KJV', explanation: 'You don\'t have to figure this out alone. God gives wisdom generously to anyone who asks — without making you feel foolish for needing it.', emotions: ['confused'] },
  { id: 'c3', text: 'For God is not the author of confusion, but of peace.', reference: '1 Corinthians 14:33', translation: 'KJV', explanation: 'Confusion doesn\'t come from God. When you\'re overwhelmed with uncertainty, you can ask Him to bring clarity — it\'s His nature to do so.', emotions: ['confused', 'stressed'] },
  { id: 'c4', text: 'Thy word is a lamp unto my feet, and a light unto my path.', reference: 'Psalm 119:105', translation: 'KJV', explanation: 'A lamp shows you the next step, not the whole journey. God gives enough light for right now — and that is enough.', emotions: ['confused', 'afraid'] },
  { id: 'c5', text: 'The steps of a good man are ordered by the Lord: and he delighteth in his way.', reference: 'Psalm 37:23', translation: 'KJV', explanation: 'Even when you can\'t see where you\'re going, God is ordering your steps. Your confusion does not cancel His direction.', emotions: ['confused', 'hopeful'] },

  // OVERWHELMED
  { id: 'o1', text: 'When my heart is overwhelmed: lead me to the rock that is higher than I.', reference: 'Psalm 61:2', translation: 'KJV', explanation: 'David didn\'t pretend to be strong when he was overwhelmed. He cried out for a higher place — and so can you.', emotions: ['overwhelmed'] },
  { id: 'o2', text: 'My grace is sufficient for thee: for my strength is made perfect in weakness.', reference: '2 Corinthians 12:9', translation: 'KJV', explanation: 'You don\'t need to have it all together. God\'s power is most visible in your weakest moments. Your limits are where His grace begins.', emotions: ['overwhelmed', 'stressed'] },
  { id: 'o3', text: 'I can do all things through Christ which strengtheneth me.', reference: 'Philippians 4:13', translation: 'KJV', explanation: 'This isn\'t a promise of superhuman ability — it\'s a promise that whatever God calls you to face, He will give you the strength for it.', emotions: ['overwhelmed', 'hopeful'] },
  { id: 'o4', text: 'God is our refuge and strength, a very present help in trouble.', reference: 'Psalm 46:1', translation: 'KJV', explanation: 'When everything feels like it\'s collapsing, God is a refuge — a place of safety you can run to right now.', emotions: ['overwhelmed', 'afraid'] },
  { id: 'o5', text: 'Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.', reference: 'Matthew 6:34', translation: 'KJV', explanation: 'Jesus says: don\'t carry tomorrow\'s weight today. Focus on what\'s in front of you right now. That is enough.', emotions: ['overwhelmed', 'stressed'] },

  // PEACEFUL
  { id: 'p1', text: 'The Lord bless thee, and keep thee: The Lord make his face shine upon thee, and be gracious unto thee: The Lord lift up his countenance upon thee, and give thee peace.', reference: 'Numbers 6:24-26', translation: 'KJV', explanation: 'This ancient blessing has been spoken over God\'s people for thousands of years. It is spoken over you today.', emotions: ['peaceful'] },
  { id: 'p2', text: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.', reference: 'Philippians 4:7', translation: 'KJV', explanation: 'God\'s peace doesn\'t make logical sense in hard circumstances — it surpasses understanding. And it guards your heart.', emotions: ['peaceful'] },
  { id: 'p3', text: 'The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters.', reference: 'Psalm 23:1-2', translation: 'KJV', explanation: 'When God is your shepherd, He leads you to rest — not because life is easy, but because He provides what you truly need.', emotions: ['peaceful', 'grateful'] },
  { id: 'p4', text: 'Return unto thy rest, O my soul; for the Lord hath dealt bountifully with thee.', reference: 'Psalm 116:7', translation: 'KJV', explanation: 'Sometimes you need to remind your soul to rest — to remember how God has already been good to you.', emotions: ['peaceful', 'grateful'] },
  { id: 'p5', text: 'Great peace have they which love thy law: and nothing shall offend them.', reference: 'Psalm 119:165', translation: 'KJV', explanation: 'There is a deep, settled peace available to those who walk closely with God. It is not shaken by offences or uncertainty.', emotions: ['peaceful'] },

  // ASHAMED
  { id: 'ash1', text: 'If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.', reference: '1 John 1:9', translation: 'KJV', explanation: 'You don\'t need to carry shame alone. Bring it to God honestly, and He promises to forgive and cleanse — completely.', emotions: ['ashamed'] },
  { id: 'ash2', text: 'There is therefore now no condemnation to them which are in Christ Jesus.', reference: 'Romans 8:1', translation: 'KJV', explanation: 'This may be the most liberating verse in the Bible. If you are in Christ, the verdict is already in — no condemnation. None.', emotions: ['ashamed'] },
  { id: 'ash3', text: 'As far as the east is from the west, so far hath he removed our transgressions from us.', reference: 'Psalm 103:12', translation: 'KJV', explanation: 'East and west never meet. That\'s how completely God removes what you\'ve done wrong when you come to Him. Gone.', emotions: ['ashamed'] },
  { id: 'ash4', text: 'Come now, and let us reason together, saith the Lord: though your sins be as scarlet, they shall be as white as snow.', reference: 'Isaiah 1:18', translation: 'KJV', explanation: 'God invites you into a conversation, not a courtroom. And His offer is radical: the deepest stain becomes pure white.', emotions: ['ashamed'] },
  { id: 'ash5', text: 'For all have sinned, and come short of the glory of God; Being justified freely by his grace through the redemption that is in Christ Jesus.', reference: 'Romans 3:23-24', translation: 'KJV', explanation: 'You are not uniquely broken. Every person has fallen short. And every person can receive the same free grace through Christ.', emotions: ['ashamed', 'lonely'] },
];

// Build all-verses array and emotion lookup map
const allVerses: Verse[] = verseDb.map(({ emotions: _e, ...v }) => v);

const versesByEmotion: Record<string, Verse[]> = {};
verseDb.forEach(({ emotions, ...verse }) => {
  emotions.forEach(emotion => {
    if (!versesByEmotion[emotion]) versesByEmotion[emotion] = [];
    versesByEmotion[emotion].push(verse);
  });
});

// Partial-match search across text, reference, and explanation
const searchVerses = (query: string): Verse[] => {
  const q = query.toLowerCase().trim();
  if (!q) return allVerses;
  return verseDb
    .filter(v =>
      v.text.toLowerCase().includes(q) ||
      v.reference.toLowerCase().includes(q) ||
      v.explanation.toLowerCase().includes(q) ||
      v.emotions.some(e => e.includes(q))
    )
    .map(({ emotions: _e, ...v }) => v);
};

// Keep sampleVerses pointing to allVerses for any remaining references
const sampleVerses = allVerses;

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
  const [translation, setTranslation] = useState('KJV');


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
    setSearchResults(versesByEmotion[emotionId] ?? allVerses);
    posthog.capture('emotion search performed', { emotion: emotionId, results_count: (versesByEmotion[emotionId] ?? allVerses).length });
    navigateTo('results');
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchVerses(searchQuery);
      setRecentSearches(prev => [searchQuery, ...prev.filter(s => s !== searchQuery).slice(0, 4)]);
      setSearchResults(results);
      posthog.capture('curiosity search performed', { query: searchQuery, results_count: results.length });
      navigateTo('results');
    }
  };

  // Save verse
  const toggleSaveVerse = (verse: Verse) => {
    setSavedVerses(prev => {
      const exists = prev.find(v => v.id === verse.id);
      if (exists) {
        posthog.capture('verse unsaved', { verse_id: verse.id, reference: verse.reference });
        return prev.filter(v => v.id !== verse.id);
      }
      posthog.capture('verse saved', { verse_id: verse.id, reference: verse.reference });
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
          onSelect={(purpose) => {
            setUserProfile(prev => ({ ...prev, purpose }));
            posthog.capture('onboarding question answered', { question: 'purpose', answer: purpose });
          }}
          selected={userProfile.purpose}
        />;
      case 'q2':
        return <PersonalizationQ2
          onNavigate={navigateTo}
          onSelect={(connection) => {
            setUserProfile(prev => ({ ...prev, connection }));
            posthog.capture('onboarding question answered', { question: 'connection', answer: connection });
          }}
          selected={userProfile.connection}
        />;
      case 'q3':
        return <PersonalizationQ3
          onNavigate={navigateTo}
          onSelect={(frequency) => {
            setUserProfile(prev => ({ ...prev, frequency }));
            posthog.capture('onboarding question answered', { question: 'frequency', answer: frequency });
          }}
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
            posthog.capture('verse viewed', { verse_id: verse.id, reference: verse.reference });
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
          onSelectVerse={(verse) => {
            setSelectedVerse(verse);
            navigateTo('verse-detail');
          }}
        />;
      case 'saved':
        return <SavedScreen
          onNavigate={navigateTo}
          savedVerses={savedVerses}
          onToggleSave={toggleSaveVerse}
          onSelectVerse={(verse) => {
            setSelectedVerse(verse);
            navigateTo('verse-detail');
          }}
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
          setTranslation={(val) => {
            posthog.capture('translation changed', { from: translation, to: val });
            setTranslation(val);
          }}
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
          onClick={() => {
            posthog.capture('onboarding started');
            onNavigate('q1');
          }}
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
  profile,
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
        onClick={() => {
          posthog.capture('onboarding completed', { purpose: profile.purpose, connection: profile.connection, frequency: profile.frequency });
          onNavigate('signup');
        }}
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
  setProfile,
}: {
  onNavigate: (screen: Screen) => void;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}) {
  const handleSignup = (method: string) => {
    posthog.capture('user signed up', { method });
    posthog.identify(posthog.get_distinct_id(), { signup_method: method });
    onNavigate('paywall');
  };

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
            onClick={() => handleSignup('email')}
            className="w-full bg-wayfind-brown text-white font-dmsans font-semibold px-6 py-4 rounded-xl
                       transition-all duration-300 hover:bg-wayfind-brown/90 flex items-center justify-center gap-3"
          >
            <span>Continue with Email</span>
          </button>

          <button
            onClick={() => handleSignup('google')}
            className="w-full bg-white text-wayfind-near-black font-dmsans font-semibold px-6 py-4 rounded-xl
                       border border-wayfind-brown/10 transition-all duration-300 hover:bg-wayfind-offwhite
                       flex items-center justify-center gap-3"
          >
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => handleSignup('apple')}
            className="w-full bg-wayfind-near-black text-white font-dmsans font-semibold px-6 py-4 rounded-xl
                       transition-all duration-300 hover:bg-wayfind-near-black/90 flex items-center justify-center gap-3"
          >
            <span>Continue with Apple</span>
          </button>
        </div>
      </div>

      <button
        onClick={() => {
          posthog.capture('guest mode entered');
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
            onClick={() => {
              posthog.capture('trial started', { plan: 'premium', trial_days: 7 });
              onNavigate('home');
            }}
            className="btn-primary w-full"
          >
            Start 7-Day Free Trial
          </button>
          <button
            onClick={() => {
              posthog.capture('paywall skipped');
              onNavigate('home');
            }}
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
  translation,
  onSelectVerse
}: {
  onNavigate: (screen: Screen) => void;
  verse: Verse | null;
  savedVerses: Verse[];
  onToggleSave: (verse: Verse) => void;
  translation: string;
  onSelectVerse: (verse: Verse) => void;
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
                onClick={() => onSelectVerse(relatedVerse)}
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
  setTranslation,
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

// S-Saved: Saved Verses Screen
function SavedScreen({
  onNavigate,
  savedVerses,
  onToggleSave,
  onSelectVerse
}: {
  onNavigate: (screen: Screen) => void;
  savedVerses: Verse[];
  onToggleSave: (verse: Verse) => void;
  onSelectVerse: (verse: Verse) => void;
}) {
  return (
    <div className="min-h-screen w-full bg-wayfind-offwhite flex flex-col">
      <div className="safe-area pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-header">Saved Verses</h2>
          <span className="bg-wayfind-amber text-white text-xs font-dmsans font-semibold px-3 py-1 rounded-full">
            {savedVerses.length}
          </span>
        </div>

        {savedVerses.length > 0 ? (
          <div className="space-y-4">
            {savedVerses.map((verse) => (
              <div
                key={verse.id}
                className="wayfind-card cursor-pointer"
                onClick={() => onSelectVerse(verse)}
              >
                <p className="verse-text text-sm mb-3">"{verse.text.substring(0, 120)}..."</p>
                <div className="flex items-center justify-between">
                  <p className="verse-reference">{verse.reference}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(verse);
                    }}
                    className="p-2 text-wayfind-amber hover:text-wayfind-brown transition-colors"
                  >
                    <Bookmark className="w-5 h-5 fill-wayfind-amber" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center mt-24 text-center gap-4">
            <div className="w-16 h-16 bg-wayfind-amber-tint rounded-full flex items-center justify-center">
              <Bookmark className="w-8 h-8 text-wayfind-amber" />
            </div>
            <h3 className="section-header">No saved verses yet</h3>
            <p className="body-text opacity-60 max-w-xs">
              When you find a verse that speaks to you, tap the bookmark icon to save it here.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="btn-primary mt-4"
            >
              Start exploring
            </button>
          </div>
        )}
      </div>
      <BottomNav onNavigate={onNavigate} currentScreen="saved" />
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
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-wayfind-offwhite border-t border-wayfind-brown/10 px-6 py-3">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentScreen === item.id ||
            (item.id === 'emotion-search' && ['emotion-search', 'curiosity-search', 'results', 'verse-detail'].includes(currentScreen));
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
