// TEXTO PROVISÓRIO — esqueleto da fatia vertical (etapa 4 preenche e completa).
import type { Ending, EpilogueFragment } from '@/types/ending';

export const NORDESTE_ENDINGS: Ending[] = [
  {
    id: 'nordeste_reza_na_soleira',
    nome: 'A soleira que ninguém cruzou',
    tags: ['bom'],
    when: {
      all: [
        { key: 'pista.cabra_reza', op: 'gte', value: 1 },
        { key: 'pista.cabra_voz', op: 'gte', value: 1 },
        { key: 'mundo.nordeste.ato', op: 'gte', value: 2 },
      ],
    },
    priority: 10,
    texto: 'Você rezou até o galo. De manhã, a poeira da soleira estava intacta.',
    epilogo: ['vila'],
  },
  {
    id: 'nordeste_estrada_antes_da_noite',
    nome: 'A estrada antes da noite',
    tags: ['fuga'],
    when: { all: [{ key: 'feito.nordeste.fugiu', op: 'gte', value: 1 }] },
    priority: 5,
    texto: 'Você pegou a estrada. Nunca soube o nome do que ficou para trás.',
    epilogo: ['vila'],
  },
  {
    id: 'nordeste_nome_na_escuridao',
    nome: 'O nome que a escuridão devolveu',
    tags: ['neutro'],
    // A condição espelha o que a escolha faz, para que o final resolva igual
    // sendo forçado por id ou resolvido por condição.
    when: { all: [{ key: 'feito.nordeste.chamou_no_escuro', op: 'gte', value: 1 }] },
    priority: 7,
    texto:
      'Você gritou o nome. Alguma coisa respondeu com a mesma voz, e você entendeu tarde demais o que isso queria dizer.',
    epilogo: ['vila'],
  },
  {
    // Fallback: exatamente um final sem `when` por região.
    id: 'nordeste_silencio_que_ficou',
    nome: 'O silêncio que ficou',
    tags: ['neutro', 'ruim'],
    priority: 0,
    texto: 'Você entendeu metade. Metade não fecha porta nenhuma.',
    epilogo: ['vila'],
  },
];

export const NORDESTE_EPILOGUE: EpilogueFragment[] = [
  {
    id: 'vila_apavorada',
    slot: 'vila',
    when: { all: [{ key: 'mundo.nordeste.medo_vila', op: 'gte', value: 2 }] },
    priority: 10,
    texto: 'A vila passou a rezar em voz alta. Ninguém explica para quem.',
  },
  {
    id: 'vila_com_reza',
    slot: 'vila',
    when: { all: [{ key: 'pista.cabra_reza', op: 'gte', value: 1 }] },
    priority: 5,
    texto: 'As mães voltaram a rezar na soleira, como faziam as mães delas.',
  },
  {
    // Fallback do slot: obrigatório.
    id: 'vila_sem_mudanca',
    slot: 'vila',
    priority: 0,
    texto: 'A vila continuou trancada. Ninguém falou no assunto de novo.',
  },
];
