// ─── Filtragem e estado das escolhas ─────────────────────────────────────────
// Precedência: oculta > travada > disponível. Ocultas não saem daqui; travadas
// saem, para o jogador ver que existe caminho e entender o que falta.

import type { Qualities } from '@/types/qualities';
import type { Choice, ResolvedChoice } from '@/types/scene';
import { evaluateCondition, failedPredicate } from './conditions';

/** Onde a escolha vive. É o que torna a chave de `once` livre de colisão. */
export type ChoiceContext = { sceneId: string; lineId?: string };

/**
 * Chave composta para `SaveSlot.takenChoices`: `sceneId#choiceId`, ou
 * `sceneId#lineId#choiceId` em diálogo.
 *
 * Sem isso, duas cenas com uma escolha `voltar` compartilhariam o mesmo registro
 * de "já usada" — e `voltar` é justamente o id que mais tende a se repetir.
 */
export function choiceKey(ctx: ChoiceContext, choiceId: string): string {
  return ctx.lineId ? `${ctx.sceneId}#${ctx.lineId}#${choiceId}` : `${ctx.sceneId}#${choiceId}`;
}

/**
 * As escolhas que a tela deve desenhar, cada uma com seu estado.
 *
 * Uma escolha some quando: `when` reprova, `hiddenWhen` aprova, ou é `once` e já
 * foi usada. Ela trava — mas continua visível — quando `lockedWhen` aprova.
 */
export function availableChoices(
  choices: Choice[],
  state: Qualities,
  taken: string[],
  ctx: ChoiceContext
): ResolvedChoice[] {
  const usadas = new Set(taken);
  const resolvidas: ResolvedChoice[] = [];

  for (const choice of choices) {
    if (choice.once && usadas.has(choiceKey(ctx, choice.id))) continue;
    if (!evaluateCondition(choice.when, state)) continue;
    if (choice.hiddenWhen && evaluateCondition(choice.hiddenWhen, state)) continue;

    const travada = choice.lockedWhen ? evaluateCondition(choice.lockedWhen, state) : false;

    const key = choiceKey(ctx, choice.id);

    resolvidas.push(
      travada
        ? {
            choice,
            key,
            estado: 'travada',
            // O predicado que **faltava** para destravar: `lockedWhen` está
            // aprovando, então quem explica a trava é o primeiro predicado dela.
            predicadoQueFalhou: choice.lockedWhen?.all?.[0] ?? choice.lockedWhen?.anyOf?.[0]?.[0],
          }
        : { choice, key, estado: 'disponivel' }
    );
  }

  return resolvidas;
}

/**
 * Por que uma escolha não apareceu. Só para o inspetor de dev — a engine de
 * produção não precisa saber, mas estado numérico esconde bugs que árvore não
 * escondia, e sem isto o autor fica sem resposta.
 */
export function whyHidden(
  choice: Choice,
  state: Qualities,
  taken: string[],
  ctx: ChoiceContext
): string | undefined {
  if (choice.once && taken.includes(choiceKey(ctx, choice.id))) return 'já usada (once)';

  const reprovado = failedPredicate(choice.when, state);
  if (reprovado) return `when: ${reprovado.key} ${reprovado.op} ${reprovado.value}`;

  if (choice.hiddenWhen && evaluateCondition(choice.hiddenWhen, state)) {
    const predicado = choice.hiddenWhen.all?.[0] ?? choice.hiddenWhen.anyOf?.[0]?.[0];
    return predicado
      ? `hiddenWhen: ${predicado.key} ${predicado.op} ${predicado.value}`
      : 'hiddenWhen';
  }

  return undefined;
}
