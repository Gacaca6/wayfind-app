// Resolves an emotion's icon name (from data/emotions.ts) to a lucide component.
import {
  CloudRain, HeartCrack, User, Cloud, ShieldAlert, Wind, Waves, Flame, EyeOff,
  Swords, HelpCircle, TrendingDown, Frown, Eye, Compass, Pill, Wallet, Droplets,
  Scale, Map, Shield, Sun, Gift, Sunrise, Feather, Mountain, Heart, Anchor, Target,
  Sparkles, HandHeart, MessageCircle, Music, Snowflake, type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  CloudRain, HeartCrack, User, Cloud, ShieldAlert, Wind, Waves, Flame, EyeOff,
  Swords, HelpCircle, TrendingDown, Frown, Eye, Compass, Pill, Wallet, Droplets,
  Scale, Map, Shield, Sun, Gift, Sunrise, Feather, Mountain, Heart, Anchor, Target,
  Sparkles, HandHeart, MessageCircle, Music, Snowflake,
};

export function EmotionIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] || Sparkles;
  return <Cmp className={className} aria-hidden="true" />;
}
