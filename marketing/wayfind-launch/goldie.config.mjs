export default {
  appRoot: process.cwd(),
  // Capture is supplied by Playwright for this PWA, not an emulator/APK.
  appPath: '', bundleId: '', devices: ['pixel-10-pro'], locales: ['en-US'], appearance: 'light',
  theme: {
    background: '#FAF7F2', headlineColor: '#2C1A0E', subheadColor: '#5C3D2E',
    fontFamily: 'DM Sans', copyHeightRatio: 0.25, deviceWidthRatio: 0.78,
    template: ['hero','classic','tilt','classic','hero','classic'],
  },
  scenes: [
    {kind:'screenshot',id:'feel',flow:'browser-feel',headline:{'en-US':'A verse for what you feel.'},subhead:{'en-US':'Start with a feeling. Find Scripture that speaks to it.'}},
    {kind:'screenshot',id:'kinyarwanda',flow:'browser-reader',headline:{'en-US':'Read in Kinyarwanda.'},subhead:{'en-US':'Open the Bible in Kinyarwanda or English.'}},
    {kind:'screenshot',id:'daily',flow:'browser-home',headline:{'en-US':'Begin with the Word.'},subhead:{'en-US':'A daily verse to carry into your day.'}},
    {kind:'screenshot',id:'fellowship',flow:'browser-chats',headline:{'en-US':'Faith has a conversation.'},subhead:{'en-US':'Community groups, prayer, and private chats.'}},
    {kind:'screenshot',id:'share',flow:'browser-attachments',headline:{'en-US':'Share what you’re reading.'},subhead:{'en-US':'Send a verse or photograph a Bible page.'}},
    {kind:'screenshot',id:'niv',flow:'browser-niv',headline:{'en-US':'Make time for the Word.'},subhead:{'en-US':'Read the full Bible in NIV, KJV or Kinyarwanda.'}},
  ],
};
