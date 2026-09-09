// ─── Cenas, textos e escolhas ────────────────────────────────────────────────
// Duas formas de cena, como no v1, mas com **variantes**: pistas deixam de
// destravar opções e passam a mudar o que a opção faz e qual texto aparece.
//
// Uma cena nunca contém lógica. Só descreve o que existe e o que cada escolha causa.

import type { Condition, Predicate } from './conditions';
import type { Effect } from './effects';
import type { LineId, NpcId, SceneId } from './ids';

/**
 * Um texto candidato. A engine escolhe **uma** variante por bloco.
 *
 * Desempate determinístico, sem aleatoriedade, nesta ordem:
 * 1. maior `priority`
 * 2. maior número de predicados na condição (mais específica ganha)
 * 3. ordem de declaração no array
 */
export type TextVariant = {
  when?: Condition;
  priority?: number;
  texto: string;
  /** Disparados ao **exibir** esta variante — não ao escolher nada. */
  effects?: Effect[];
};

/**
 * Precedência dos estados: **oculta > travada > disponível**.
 *
 * - Disponível é o padrão e deve ser a maioria esmagadora.
 * - Oculta só quando exibir já entrega a revelação.
 * - Travada aparece, responde com `lockedText` e **não altera estado nenhum**.
 *   É o que ensina o sistema ao jogador: ele vê que há caminho e entende o que falta.
 */
export type Choice = {
  id: string;
  texto: string;
  /** Condição para a escolha existir. Ausente = sempre existe. */
  when?: Condition;
  /** Oculta mesmo que `when` passe. */
  hiddenWhen?: Condition;
  /** Aparece, mas travada. */
  lockedWhen?: Condition;
  /** Pensamento do investigador ao tocar numa escolha travada. */
  lockedText?: string;
  /** Some depois de usada. A engine consulta `SaveSlot.takenChoices`. */
  once?: boolean;
  effects: Effect[];
};

/** Estado com que uma escolha chega à tela. Ocultas não saem de `availableChoices`. */
export type ChoiceState = 'disponivel' | 'travada';

export type ResolvedChoice = {
  choice: Choice;
  /**
   * Chave composta desta escolha em `SaveSlot.takenChoices`, já resolvida pela
   * engine. Quem chama **nunca** deve remontá-la: um diálogo alcançado por
   * `sceneId` e o mesmo diálogo alcançado por `sceneId#linha` estão na mesma
   * linha, e recalcular a chave dos dois jeitos faria uma escolha `once`
   * reaparecer depois de usada.
   */
  key: string;
  estado: ChoiceState;
  /**
   * Qual predicado reprovou, quando `estado` é `"travada"`. Existe para o
   * inspetor de dev (§14) poder responder *por que* a escolha travou — estado
   * numérico esconde bugs que árvore não escondia.
   */
  predicadoQueFalhou?: Predicate;
};

// ─── Cena de exploração ──────────────────────────────────────────────────────

export type LocalScene = {
  type: 'local';
  id: SceneId;
  /**
   * Chave de asset, **não** um `require()`. Manter `require()` fora de `data/` é
   * o que permite validador e testes rodarem em node puro, sem bundler; a
   * resolução para imagem vive na camada de apresentação.
   */
  imagem?: string;
  textos: TextVariant[];
  escolhas: Choice[];
};

// ─── Cena de diálogo ─────────────────────────────────────────────────────────

export type DialogueLine = {
  id: LineId;
  variantes: TextVariant[];
  escolhas: Choice[];
};

export type DialogueScene = {
  type: 'dialogo';
  id: SceneId;
  npcId: NpcId;
  linhaInicial: LineId;
  /**
   * Rede de segurança: se `availableChoices` devolver vazio numa linha, a engine
   * injeta uma escolha de despedida que navega para cá. O validador **continua
   * exigindo saída autorada** — isto não substitui escrever a saída.
   */
  linhaDeDespedida: LineId;
  linhas: Record<LineId, DialogueLine>;
};

export type Scene = LocalScene | DialogueScene;

// ─── Formas resolvidas, prontas para a tela ──────────────────────────────────

export type ResolvedScene = {
  scene: Scene;
  /** Variante vencedora do desempate. */
  texto: string;
  /** `visita.<sceneId>` depois do incremento — `1` na primeira vez. */
  visitas: number;
  escolhas: ResolvedChoice[];
  /**
   * Efeitos da variante exibida. A engine **descreve**, o store aplica depois de
   * resolver — é assim que a pista obtida por exploração (olhar a cena, não
   * escolher uma opção) chega ao estado sem quebrar a pureza.
   */
  pendingEffects: Effect[];
};

export type ResolvedLine = {
  line: DialogueLine;
  texto: string;
  escolhas: ResolvedChoice[];
  pendingEffects: Effect[];
};
