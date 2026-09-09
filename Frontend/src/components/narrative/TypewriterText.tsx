// Texto datilografado — a única animação do projeto que não usa Reanimated.
// É exceção declarada no CLAUDE.md: o efeito é sobre o *conteúdo* da string, não
// sobre transform ou opacity, e worklets não manipulam texto.
//
// Extraído de Scenario e Dialogue, onde vivia duplicado byte a byte (dívida D3).

import { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, type StyleProp, type TextStyle } from 'react-native';

type Props = {
  text: string;
  speed?: number;
  style?: StyleProp<TextStyle>;
  onDone?: () => void;
};

export default function TypewriterText({ text, speed = 28, style, onDone }: Props) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishedRef = useRef(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  /** Tocar revela tudo de uma vez — quem lê rápido não espera a máquina. */
  const revealAll = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    indexRef.current = text.length;
    setDisplayed(text);
    onDoneRef.current?.();
  };

  useEffect(() => {
    setDisplayed('');
    indexRef.current = 0;
    finishedRef.current = false;

    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) revealAll();
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  return (
    <TouchableOpacity onPress={revealAll} activeOpacity={1}>
      <Text style={style}>{displayed}</Text>
    </TouchableOpacity>
  );
}
