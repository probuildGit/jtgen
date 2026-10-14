// Spell Check Service for auto-correct functionality
// Supports multiple spell check providers

// Free dictionary-based spell check
const COMMON_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
  'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only',
  'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want',
  'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'each', 'which', 'their',
  'time', 'will', 'about', 'if', 'up', 'out', 'many', 'then', 'them', 'can', 'only', 'other', 'new', 'some', 'what', 'time', 'very', 'when',
  'much', 'get', 'through', 'back', 'much', 'before', 'go', 'good', 'little', 'own', 'right', 'still', 'try', 'too', 'any', 'may', 'say',
  'help', 'low', 'line', 'differ', 'turn', 'cause', 'much', 'mean', 'before', 'move', 'right', 'boy', 'old', 'too', 'same', 'tell', 'does',
  'set', 'three', 'want', 'air', 'well', 'also', 'play', 'small', 'end', 'put', 'home', 'read', 'hand', 'port', 'large', 'spell', 'add',
  'even', 'land', 'here', 'must', 'big', 'high', 'such', 'follow', 'act', 'why', 'ask', 'men', 'change', 'went', 'light', 'kind', 'off',
  'need', 'house', 'picture', 'try', 'us', 'again', 'animal', 'point', 'mother', 'world', 'near', 'build', 'self', 'earth', 'father',
  'head', 'stand', 'own', 'page', 'should', 'country', 'found', 'answer', 'school', 'grow', 'study', 'still', 'learn', 'plant', 'cover',
  'food', 'sun', 'four', 'between', 'state', 'keep', 'eye', 'never', 'last', 'let', 'thought', 'city', 'tree', 'cross', 'farm', 'hard',
  'start', 'might', 'story', 'saw', 'far', 'sea', 'draw', 'left', 'late', 'run', 'dont', 'while', 'press', 'close', 'night', 'real',
  'life', 'few', 'north', 'open', 'seem', 'together', 'next', 'white', 'children', 'begin', 'got', 'walk', 'example', 'ease', 'paper',
  'group', 'always', 'music', 'those', 'both', 'mark', 'often', 'letter', 'until', 'mile', 'river', 'car', 'feet', 'care', 'second',
  'book', 'carry', 'took', 'science', 'eat', 'room', 'friend', 'began', 'idea', 'fish', 'mountain', 'stop', 'once', 'base', 'hear',
  'horse', 'cut', 'sure', 'watch', 'color', 'face', 'wood', 'main', 'enough', 'plain', 'girl', 'usual', 'young', 'ready', 'above',
  'ever', 'red', 'list', 'though', 'feel', 'talk', 'bird', 'soon', 'body', 'dog', 'family', 'direct', 'pose', 'leave', 'song', 'measure',
  'door', 'product', 'black', 'short', 'numeral', 'class', 'wind', 'question', 'happen', 'complete', 'ship', 'area', 'half', 'rock',
  'order', 'fire', 'south', 'problem', 'piece', 'told', 'knew', 'pass', 'since', 'top', 'whole', 'king', 'space', 'heard', 'best',
  'hour', 'better', 'during', 'hundred', 'five', 'remember', 'step', 'early', 'hold', 'west', 'ground', 'interest', 'reach', 'fast',
  'verb', 'sing', 'listen', 'six', 'table', 'travel', 'less', 'morning', 'ten', 'simple', 'several', 'vowel', 'toward', 'war', 'lay',
  'against', 'pattern', 'slow', 'center', 'love', 'person', 'money', 'serve', 'appear', 'road', 'map', 'rain', 'rule', 'govern', 'pull',
  'cold', 'notice', 'voice', 'unit', 'power', 'town', 'fine', 'certain', 'fly', 'fall', 'lead', 'cry', 'dark', 'machine', 'note', 'wait',
  'plan', 'figure', 'star', 'box', 'noun', 'field', 'rest', 'correct', 'able', 'pound', 'done', 'beauty', 'drive', 'stood', 'contain',
  'front', 'teach', 'week', 'final', 'gave', 'green', 'oh', 'quick', 'develop', 'ocean', 'warm', 'free', 'minute', 'strong', 'special',
  'mind', 'behind', 'clear', 'tail', 'produce', 'fact', 'street', 'inch', 'multiply', 'nothing', 'course', 'stay', 'wheel', 'full',
  'force', 'blue', 'object', 'decide', 'surface', 'deep', 'moon', 'island', 'foot', 'system', 'busy', 'test', 'record', 'boat', 'common',
  'gold', 'possible', 'plane', 'stead', 'dry', 'wonder', 'laugh', 'thousand', 'ago', 'ran', 'check', 'game', 'shape', 'equate', 'miss',
  'brought', 'heat', 'snow', 'tire', 'bring', 'yes', 'distant', 'fill', 'east', 'paint', 'language', 'among'
]);

