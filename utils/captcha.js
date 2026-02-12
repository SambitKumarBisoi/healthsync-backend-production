export const captchaStore = {};

export const generateCaptcha = () => {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;

  const captchaId = Date.now().toString();

  captchaStore[captchaId] = {
    answer: String(a + b),
    expiresAt: Date.now() + 2 * 60 * 1000, // 2 min
  };

  return {
    captchaId,
    question: `What is ${a} + ${b}?`,
  };
};
