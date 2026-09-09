// TEXTO PROVISÓRIO — esqueleto da fatia vertical (etapa 4 preenche e completa).
// Existe para provar que os contratos aguentam o desenho do §11, não para contar
// a história. Toda `LocalScene` tem ao menos uma escolha incondicional (a saída).
import type { LocalScene } from '@/types/scene';

// Praça — entrada da região. Conecta com o curral e com o bar; ida e volta.
const PRACA: LocalScene = {
  type: 'local',
  id: 'nordeste_praca',
  imagem: 'nordeste_praca',
  textos: [
    {
      // Revisita: variante por `visita.` — a chave é gerada pela engine.
      when: { all: [{ key: 'visita.nordeste_praca', op: 'gte', value: 2 }] },
      priority: 1,
      texto: 'A praça de novo. As janelas continuam trancadas, e agora sabem que você voltou.',
    },
    {
      texto: 'Meio-dia na praça e nenhuma porta aberta. Só o bar tem luz acesa.',
    },
  ],
  escolhas: [
    {
      id: 'praca_ir_bar',
      texto: 'Entrar no bar',
      effects: [{ type: 'navigate', to: 'nordeste_dialogo_raimundo' }],
    },
    {
      id: 'praca_ir_curral',
      texto: 'Rodear até o curral abandonado',
      // O local some quando o ato avança: depois que Raimundo fala, ninguém mais
      // deixa você chegar perto do curral.
      hiddenWhen: { all: [{ key: 'mundo.nordeste.ato', op: 'gte', value: 1 }] },
      effects: [{ type: 'navigate', to: 'nordeste_curral' }],
    },
    {
      id: 'praca_ir_capela',
      texto: 'Procurar a capela no fim da rua',
      // O local só aparece depois de saber que existe uma reza.
      when: { all: [{ key: 'pista.cabra_reza', op: 'gte', value: 1 }] },
      effects: [{ type: 'navigate', to: 'nordeste_capela' }],
    },
    {
      id: 'praca_ir_noite',
      texto: 'Esperar escurecer na praça',
      // `anyOf` é OR de grupos AND: a noite se abre por saber o que escutar
      // **ou** por ter a confiança de Raimundo. Dois caminhos que não se cruzam
      // — é o que impede a construção de ser decorativa.
      when: {
        anyOf: [
          [{ key: 'mundo.nordeste.ato', op: 'gte', value: 1 }],
          [{ key: 'laco.raimundo', op: 'gte', value: 2 }],
        ],
      },
      effects: [{ type: 'navigate', to: 'nordeste_noite' }],
    },
    {
      // Saída incondicional obrigatória — aqui, a saída da região.
      id: 'praca_ir_embora',
      texto: 'Pegar a estrada antes de escurecer',
      effects: [
        { type: 'set', key: 'feito.nordeste.fugiu', value: 1 },
        // Sem `endingId`: a engine resolve por condição.
        { type: 'end_region' },
      ],
    },
  ],
};

// Curral — a pista de exploração.
const CURRAL: LocalScene = {
  type: 'local',
  id: 'nordeste_curral',
  imagem: 'nordeste_curral',
  textos: [
    {
      when: { all: [{ key: 'visita.nordeste_curral', op: 'gte', value: 2 }] },
      priority: 1,
      texto: 'Os rastros continuam onde você os deixou. Ninguém veio apagá-los.',
    },
    {
      texto: 'Cerca arrebentada de dentro para fora. Na poeira, cascos bifurcados grandes demais.',
      // Efeito na exibição da variante: a pista vem de olhar, não de escolher.
      effects: [
        { type: 'set', key: 'pista.cabra_rastros', value: 1 },
        { type: 'adjust', key: 'mundo.nordeste.medo_vila', by: 1 },
      ],
    },
  ],
  escolhas: [
    {
      id: 'curral_voltar',
      texto: 'Voltar para a praça',
      effects: [{ type: 'navigate', to: 'nordeste_praca' }],
    },
  ],
};

// Capela — condicional, e o caminho para o final bom.
const CAPELA: LocalScene = {
  type: 'local',
  id: 'nordeste_capela',
  imagem: 'nordeste_capela',
  textos: [{ texto: 'A capela cheira a vela velha. A porta não tem tranca — nunca teve.' }],
  escolhas: [
    {
      id: 'capela_rezar_na_porta',
      texto: 'Rezar na soleira e esperar a noite',
      when: {
        all: [
          { key: 'pista.cabra_reza', op: 'gte', value: 1 },
          { key: 'pista.cabra_voz', op: 'gte', value: 1 },
        ],
      },
      effects: [
        { type: 'set', key: 'mundo.nordeste.ato', value: 2 },
        { type: 'emit', event: 'vigilia_iniciada', tag: 'nordeste' },
        { type: 'end_region' },
      ],
    },
    {
      id: 'capela_voltar',
      texto: 'Voltar para a praça',
      effects: [{ type: 'navigate', to: 'nordeste_praca' }],
    },
  ],
};

// Noite — onde a região pode acabar sem fuga e sem vitória. É por aqui que o
// final de fallback deixa de ser inalcançável.
const NOITE: LocalScene = {
  type: 'local',
  id: 'nordeste_noite',
  imagem: 'nordeste_noite',
  textos: [
    {
      when: {
        anyOf: [
          [{ key: 'pista.cabra_voz', op: 'gte', value: 1 }],
          [{ key: 'humor.raimundo', op: 'gte', value: 2 }],
        ],
      },
      priority: 1,
      texto: 'Você já sabe o que escutar. Toda voz que vier desta escuridão foi roubada de alguém.',
    },
    {
      texto: 'A vila apagou as luzes cedo demais. Na terra batida, alguma coisa arrasta casco.',
    },
  ],
  escolhas: [
    {
      id: 'noite_chamar_nome',
      texto: 'Chamar pelo nome da criança que sumiu',
      when: {
        anyOf: [
          [{ key: 'pista.cabra_voz', op: 'gte', value: 1 }],
          [{ key: 'laco.raimundo', op: 'gte', value: 2 }],
        ],
      },
      effects: [
        { type: 'adjust', key: 'mundo.nordeste.medo_vila', by: 1 },
        { type: 'set', key: 'feito.nordeste.chamou_no_escuro', value: 1 },
        // Único `end_region` com id explícito da fatia: o final é decidido pela
        // escolha, não resolvido por condição.
        { type: 'end_region', endingId: 'nordeste_nome_na_escuridao' },
      ],
    },
    {
      id: 'noite_esperar',
      texto: 'Ficar na soleira até o dia raiar',
      // Sem id: resolve por condição. Sem reza e sem fuga, cai no fallback.
      effects: [{ type: 'end_region' }],
    },
    {
      // Saída incondicional obrigatória.
      id: 'noite_recuar',
      texto: 'Recuar para dentro e trancar a porta',
      effects: [{ type: 'navigate', to: 'nordeste_praca' }],
    },
  ],
};

export const NORDESTE_LOCAL_SCENES = [PRACA, CURRAL, CAPELA, NOITE];