// Technical terms commonly used in bug reports
const TECHNICAL_TERMS = new Set([
  'bug', 'error', 'issue', 'problem', 'fix', 'feature', 'functionality', 'application', 'system', 'user', 'interface', 'button',
  'click', 'page', 'screen', 'window', 'dialog', 'modal', 'form', 'field', 'input', 'text', 'data', 'database', 'server', 'client',
  'browser', 'website', 'url', 'link', 'navigation', 'menu', 'dropdown', 'checkbox', 'radio', 'select', 'option', 'submit', 'cancel',
  'save', 'delete', 'edit', 'update', 'create', 'add', 'remove', 'search', 'filter', 'sort', 'display', 'show', 'hide', 'visible',
  'hidden', 'enabled', 'disabled', 'active', 'inactive', 'loading', 'success', 'failure', 'exception', 'validation', 'required',
  'optional', 'default', 'custom', 'configuration', 'settings', 'preferences', 'profile', 'account', 'login', 'logout', 'session',
  'authentication', 'authorization', 'permission', 'role', 'admin', 'administrator', 'developer', 'tester', 'qa', 'quality', 'assurance',
  'testing', 'test', 'scenario', 'case', 'step', 'reproduce', 'reproduction', 'steps', 'expected', 'actual', 'result', 'behavior',
  'performance', 'speed', 'slow', 'fast', 'timeout', 'memory', 'cpu', 'resource', 'usage', 'optimization', 'optimize', 'improve',
  'enhancement', 'enhance', 'upgrade', 'version', 'release', 'deployment', 'deploy', 'production', 'staging', 'development', 'dev',
  'environment', 'config', 'configuration', 'api', 'endpoint', 'request', 'response', 'json', 'xml', 'http', 'https', 'ssl', 'tls',
  'security', 'secure', 'encryption', 'decrypt', 'password', 'token', 'key', 'certificate', 'ssl', 'tls', 'cors', 'csrf', 'xss',
  'sql', 'injection', 'vulnerability', 'exploit', 'attack', 'malware', 'virus', 'firewall', 'proxy', 'cache', 'caching', 'session',
  'cookie', 'localStorage', 'sessionStorage', 'indexedDB', 'websocket', 'socket', 'connection', 'network', 'bandwidth', 'latency',
  'throughput', 'scalability', 'scalable', 'load', 'balancing', 'cluster', 'distributed', 'microservice', 'service', 'architecture',
  'pattern', 'design', 'framework', 'library', 'dependency', 'package', 'module', 'component', 'plugin', 'extension', 'addon',
  'integration', 'third', 'party', 'external', 'internal', 'private', 'public', 'static', 'dynamic', 'reactive', 'responsive',
  'mobile', 'desktop', 'tablet', 'device', 'platform', 'os', 'operating', 'windows', 'mac', 'linux', 'android', 'ios', 'chrome',
  'firefox', 'safari', 'edge', 'internet', 'explorer', 'browser', 'javascript', 'typescript', 'react', 'angular', 'vue', 'node',
  'express', 'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cloud',
  'ci', 'cd', 'pipeline', 'jenkins', 'github', 'gitlab', 'bitbucket', 'git', 'svn', 'mercurial', 'version', 'control', 'repository',
  'branch', 'merge', 'commit', 'push', 'pull', 'clone', 'fork', 'pull', 'request', 'issue', 'milestone', 'project', 'board',
  'kanban', 'scrum', 'agile', 'sprint', 'backlog', 'epic', 'story', 'task', 'subtask', 'bug', 'defect', 'enhancement', 'improvement'
]);

