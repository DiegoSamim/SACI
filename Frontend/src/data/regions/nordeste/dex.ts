// TEXTO PROVISÓRIO — esqueleto da fatia vertical (etapa 4 preenche e completa).
// As três seções do §8: `lenda` (factual, nunca parcial), `morais` (o que ficou)
// e `textoNaoRegistrado` (quando o final carrega a tag `fuga`).
import type { DexSheet } from '@/types/dex';

export const NORDESTE_DEX: DexSheet = {
  creatureId: 'cabra_cabriola',
  regionId: 'nordeste',
  lenda:
    'Criatura do folclore nordestino, de origem ibérica adaptada no período colonial. ' +
    'Age à noite, imita vozes conhecidas e procura crianças desobedientes.',
  morais: [
    {
      id: 'moral_bom',
      tags: ['bom'],
      priority: 10,
      texto: 'O medo tinha nome e tinha reza. Saber as duas coisas bastou.',
    },
    {
      id: 'moral_ruim',
      tags: ['ruim'],
      priority: 5,
      texto: 'Você anotou o suficiente para acreditar, não para proteger ninguém.',
    },
    {
      id: 'moral_neutro',
      tags: ['neutro'],
      // Abaixo de `moral_ruim` de propósito: o fallback carrega ['neutro','ruim']
      // e casa com os dois, e é a leitura mais dura que deve prevalecer.
      priority: 3,
      texto:
        'Você chegou perto o bastante para ser ouvido. Perto demais não é o mesmo que entender.',
    },
    {
      // Fallback obrigatório: sem `tags` e sem `when`.
      id: 'moral_fallback',
      priority: 0,
      texto: 'Ficou o registro. O resto, o sertão guarda.',
    },
  ],
  textoNaoRegistrado:
    'Ficha não registrada. O investigador foi embora antes de entender o que viu.',
};
