import { useState, useEffect } from 'react';

/**
 * A custom hook to animate typing a text string.
 * @param text The full text string to type.
 * @param speed Typing delay in ms per character (default: 30).
 * @param active Whether the typewriter is currently active/running (default: true).
 */
export const useTypewriter = (text: string, speed: number = 25, active: boolean = true) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!active || !text) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    let timerId: NodeJS.Timeout | null = null;

    const type = () => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
        timerId = setTimeout(type, speed);
      } else {
        setIsTyping(false);
      }
    };

    timerId = setTimeout(type, speed);

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [text, speed, active]);

  return { displayedText, isTyping };
};