// Common misspellings and their corrections
const COMMON_MISSPELLINGS = {
  'recieve': 'receive',
  'seperate': 'separate',
  'definately': 'definitely',
  'occured': 'occurred',
  'begining': 'beginning',
  'neccessary': 'necessary',
  'accomodate': 'accommodate',
  'embarass': 'embarrass',
  'existance': 'existence',
  'independant': 'independent',
  'helo': 'hello',
  'teh': 'the',
  'adn': 'and',
  'hlp': 'help',
  'thnks': 'thanks',
  'pls': 'please',
  'buildig': 'building',
  'buildigs': 'buildings',
  'buidling': 'building',
  'buidlings': 'buildings',
  'bulding': 'building',
  'buldings': 'buildings',
  'projct': 'project',
  'projet': 'project',
  'shuold': 'should',
  'recieve': 'receive',
  'seperate': 'separate',
  'occassion': 'occasion',
  'priviledge': 'privilege',
  'rythm': 'rhythm',
  'seige': 'siege',
  'thier': 'their',
  'untill': 'until',
  'writting': 'writing',
  'acheive': 'achieve',
  'beleive': 'believe',
  'calender': 'calendar',
  'cemetary': 'cemetery',
  'concious': 'conscious',
  'differnt': 'different',
  'enviroment': 'environment',
  'exagerate': 'exaggerate',
  'favourate': 'favourite',
  'goverment': 'government',
  'harrass': 'harass',
  'immediatly': 'immediately',
  'judgement': 'judgment',
  'knowlege': 'knowledge',
  'lenght': 'length',
  'maintainance': 'maintenance',
  'neccessary': 'necessary',
  'occured': 'occurred',
  'persistant': 'persistent',
  'priviledge': 'privilege',
  'recieve': 'receive',
  'rythm': 'rhythm',
  'seperate': 'separate',
  'thier': 'their',
  'untill': 'until',
  'writting': 'writing',
  'acheive': 'achieve',
  'beleive': 'believe',
  'calender': 'calendar',
  'cemetary': 'cemetery',
  'concious': 'conscious',
  'differnt': 'different',
  'enviroment': 'environment',
  'exagerate': 'exaggerate',
  'favourate': 'favourite',
  'goverment': 'government',
  'harrass': 'harass',
  'immediatly': 'immediately',
  'judgement': 'judgment',
  'knowlege': 'knowledge',
  'lenght': 'length',
  'maintainance': 'maintenance',
  'neccessary': 'necessary',
  'occured': 'occurred',
  'persistant': 'persistent',
  'priviledge': 'privilege',
  'recieve': 'receive',
  'rythm': 'rhythm',
  'seperate': 'separate',
  'thier': 'their',
  'untill': 'until',
  'writting': 'writing'
};

// Spell check result structure
export const SpellCheckResult = {
  hasErrors: false,
  errors: [],
  suggestions: {}
};

