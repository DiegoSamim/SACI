// TEXTO PROVISÓRIO — esqueleto da fatia vertical (etapa 4 preenche e completa).
import type { DialogueScene } from '@/types/scene';

const RAIMUNDO: DialogueScene = {
  type: 'dialogo',
  id: 'nordeste_dialogo_raimundo',
  npcId: 'raimundo',
  linhaInicial: 'abertura',
  linhaDeDespedida: 'despedida',
  linhas: {
    // Três variantes: humor alto, com pista, e a base sem condição.
    abertura: {
      id: 'abertura',
      variantes: [
        {
          when: { all: [{ key: 'humor.raimundo', op: 'gte', value: 2 }] },
          priority: 2,
          texto: 'Senta aí. Faz três noites que eu não durmo e ninguém quer ouvir.',
        },
        {
          when: { all: [{ key: 'pista.cabra_rastros', op: 'gte', value: 1 }] },
          priority: 1,
          texto: 'Você foi no curral, né? Dá pra ver na bota. Não devia ter ido.',
        },
        {
          texto: 'O bar tá fechado. Tô limpando o balcão só pra ter o que fazer.',
        },
      ],
      escolhas: [
        {
          id: 'raimundo_pagar_dose',
          texto: 'Pagar uma dose e ficar calado',
          // Ganha humor, e some depois de usada.
          once: true,
          effects: [
            { type: 'adjust', key: 'humor.raimundo', by: 1 },
            { type: 'adjust', key: 'laco.raimundo', by: 1 },
            { type: 'navigate', to: 'nordeste_dialogo_raimundo#abertura' },
          ],
        },
        {
          id: 'raimundo_mentir',
          texto: 'Dizer que você é da prefeitura',
          // Custa humor.
          effects: [
            { type: 'adjust', key: 'humor.raimundo', by: -2 },
            { type: 'set', key: 'feito.nordeste.mentiu_para_raimundo', value: 1 },
            { type: 'navigate', to: 'nordeste_dialogo_raimundo#abertura' },
          ],
        },
        {
          id: 'raimundo_perguntar_voz',
          texto: 'Perguntar por que as portas estão trancadas',
          effects: [
            { type: 'set', key: 'pista.cabra_voz', value: 1 },
            { type: 'adjust', key: 'mundo.nordeste.medo_vila', by: 1 },
            // O ato avança: a partir daqui o curral fica fora de alcance.
            { type: 'set', key: 'mundo.nordeste.ato', value: 1 },
            { type: 'navigate', to: 'nordeste_dialogo_raimundo#a_voz' },
          ],
        },
        {
          id: 'raimundo_perguntar_reza',
          texto: 'Perguntar da reza que a mãe dele rezava',
          // Escolha travada: aparece, ensina o que falta, não altera estado.
          lockedWhen: { all: [{ key: 'humor.raimundo', op: 'lte', value: 0 }] },
          lockedText: 'Ele não vai falar da mãe com um estranho que ainda não pagou nada.',
          effects: [
            { type: 'set', key: 'pista.cabra_reza', value: 1 },
            // Falar da mãe é entregar alguma coisa: o laço sobe junto com a pista.
            { type: 'adjust', key: 'laco.raimundo', by: 1 },
            { type: 'navigate', to: 'nordeste_dialogo_raimundo#a_reza' },
          ],
        },
        {
          id: 'raimundo_sair',
          texto: 'Agradecer e sair',
          effects: [{ type: 'navigate', to: 'nordeste_dialogo_raimundo#despedida' }],
        },
      ],
    },

    a_voz: {
      id: 'a_voz',
      variantes: [
        { texto: 'Ela chama com a voz da mãe. A criança abre. Depois não tem mais criança.' },
      ],
      escolhas: [
        {
          id: 'a_voz_voltar',
          texto: 'Continuar perguntando',
          effects: [{ type: 'navigate', to: 'nordeste_dialogo_raimundo#abertura' }],
        },
      ],
    },

    a_reza: {
      id: 'a_reza',
      variantes: [
        { texto: 'Minha mãe rezava na soleira. Enquanto ela rezou, nada entrou nesta casa.' },
      ],
      escolhas: [
        {
          id: 'a_reza_voltar',
          texto: 'Continuar perguntando',
          effects: [{ type: 'navigate', to: 'nordeste_dialogo_raimundo#abertura' }],
        },
      ],
    },

    // Rede de segurança do §6 — e também a saída autorada.
    despedida: {
      id: 'despedida',
      variantes: [
        {
          when: { all: [{ key: 'feito.nordeste.mentiu_para_raimundo', op: 'gte', value: 1 }] },
          priority: 1,
          texto: 'Prefeitura uma ova. Some daqui.',
        },
        { texto: 'Vai com Deus. E não anda por aí depois que escurecer.' },
      ],
      escolhas: [
        {
          id: 'despedida_sair',
          texto: 'Sair do bar',
          effects: [{ type: 'navigate', to: 'nordeste_praca' }],
        },
      ],
    },
  },
};

export const NORDESTE_DIALOGUE_SCENES = [RAIMUNDO];
