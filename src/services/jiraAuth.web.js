const STORAGE_KEY = 'jtgenJiraAuth';

export const getJiraAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const email = typeof parsed.email === 'string' ? parsed.email.trim() : '';
    const token = typeof parsed.token === 'string' ? parsed.token.trim() : '';
    if (!email || !token) return null;
    return { email, token };
  } catch (error) {
    return null;
  }
};

export const saveJiraAuth = (email, token) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    email: email.trim(),
    token: token.trim()
  }));
  window.dispatchEvent(new Event('jtgen-auth-changed'));
};

export const clearJiraAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('jtgen-auth-changed'));
};

export const jiraAuthHeaders = () => {
  const auth = getJiraAuth();
  if (!auth) return {};
  return {
    'X-Jira-Email': auth.email,
    'X-Jira-Token': auth.token
  };
};