// Check if a word is spelled correctly
const isWordCorrect = (word) => {
  const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
  
  // Check common words
  if (COMMON_WORDS.has(cleanWord)) {
    return true;
  }
  
  // Check technical terms
  if (TECHNICAL_TERMS.has(cleanWord)) {
    return true;
  }
  
  // Check common misspellings
  if (COMMON_MISSPELLINGS[cleanWord]) {
    return false;
  }
  
  // Basic heuristics for common patterns
  if (cleanWord.length <= 2) return true; // Very short words are likely correct
  if (/^\d+$/.test(cleanWord)) return true; // Numbers are correct
  if (/^[A-Z]+$/.test(word)) return true; // Acronyms are correct
  if (cleanWord.includes('-') && cleanWord.split('-').every(part => COMMON_WORDS.has(part) || TECHNICAL_TERMS.has(part))) {
    return true; // Hyphenated words where both parts are known
  }
  
  // Check if it's a common misspelling
  return !COMMON_MISSPELLINGS[cleanWord];
};

// Get suggestions for a misspelled word
export const getSuggestions = (word) => {
  const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
  
  // Check common misspellings first
  if (COMMON_MISSPELLINGS[cleanWord]) {
    return [COMMON_MISSPELLINGS[cleanWord]];
  }
  
  // Generate suggestions based on common patterns
  const suggestions = [];
  
  // Check for common letter swaps
  for (let i = 0; i < cleanWord.length - 1; i++) {
    const swapped = cleanWord.substring(0, i) + cleanWord[i + 1] + cleanWord[i] + cleanWord.substring(i + 2);
    if (COMMON_WORDS.has(swapped) || TECHNICAL_TERMS.has(swapped)) {
      suggestions.push(swapped);
    }
  }
  
  // Check for missing letters
  for (let i = 0; i <= cleanWord.length; i++) {
    for (const letter of 'abcdefghijklmnopqrstuvwxyz') {
      const withLetter = cleanWord.substring(0, i) + letter + cleanWord.substring(i);
      if (COMMON_WORDS.has(withLetter) || TECHNICAL_TERMS.has(withLetter)) {
        suggestions.push(withLetter);
      }
    }
  }
  
  // Check for extra letters
  for (let i = 0; i < cleanWord.length; i++) {
    const withoutLetter = cleanWord.substring(0, i) + cleanWord.substring(i + 1);
    if (COMMON_WORDS.has(withoutLetter) || TECHNICAL_TERMS.has(withoutLetter)) {
      suggestions.push(withoutLetter);
    }
  }
  
  return suggestions.slice(0, 3); // Return top 3 suggestions
};

// Main spell check function
export const checkSpelling = (text) => {
  if (!text || typeof text !== 'string') {
    return { ...SpellCheckResult };
  }
  
  const words = text.split(/\s+/);
  const errors = [];
  const suggestions = {};
  
  words.forEach((word, index) => {
    if (!isWordCorrect(word)) {
      const wordSuggestions = getSuggestions(word);
      if (wordSuggestions.length > 0) {
        errors.push({
          word,
          position: index,
          suggestions: wordSuggestions
        });
        suggestions[word] = wordSuggestions;
      }
    }
  });
  
  return {
    hasErrors: errors.length > 0,
    errors,
    suggestions
  };
};

// Auto-correct function (alias for correctText)
export const correctText = (text) => {
  return autoCorrect(text);
};

// Auto-correct function
export const autoCorrect = (text) => {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  const words = text.split(/\s+/);
  const correctedWords = words.map(word => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (COMMON_MISSPELLINGS[cleanWord]) {
      const correction = COMMON_MISSPELLINGS[cleanWord];
      // Preserve original capitalization
      if (word === word.toUpperCase()) {
        return correction.toUpperCase();
      } else if (word[0] === word[0].toUpperCase()) {
        return correction.charAt(0).toUpperCase() + correction.slice(1);
      } else {
        return correction;
      }
    }
    return word;
  });
  
  return correctedWords.join(' ');
};

// Real-time spell check with debouncing
export const createSpellChecker = (callback, delay = 500) => {
  let timeoutId = null;
  
  return (text) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      const result = checkSpelling(text);
      callback(result);
    }, delay);
  };
};

console.log('🔤 SPELL CHECK SERVICE: Loaded with dictionary-based spell checking');
