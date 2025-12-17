// src/utils/validation.js

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());

export const passwordStrength = (v) => {
  const s = String(v || '');
  const length = s.length >= 8;
  const letter = /[A-Za-z]/.test(s);
  const number = /\d/.test(s);
  const strong = length && letter && number;
  return { strong, length, letter, number };
};

export const nonEmpty = (v) => String(v || '').trim().length > 0;

export const isURL = (v) => {
  const s = String(v || '').trim();
  if (!s) return true; // treat empty as valid (optional)
  try {
    const u = new URL(s.startsWith('http') ? s : `http://${s}`);
    return !!u.host;
  } catch {
    return false;
  }
};

export const maxLen = (v, n) => String(v || '').length <= n;

export const usernameValid = (v) => /^[a-zA-Z0-9_\.]{3,20}$/.test(String(v || ''));

export const tagsValid = (v) => {
  const s = String(v || '').trim();
  if (!s) return true;
  const tags = s.split(',').map(t=>t.trim()).filter(Boolean);
  return tags.length <= 10 && tags.every(t => t.length <= 30);
};

export const describePasswordErrors = (ps) => {
  const errs = [];
  if (!ps.length) errs.push('min 8 chars');
  if (!ps.letter) errs.push('one letter');
  if (!ps.number) errs.push('one number');
  return errs;
};
