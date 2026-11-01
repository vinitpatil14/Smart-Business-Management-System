/**
 * User Scope & Multi-tenancy Helper
 * Distinguishes between One-Click Demo Accounts (sample showroom data)
 * and Real Users (new accounts, Google sign-ins) who start with a 100% clean, fresh slate.
 */

const isDemoUser = (user) => {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase();
  return (
    email === 'admin@sbms.com' ||
    email === 'manager@sbms.com' ||
    email === 'staff@sbms.com' ||
    email.endsWith('@sbms.com')
  );
};

module.exports = {
  isDemoUser
};
