// Natural-language → emotion mapping. Each emotion lists everyday words and
// phrases people actually type. The search engine (lib/search.ts) matches these
// against a normalized query so "I feel overwhelmed" or "everything is too much"
// lands on the right verse sets. Multi-word phrases are scored higher.
// No ML, no network — this ships in the bundle and works fully offline.

export const synonyms: Record<string, string[]> = {
  sad: [
    'sad', 'sadness', 'unhappy', 'down', 'blue', 'sorrow', 'sorrowful', 'crying', 'tears',
    'tearful', 'weeping', 'heavy heart', 'low', 'feeling low', 'miserable', 'gloomy', 'hurt inside',
  ],
  grief: [
    'grief', 'grieving', 'mourning', 'mourn', 'loss', 'lost someone', 'death', 'died', 'passed away',
    'funeral', 'bereaved', 'bereavement', 'miss them', 'they died', 'losing someone',
  ],
  lonely: [
    'lonely', 'loneliness', 'alone', 'isolated', 'isolation', 'no one', 'nobody', 'no friends',
    'left out', 'unseen', 'invisible', 'abandoned', 'forgotten', 'on my own', 'by myself', 'rejected',
  ],
  depressed: [
    'depressed', 'depression', 'hopeless', 'no hope', 'cant go on', 'want to give up', 'empty inside',
    'dark place', 'darkness', 'despair', 'worthless to live', 'pointless', 'no point', 'cant get up',
  ],
  afraid: [
    'afraid', 'fear', 'fearful', 'scared', 'terrified', 'frightened', 'panic', 'panicking', 'dread',
    'nightmare', 'phobia', 'i am scared', 'so scared', 'fear of', 'what if', 'paralyzed by fear',
  ],
  anxious: [
    'anxious', 'anxiety', 'worried', 'worry', 'worrying', 'nervous', 'nervousness', 'overthinking',
    'cant stop thinking', 'racing thoughts', 'on edge', 'restless', 'uneasy', 'stress', 'stressed',
    'tense', 'cant relax', 'spiraling', 'spinning', 'apprehensive',
  ],
  overwhelmed: [
    'overwhelmed', 'too much', 'cant cope', 'cannot cope', 'drowning', 'swamped', 'buried',
    'exhausted', 'burned out', 'burnt out', 'burnout', 'breaking point', 'falling apart', 'cant keep up',
    'so much going on', 'everything at once', 'cant handle', 'spread thin', 'no energy',
  ],
  angry: [
    'angry', 'anger', 'mad', 'furious', 'rage', 'enraged', 'irritated', 'annoyed', 'frustrated',
    'frustration', 'resentful', 'resentment', 'bitter', 'bitterness', 'fed up', 'hate', 'pissed off',
    'losing my temper', 'so angry',
  ],
  guilty: [
    'guilty', 'guilt', 'ashamed', 'shame', 'shameful', 'regret', 'regretful', 'remorse', 'messed up',
    'i failed', 'bad person', 'disappointed in myself', 'i sinned', 'did something wrong', 'dirty',
    'condemned', 'cant forgive myself', 'my fault',
  ],
  tempted: [
    'tempted', 'temptation', 'struggling with sin', 'addiction', 'addicted', 'lust', 'craving',
    'urge', 'relapse', 'cant resist', 'keep falling', 'habit', 'bad habit', 'giving in', 'tempting',
  ],
  doubtful: [
    'doubt', 'doubting', 'doubts', 'questioning', 'unsure of faith', 'is god real', 'does god exist',
    'losing my faith', 'hard to believe', 'unbelief', 'skeptical', 'confused about god', 'where is god',
  ],
  discouraged: [
    'discouraged', 'discouragement', 'feel like a failure', 'failure', 'failing', 'defeated',
    'giving up', 'want to quit', 'cant do this', 'not good enough at', 'let down', 'deflated',
    'disheartened', 'losing motivation', 'why bother',
  ],
  insecure: [
    'insecure', 'insecurity', 'not enough', 'not good enough', 'worthless', 'no worth', 'no value',
    'ugly', 'unlovable', 'self doubt', 'low self esteem', 'compare myself', 'inadequate', 'inferior',
    'who am i', 'i hate myself', 'self conscious',
  ],
  jealous: [
    'jealous', 'jealousy', 'envy', 'envious', 'comparing', 'comparison', 'they have it better',
    'covet', 'resent their', 'wish i had', 'why not me', 'unfair they', 'green with envy',
  ],
  confused: [
    'confused', 'confusion', 'lost', 'dont know what to do', 'no direction', 'unclear', 'cant decide',
    'mixed up', 'uncertain', 'puzzled', 'stuck', 'no idea', 'which way', 'cant think straight',
  ],
  hurting: [
    'hurting', 'in pain', 'pain', 'sick', 'illness', 'ill', 'disease', 'suffering', 'sickness',
    'need healing', 'healing', 'unwell', 'diagnosis', 'cancer', 'chronic pain', 'body hurts', 'aching',
  ],
  provision: [
    'money', 'broke', 'poor', 'poverty', 'bills', 'debt', 'cant afford', 'no money', 'lost my job',
    'unemployed', 'jobless', 'provision', 'provide', 'finances', 'financial', 'rent', 'need food',
    'making ends meet', 'struggling financially',
  ],
  heartbroken: [
    'heartbroken', 'heartbreak', 'broken heart', 'breakup', 'broke up', 'divorce', 'betrayed',
    'betrayal', 'cheated on', 'rejected by', 'they left me', 'lost love', 'relationship pain',
    'dumped', 'unrequited',
  ],
  wronged: [
    'wronged', 'mistreated', 'unjust', 'injustice', 'unfair', 'treated badly', 'persecuted',
    'falsely accused', 'they hurt me', 'enemies', 'someone hurt me', 'bullied', 'wronged me',
    'revenge', 'they wronged me', 'taken advantage of',
  ],
  deciding: [
    'decision', 'deciding', 'big decision', 'choice', 'which path', 'need direction', 'guidance',
    'gods will', 'what should i do', 'crossroads', 'choose', 'next step', 'not sure what to choose',
    'discern', 'figure out my path',
  ],
  unsafe: [
    'unsafe', 'in danger', 'danger', 'threatened', 'threat', 'need protection', 'protect me',
    'scared for my safety', 'not safe', 'under attack', 'vulnerable', 'exposed', 'keep me safe',
  ],
  joyful: [
    'joyful', 'joy', 'happy', 'happiness', 'glad', 'delighted', 'cheerful', 'celebrate', 'celebrating',
    'good news', 'excited', 'thrilled', 'overjoyed', 'feeling great', 'blessed and happy',
  ],
  grateful: [
    'grateful', 'gratitude', 'thankful', 'thanks', 'thanksgiving', 'blessed', 'count my blessings',
    'appreciate', 'appreciation', 'thank god', 'so blessed', 'feeling thankful',
  ],
  hopeful: [
    'hopeful', 'hope', 'looking forward', 'expectant', 'waiting on god', 'better days', 'optimistic',
    'new beginning', 'fresh start', 'future', 'things will get better', 'holding on',
  ],
  peaceful: [
    'peaceful', 'peace', 'calm', 'calmness', 'at rest', 'rest', 'still', 'stillness', 'serene',
    'content', 'contentment', 'quiet heart', 'settled', 'tranquil', 'relaxed',
  ],
  courageous: [
    'courage', 'courageous', 'brave', 'bravery', 'bold', 'boldness', 'be strong', 'face my fears',
    'ready', 'fearless', 'stand firm', 'step out', 'take a stand', 'need courage',
  ],
  loved: [
    'loved', 'love', 'gods love', 'accepted', 'belong', 'belonging', 'valued', 'cherished',
    'am i loved', 'does god love me', 'feel loved', 'worthy of love', 'cared for',
  ],
  strong: [
    'strong', 'strength', 'persevere', 'perseverance', 'endure', 'endurance', 'keep going',
    'dont give up', 'wont give up', 'press on', 'stay strong', 'overcome', 'resilient', 'hold on',
  ],
  purposeless: [
    'purpose', 'purposeless', 'no purpose', 'whats my life for', 'meaning', 'meaningless', 'no meaning',
    'why am i here', 'lost my way', 'direction in life', 'calling', 'what am i meant to do',
    'feel useless', 'no point to life', 'mission',
  ],
  forgiven: [
    'forgiven', 'forgiveness', 'need forgiveness', 'am i forgiven', 'can god forgive me', 'mercy',
    'grace', 'cleanse me', 'wash away', 'second chance', 'redeemed', 'redemption', 'start over with god',
  ],
  forgiving: [
    'forgive', 'forgiving', 'cant forgive', 'how to forgive', 'forgive someone', 'let go of anger',
    'holding a grudge', 'grudge', 'they hurt me but', 'release them', 'move on from hurt', 'bitterness toward',
  ],
  prayerless: [
    'pray', 'prayer', 'how to pray', 'dont know how to pray', 'want to pray', 'talk to god',
    'cant pray', 'prayer life', 'connect with god', 'hear from god', 'learning to pray',
  ],
  worshipful: [
    'worship', 'worshipful', 'praise', 'praise god', 'sing to god', 'adore', 'glorify', 'magnify god',
    'thankful praise', 'lift up his name', 'feeling worshipful', 'want to praise',
  ],
  numb: [
    'numb', 'empty', 'hollow', 'feel nothing', 'dont feel anything', 'disconnected', 'spiritually dry',
    'dry', 'god feels far', 'god feels distant', 'distant from god', 'cant feel god', 'going through the motions',
    'lukewarm', 'cold heart', 'far from god',
  ],
};
