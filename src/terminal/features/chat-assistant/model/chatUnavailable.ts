// U-04 (SQ-01 c, ADR-P2): the chat backend (/api/chat, Groq) is removed until the "Ask Tijo" rebuild.
// Every client path that used to call /api/chat answers with this one message instead.
export const CHAT_UNAVAILABLE_MESSAGE =
  "The chat assistant is turned off for now. Type 'help' in the terminal to explore, or connect with Tijo on LinkedIn: linkedin.com/in/tijo-j-thomaz93";
