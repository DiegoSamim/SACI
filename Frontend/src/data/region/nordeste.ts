import { ScenarioScene, ScenarioDialogue, Clue, Scene } from '../../types/narrative';

// ─── Pistas ───────────────────────────────────────────────────────────────────
export const NORDESTE_CLUES: Record<string, Clue> = {
  cabra_noite: {
    id: 'cabra_noite',
    regionId: 'nordeste',
    title: 'Criatura Noturna',
    description: 'Seja lá o que for, age apenas à noite. De dia some sem deixar rastros visíveis.',
    icon: '🌕',
  },
  cabra_criancas: {
    id: 'cabra_criancas',
    regionId: 'nordeste',
    title: 'Alvo: Crianças',
    description:
      'A criatura parece caçar crianças. Adultos não são atacados — apenas as crianças somem.',
    icon: '👧',
  },
  cabra_criancas_mal_educadas: {
    id: 'cabra_criancas_mal_educadas',
    regionId: 'nordeste',
    title: 'Crianças Desobedientes',
    description: 'A criatura parece escolher as crianças mais malcriadas e desobedientes.',
    icon: '👦',
  },
  cabra_cheiro: {
    id: 'cabra_cheiro',
    regionId: 'nordeste',
    title: 'Odor Inconfundível',
    description:
      'Um cheiro forte e podre precede a criatura. Como enxofre misturado com bode velho.',
    icon: '💨',
  },
  cabra_voz: {
    id: 'cabra_voz',
    regionId: 'nordeste',
    title: 'A Voz Enganosa',
    description: 'Imita vozes de pessoas conhecidas para fazer crianças saírem ou abrirem a porta.',
    icon: '🗣️',
  },
  cabra_reza: {
    id: 'cabra_reza',
    regionId: 'nordeste',
    title: 'Fraqueza: Oração',
    description: 'Uma reza antiga afasta a criatura. Dona Conceição conhece as palavras.',
    icon: '🙏',
  },
  cabra_amigo_sumiu: {
    id: 'cabra_amigo_sumiu',
    regionId: 'nordeste',
    title: 'Criança Desaparecida',
    description:
      'Pedro, amigo de Franciscleison, sumiu há três dias. Saiu de noite, atrás de uma voz.',
    icon: '❓',
  },
  cabra_rastros: {
    id: 'cabra_rastros',
    regionId: 'nordeste',
    title: 'Rastros Estranhos',
    description: 'Pegadas que não são de nenhum animal conhecido. Grandes, com cascos bifurcados.',
    icon: '🐾',
  },
  cabra_nome: {
    id: 'cabra_nome',
    regionId: 'nordeste',
    title: 'Cabra Cabriola',
    description: 'Dona Conceição revelou o nome: Cabra Cabriola. Uma entidade antiga do sertão.',
    icon: '🐐',
  },
};

// ─── CENAS ────────────────────────────────────────────────────────────────────

const SCENE_ENTRADA: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_entrada',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_entrada.png'),
  narrativeText:
    'O sol de rachar castiga o sertão enquanto você avista Sobradinho. As noticias de acontecimentos estranhos te levaram para essa cidadezinha que parece ter esquecido de existir. As janelas estão fechadas e trancadas em plena tarde. Um cão magro late uma vez e desaparece entre as casas. No ar, um cheiro estranho, pesado, que você não consegue identificar. Algo está errado aqui. Você sente nos ossos.',
  question: 'O que você decide fazer?',
  choices: [
    {
      id: 'entrar_bar',
      text: 'Entrar no único bar com luz acesa',
      blockConditions: ['dialogo_raimundo_concluido'],
      consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo' }],
    },
    {
      id: 'explorar_cidade',
      text: 'Passear pelas ruas primeiro',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_cidade' }],
    },
    {
      id: 'ir_caatinga',
      text: 'Ir direto para a caatinga',
      blockConditions: ['caatinga_bloqueada'],
      consequences: [{ type: 'navigate', sceneId: 'nordeste_caatinga_dia' }],
    },
    {
      id: 'ir_embora',
      text: 'Esse lugar me dá mau presságio. Ir embora.',
      consequences: [{ type: 'game_over', reason: 'fled' }],
    },
  ],
};

const SCENE_CIDADE: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_cidade',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_cidade.png'),
  narrativeText:
    'As ruas de terra batida estão desertas. Portas trancadas com ferrolho em pleno dia. No fim da rua, uma senhora idosa entreabre a persiana e te observa desconfiada. No beco do outro lado, uma criança aperta um terço de madeira nas mãos, seus olhos marejados indicam tristeza.',
  question: 'O que você faz?',
  choices: [
    {
      id: 'falar_senhora',
      text: 'Chamar a senhora da janela',
      blockConditions: ['dialogo_senhora_concluido'],
      consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora' }],
    },
    {
      id: 'falar_crianca',
      text: 'Se aproximar da criança no beco',
      blockConditions: ['dialogo_crianca_concluido'],
      consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca' }],
    },
    {
      id: 'voltar_entrada',
      text: 'Voltar para a entrada da cidade',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_entrada' }],
    },
    {
      id: 'enfrentar_criatura_com_ajuda',
      text: 'É hora de enfrentar o que está aqui',
      requiresConditions: [
        'ajuda_franciscleison',
        'dialogo_raimundo_concluido',
        'dialogo_senhora_concluido',
        'dialogo_crianca_concluido',
      ],
      consequences: [{ type: 'navigate', sceneId: 'nordeste_confronto_noite' }],
    },
    {
      id: 'enfrentar_criatura_solo',
      text: 'Já sei o suficiente. Enfrentar sozinho.',
      requiresConditions: [
        'dialogo_raimundo_concluido',
        'dialogo_senhora_concluido',
        'dialogo_crianca_concluido',
      ],
      consequences: [{ type: 'navigate', sceneId: 'nordeste_confronto_solo' }],
    },
  ],
};

const SCENE_CAATINGA_DIA: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_caatinga_dia',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_caatinga_dia.png'),
  narrativeText:
    'A caatinga é uma tela branca e silenciosa. Mandacarus retorcidos, galhos secos como dedos de osso. Você encontra rastros estranhos no chão ressecado e sabe que não são de nenhum animal que você conheça. Grandes, com marcas de casco bifurcado. O cheiro da cidade aqui é mais forte, mais concentrado. Um arrepio sobe pela sua espinha naquele calor de quarenta graus.',
  question: 'O que você faz?',
  choices: [
    {
      id: 'examinar_rastros',
      text: 'Examinar os rastros de perto',
      consequences: [
        { type: 'add_clue', clueId: 'cabra_rastros' },
        { type: 'navigate', sceneId: 'nordeste_caatinga_dia_2' },
      ],
    },
    {
      id: 'seguir_cheiro',
      text: 'Seguir o cheiro mais a fundo',
      consequences: [
        { type: 'add_clue', clueId: 'cabra_cheiro' },
        { type: 'navigate', sceneId: 'nordeste_caatinga_dia_2' },
      ],
    },
    {
      id: 'voltar_caatinga_1',
      text: 'Voltar para a cidade',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_entrada' }],
    },
  ],
};

const SCENE_CAATINGA_DIA_2: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_caatinga_dia_2',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_caatinga_dia_2.png'),
  narrativeText:
    "Você foi mais fundo. Os rastros levam numa direção, depois dobram, depois somem. Você para. Um mandacaru enorme à esquerda. Três pedras no caminho. Um galho em Y na direita. Você jura que já passou por aqui. Os mesmos mandacarus. As mesmas pedras. O mesmo galho. 'O sertão é assim mesmo', você pensa. Talvez seja coincidência.",
  question: 'Explorar mais ou retornar?',
  choices: [
    {
      id: 'explorar_caatinga_2',
      text: 'Deve ser impressão. Continuar.',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_caatinga_dia_3' }],
    },
    {
      id: 'retornar_caatinga_2',
      text: 'Isso não está certo. Voltar.',
      consequences: [
        { type: 'navigate', sceneId: 'nordeste_entrada' },
        { type: 'add_condition', condition: 'caatinga_bloqueada' },
      ],
    },
  ],
};

const SCENE_CAATINGA_DIA_3: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_caatinga_dia_3',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_caatinga_dia_2.png'),
  narrativeText:
    'Você muda a direção. O mesmo mandacaru enorme. As mesmas três pedras. O mesmo galho em Y. De novo. O silêncio pesa. Não é impressão. Algo está te fazendo andar em círculos.',
  question: 'Continue ou recue?',
  choices: [
    {
      id: 'explorar_caatinga_3',
      text: 'Tem que ter uma saída. Continuar.',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_caatinga_dia_4' }],
    },
    {
      id: 'retornar_caatinga_3',
      text: 'Sair daqui agora. Retornar pelo mesmo caminho.',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_caatinga_dia_4' }],
    },
  ],
};

const SCENE_CAATINGA_DIA_4: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_caatinga_dia_4',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_caatinga_dia_2.png'),
  narrativeText:
    'Qualquer direção que você escolhe te leva para o mesmo lugar. Mandacaru. Pedras. Galho em Y. Você não está andando em círculos. Os círculos estão se fechando ao redor de você. A caatinga não está deixando você sair.',
  choices: [
    {
      id: 'forcar_saida',
      text: 'Forçar uma saída correndo',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_caatinga_confusao' }],
    },
    {
      id: 'parar_pensar',
      text: 'Parar e tentar entender o que está acontecendo',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_caatinga_confusao' }],
    },
  ],
};

const SCENE_CAATINGA_CONFUSAO: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_caatinga_confusao',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_caatinga_confusao.png'),
  narrativeText:
    'O mesmo mandacaru. As mesmas pedras. O mesmo galho. Você olha pro caderno vendo a anotação da hora que entrou: duas da tarde. Seu relógio marca oito e meia da noite. Seis horas e meia andando sem sair do lugar e você nem percebeu. O sol sumiu em um piscar de olhos. Está escuro. O cheiro ficou insuportável. Dois olhos vermelhos piscam entre os mandacarus. Uma risada baixa, macabra. Ela te observa.',
  question: 'Não tem saída.',
  choices: [
    {
      id: 'tentar_sair',
      text: 'Correr em qualquer direção',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_caatinga_pego' }],
    },
    {
      id: 'rezar_caatinga',
      text: 'Rezar a oração que a senhora ensinou',
      requiresClues: ['cabra_reza'],
      consequences: [{ type: 'navigate', sceneId: 'nordeste_caatinga_fuga_reza' }],
    },
  ],
};

const SCENE_CAATINGA_FUGA_REZA: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_caatinga_fuga_reza',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_caatinga_fuga_reza.jpg'),
  narrativeText:
    'Você fecha os olhos e começa a rezar. A voz sai trêmula mas vai ficando mais firme. Os olhos vermelhos recuam. Um guincho rasgado ecoa pela caatinga. De repente você reconhece onde está. A entrada da caatinga, a duzentos metros da cidade. Você corre sem olhar pra trás.',
  question: '',
  choices: [
    {
      id: 'fuga_reza_voltar',
      text: 'Correr de volta para a cidade',
      consequences: [
        { type: 'add_clue', clueId: 'cabra_noite' },
        { type: 'navigate', sceneId: 'nordeste_cidade' },
        { type: 'add_condition', condition: 'caatinga_bloqueada' },
      ],
    },
  ],
};

const SCENE_CAATINGA_PEGO: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_caatinga_pego',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_caatinga_pego.png'),
  narrativeText:
    'Você corre desesperadamente, mas já é tarde demais. A criatura se assemelhava a uma cabra gigante, com chifres curvos e dentes afiados e os traços humanos tornavam a visão ainda mais aterrorizante. Ela não estava te observando, ela estava te atraindo. Você é pego, arrastado para o coração da caatinga, e tudo fica escuro. O cheiro de enxofre é a última coisa que você sente.',
  question: '...',
  choices: [
    {
      id: 'caatinga_game_over',
      text: '...',
      consequences: [{ type: 'game_over', reason: 'caught' }],
    },
  ],
};

const SCENE_CONFRONTO_NOITE: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_confronto_noite',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_confronto_noite.png'),
  narrativeText:
    'Meia-noite. Você se esconde na sombra de uma casa, de frente para a viela. Tudo quieto demais. O cheiro vem primeiro. Podre e errado. Depois a voz quebra o silêncio. Franciscleison... abre a porta preciso de ajuda... A voz é de um garoto. Confuso, você então percebe que pode ser a voz do amigo desaparecido de Franciscleison. Ele está em perigo. Você tem que agir rápido. A voz chama novamente, mais urgente. Franciscleison... por favor... socorro, ela ta vindo...',
  question: 'A voz chama novamente.',
  choices: [
    {
      id: 'rezar_confronto',
      text: 'Começar a rezar alto',
      requiresClues: ['cabra_reza'],
      consequences: [{ type: 'navigate', sceneId: 'nordeste_catalogar_inicio' }],
    },
    {
      id: 'gritar_aviso',
      text: 'Gritar pro Franciscleison: não abre!',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_confronto_noite_game_over1' }],
    },
    {
      id: 'enfrentar_criatura',
      text: 'Correr desesperado para a porta e tentar enfrentar a criatura',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_confronto_noite_game_over2' }],
    },
  ],
};

const SCENE_CONFRONTO_SOLO: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_confronto_solo',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_confronto_solo.png'),
  narrativeText:
    'Meia-noite. Você está só na praça escura. O cheiro chega primeiro. Os olhos vermelhos aparecem entre as sombras. Uma voz, a sua própria voz, fala o seu nome. Ela está testando você. ',
  question: 'Hora de agir.',
  choices: [
    {
      id: 'rezar_solo',
      text: 'Rezar a oração da Dona Conceição',
      requiresClues: [
        'cabra_reza',
        'cabra_noite',
        'cabra_rastros',
        'cabra_voz',
        'cabra_criancas_mal_educadas',
        'cabra_nome',
      ],
      consequences: [{ type: 'navigate', sceneId: 'nordeste_catalogar_inicio' }],
    },
    {
      id: 'nao_reza_solo',
      text: 'Tentar enfrentar na força',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_confronto_solo_game_over' }],
    },
  ],
};

const SCENE_CATALOGAR_INICIO: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_catalogar_inicio',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_catalogar_inicio.png'),
  narrativeText:
    'A oração ecoa na praça empoeirada. Os olhos vermelhos piscam uma, duas, três vezes e recuam para a escuridão. Um guincho animal rasga a noite. Depois: silêncio. O cheiro começa a dissipar. Você ouve passos se distanciando na caatinga. Ela foi embora. Você abre o bestiário com mãos trêmulas.',
  question: '',
  choices: [
    {
      id: 'catalogar_confirmar',
      text: 'Registrar a criatura no bestiário',
      consequences: [{ type: 'navigate', sceneId: 'nordeste_catalogar' }],
    },
  ],
};

const SCENE_CATALOGAR: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_catalogar',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_catalogar.png'),
  narrativeText:
    'Cabra Cabriola, nordeste do Brasil. Criatura noturna de grande porte, chifres curvos, dentes afiados. Age contra crianças desobedientes. Imita vozes humanas para atrair vítimas. Exala odor forte de enxofre e animal. Capaz de desorientar o ambiente ao redor. Fraqueza confirmada: oração de proteção popular. Ao amanhecer, Sobradinho respira diferente. Uma janela aberta. Um riso de criança.',
  question: '',
  choices: [
    {
      id: 'voltar_mapa',
      text: 'Voltar ao mapa',
      consequences: [{ type: 'game_over', reason: 'catalogued' }],
    },
  ],
};

const SCENE_CIDADE_GAME_OVER: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_cidade_game_over',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_cidade_game_over.png'),
  narrativeText:
    'Você voltou para Sobradinho alguns dias depois. A praça está mais vazia. Na porta do bar fechado, uma folha amarelada pregada com prego enferrujado. Sete nomes escritos a lápis. Nomes de criança. O último: Franciscleison',
  question: 'Você não fez nada',
  choices: [
    {
      id: 'game_over_final',
      text: 'Fechar o bestiário',
      consequences: [{ type: 'game_over', reason: 'fled' }],
    },
  ],
};

const SCENE_CONFRONTO_SOLO_GAME_OVER: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_confronto_solo_game_over',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_confronto_solo_game_over.png'),
  narrativeText:
    'Você tentou enfrentar a criatura sozinho, sem ajuda, sem preparação. Ela te pegou facilmente. O cheiro de enxofre é a última coisa que você sente enquanto é arrastado para o coração da caatinga.',
  question: '...',
  choices: [
    {
      id: 'game_over_confronto_solo',
      text: '...',
      consequences: [{ type: 'game_over', reason: 'caught' }],
    },
  ],
};

const SCENE_CONFRONTO_NOITE_GAME_OVER1: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_confronto_noite_game_over1',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_confronto_noite_game_over.png'),
  narrativeText:
    'Você gritou para Franciscleison não abrir a porta. A criatura grita em um desespero macabro e pula em você antes que possa reagir. O cheiro de enxofre é a última coisa que você sente enquanto é arrastado para o coração da caatinga.',
  question: '...',
  choices: [
    {
      id: 'game_over_confronto_noite',
      text: '...',
      consequences: [{ type: 'game_over', reason: 'caught' }],
    },
  ],
};

const SCENE_CONFRONTO_NOITE_GAME_OVER2: ScenarioScene = {
  type: 'scenario_scene',
  id: 'nordeste_confronto_noite_game_over2',
  regionId: 'nordeste',
  imageSource: require('../../assets/scenario/nordeste/nordeste_confronto_noite_game_over.png'),
  narrativeText:
    'Você correu desesperado e tentou enfrentar a criatura. A cabra saltou em você com uma força descomunal, te derrubando no chão. Antes que pudesse reagir, ela estava sobre você, arranhando seu rosto com os dentes afiados. O cheiro de enxofre é a última coisa que você sente enquanto é arrastado para o coração da caatinga.',
  question: '...',
  choices: [
    {
      id: 'game_over_confronto_noite',
      text: '...',
      consequences: [{ type: 'game_over', reason: 'caught' }],
    },
  ],
};

// ─── DIÁLOGOS ─────────────────────────────────────────────────────────────────

const DIALOGUE_RAIMUNDO: ScenarioDialogue = {
  type: 'scenario_dialogue',
  id: 'nordeste_dialogo_raimundo',
  regionId: 'nordeste',
  backgroundImageSource: require('../../assets/scenario/nordeste/nordeste_dialogo_raimundo.png'),
  npcId: 'raimundo',
  npcName: 'Seu Raimundo',
  npcRole: 'Dono do Bar',
  initialLineId: 'r1',
  lines: {
    r1: {
      id: 'r1',
      mood: 'suspicious',
      text: 'Bar tá fechado, moço. Tá vendo a placa ali. *(Esfrega o balcão com um pano encardido sem olhar pra você)*',
      choices: [
        {
          id: 'r1_desaparecimentos',
          text: '"Não vim beber. Vim perguntar sobre o que tá acontecendo aqui."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r2_desconfiado' }],
        },
        {
          id: 'r1_investigador',
          text: '"Sou investigador. Vim de fora. Preciso conversar."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r2_aberto' }],
        },
        {
          id: 'r1_cheiro',
          text: '"Desde que cheguei sinto um cheiro horrível. Normal aqui?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r2_cheiro' }],
        },
        {
          id: 'r1_provocar',
          text: '"Curioso que o único bar aberto não quer cliente."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r1_provocado' }],
        },
        {
          id: 'r1_sair',
          text: 'Sair sem dizer nada.',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_entrada' },
            { type: 'add_condition', condition: 'dialogo_raimundo_concluido' },
          ],
        },
      ],
    },

    r1_provocado: {
      id: 'r1_provocado',
      mood: 'angry',
      text: '*(Ele para de esfregar e ergue o olho pela primeira vez)* Tá querendo me ensinar como tocá meu bar, é? *(Resmugando)* Diga logo o que quer ou pegue o beco antes que eu te mande embora.',
      choices: [
        {
          id: 'r1p_recuar',
          text: '"Desculpe. Fui sem educação. Só quero entender o que está acontecendo nessa cidade."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r2_desconfiado' }],
        },
        {
          id: 'r1p_insistir',
          text: '"A cidade tá estranha demais pra ignorar. Preciso de informação."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r2_desconfiado' }],
        },
        {
          id: 'r1p_sair',
          text: 'Sair sem dizer mais nada.',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_entrada' },
            { type: 'add_condition', condition: 'dialogo_raimundo_concluido' },
          ],
        },
      ],
    },

    r2_cheiro: {
      id: 'r2_cheiro',
      mood: 'suspicious',
      text: '*(Para. Olha pro balcão. Demora antes de responder)* Cheiro... *(Bufou)* Todo mundo sentiu. Ninguém fala. Prefeitura diz que é coisa do rio. O rio tá quase seco.',
      choices: [
        {
          id: 'r2c_oque_acha',
          text: '"Prefeitura tá mentindo então. O que você acha que é?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r3' }],
        },
        {
          id: 'r2c_cidade',
          text: '"A cidade toda parece com medo de algo. Tá assim há quanto tempo?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r2_cheiro_b' }],
        },
        {
          id: 'r2c_ignorar',
          text: '"Entendi. Obrigado."',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_entrada' },
            { type: 'add_condition', condition: 'dialogo_raimundo_concluido' },
          ],
        },
      ],
    },

    r2_cheiro_b: {
      id: 'r2_cheiro_b',
      mood: 'suspicious',
      text: 'Dez dias. *(Seco)* Dez dias que esse fedor aparece toda noite. Dez dias que as pessoa trancam a porta antes do sol se pôr.',
      choices: [
        {
          id: 'r2cb_oque',
          text: '"O que aconteceu dez dias atrás?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r3' }],
        },
        {
          id: 'r2cb_voce',
          text: '"E você? Também tá com medo?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r2_cheiro_c' }],
        },
      ],
    },

    r2_cheiro_c: {
      id: 'r2_cheiro_c',
      mood: 'angry',
      text: '*(Ergue o olhar, duro)* Com medo? Eu? *(Pausa pesada)* Eu fico aqui toda noite com o bar fechado e a luz apagada esperando o amanhecer. *(Baixinho)* Chame isso do que quiser.',
      choices: [
        {
          id: 'r2cc_continuar',
          text: '"O que aconteceu pra ficar assim?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r3' }],
        },
        {
          id: 'r2cc_respeitar',
          text: '"Entendo. Obrigado por falar comigo."',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_entrada' },
            { type: 'add_condition', condition: 'dialogo_raimundo_concluido' },
          ],
        },
      ],
    },

    r2_desconfiado: {
      id: 'r2_desconfiado',
      mood: 'suspicious',
      text: '*(Levanta o olho, te medindo)* HAHA... *(Ri sem graça)* Essa gentinha de fora aparece aqui querendo saber o que acontece e quando descobrem, correm com o rabo entre as pernas antes do sol raiar. *(Pausa)* Ocê vai ser igual a todos, vá embora e não mexa com o que não entende.',
      choices: [
        {
          id: 'r2d_diferente',
          text: '"Porque eu não vou embora. Vim pra ficar e resolver isso."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r3' }],
        },
        {
          id: 'r2d_ajudar',
          text: '"Porque é o meu trabalho. E porque a cidade precisa de ajuda."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r3' }],
        },
        {
          id: 'r2d_ameaca',
          text: '"Eu não tenho medo igual a vocês. Conte logo homem e não perca nosso tempo."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r2_irritado' }],
        },
      ],
    },

    r2_irritado: {
      id: 'r2_irritado',
      mood: 'angry',
      text: '*(Ele bate o pano no balcão)* Tá querendo me provocar, é? *(Olha fixamente)* Eu já falei, vá embora. Não tem nada pra você aqui. *(Pausa)* Se fosse eu, não voltava mais nessa cidade. Nem de dia, nem de noite. Saia.',
      choices: [
        {
          id: 'r2i_sair',
          text: 'Sair sem dizer mais nada.',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_entrada' },
            { type: 'add_condition', condition: 'dialogo_raimundo_concluido' },
          ],
        },
      ],
    },

    r2_aberto: {
      id: 'r2_aberto',
      mood: 'neutral',
      text: '*(Para de esfregar. Te olha de verdade pela primeira vez)* Investigador... *(Examina)* De onde?',
      choices: [
        {
          id: 'r2a_particular',
          text: '"Particular. Independente."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r2a_continuar' }],
        },
        {
          id: 'r2a_federal',
          text: '"Federal. Casos como esse chegam até nós (Mentir)."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r2a_continuar' }],
        },
        {
          id: 'r2a_nao_importa',
          text: '"Não importa. Importa que estou aqui e você não precisa lidar com isso sozinho."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r3' }],
        },
      ],
    },

    r2a_continuar: {
      id: 'r2a_continuar',
      mood: 'neutral',
      text: '*(Assente lentamente)* Tá bom. *(Apoia os cotovelos no balcão)* O que ocê quer saber?',
      choices: [
        {
          id: 'r2ac_cidade',
          text: '"O que está acontecendo nessa cidade?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r3' }],
        },
        {
          id: 'r2ac_cheiro',
          text: '"Esse cheiro que sinto desde que cheguei — o que é?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r2_cheiro' }],
        },
      ],
    },

    // Nó central
    r3: {
      id: 'r3',
      mood: 'scared',
      text: '*(Abaixa a voz e se inclina sobre o balcão)* Meu avô contava uma coisa... uma criatura que vinha de noite. Que imitava voz de gente conhecida pra enganar. *(Pausa)* Eu achava história de velho pra meter medo em criança teimosa. Mas agora...',
      choices: [
        {
          id: 'r3_criatura',
          text: '"Você acha que é uma criatura de verdade?"',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r3_acredita' },
            { type: 'add_clue', clueId: 'cabra_voz' },
          ],
        },
        {
          id: 'r3_nome',
          text: '"Essa coisa tem nome?"',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r3_nome' },
            { type: 'add_clue', clueId: 'cabra_voz' },
          ],
        },
        {
          id: 'r3_para',
          text: '"Tem como parar ela?"',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r4' },
            { type: 'add_clue', clueId: 'cabra_voz' },
          ],
        },
      ],
    },

    r3_acredita: {
      id: 'r3_acredita',
      mood: 'neutral',
      text: '*(Suspira fundo)* Eu num acreditava... mas esse fedor toda noite, as porta todas trancadas, as pessoa com essa cara... *(Baixinho)* Isso num é coisa de Deus não.',
      choices: [
        {
          id: 'r3a_nome',
          text: '"Tem alguém que sabe mais? Que já viu isso antes?"',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r3_nome' },
            { type: 'add_clue', clueId: 'cabra_cheiro' },
          ],
        },
        {
          id: 'r3a_para',
          text: '"Como se para isso?"',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r4' },
            { type: 'add_clue', clueId: 'cabra_cheiro' },
          ],
        },
      ],
    },

    r3_nome: {
      id: 'r3_nome',
      mood: 'scared',
      text: '*(Balança a cabeça)* Meu avô nunca dizia o nome. Dizia que falar o nome chamava. *(Pausa)* Só uma pessoa aqui pode saber — Dona Conceição. A mais velha da cidade. Viveu a última vez que isso aconteceu.',
      choices: [
        {
          id: 'r3n_conceicao',
          text: '"Preciso falar com ela. Como eu chego nessa Dona Conceição?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r4_conceicao' }],
        },
        {
          id: 'r3n_jafalei',
          text: '"Já falei com ela. Me ajudou muito."',
          requiresConditions: ['dialogo_senhora_concluido'],
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r3_jafalou_senhora' },
          ],
        },
      ],
    },

    r3_jafalou_senhora: {
      id: 'r3_jafalou_senhora',
      mood: 'friendly',
      text: '*(Ele abre um sorriso discreto)* Ela te recebeu... *(Acena com a cabeça)* Então você já sabe o que tem que fazer. Deixe de teatro homem. O que vai fazer agora?',
      choices: [
        {
          id: 'r3jfs_enfrentar',
          text: '"Vou atrás do bicho."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r5_final' }],
        },
        {
          id: 'r3jfs_planejar',
          text: '"Ainda estou juntando informação."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r5_final' }],
        },
      ],
    },

    r4: {
      id: 'r4',
      mood: 'neutral',
      text: '*(Pensa)* Meu avô dizia que reza afasta. Mas eu não sei reza nenhuma dessa antiga. Quem sabe mesmo é Dona Conceição — a mais velha da cidade. Mas ela não abre a porta pra qualquer um.',
      choices: [
        {
          id: 'r4_como',
          text: '"Como eu faço ela me receber?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r4_conceicao' }],
        },
        {
          id: 'r4_jafalei',
          text: '"Já falei com ela. Ela me deu a reza."',
          requiresConditions: ['dialogo_senhora_concluido'],
          requiresClues: ['cabra_reza'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_raimundo#r4_jafalou' }],
        },
      ],
    },

    r4_jafalou: {
      id: 'r4_jafalou',
      mood: 'friendly',
      text: '*(Ele para. Olha pra você animado)* Ela te deu a reza... Então pra que todo esse misterio homem. Cuide, vá fazer o que tem que ser feito',
      choices: [
        {
          id: 'r4j_obrigado',
          text: '"Obrigado, Seu Raimundo."',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_raimundo_concluido' },
          ],
        },
      ],
    },

    r4_conceicao: {
      id: 'r4_conceicao',
      mood: 'friendly',
      text: "Fala que foi eu que mandei. Ela desconfia de todo mundo, mas sabe que eu não mando ninguém de má intenção. *(Empurra um copo d'água)* Vai com jeito, viu? A véia é arisca. Qualquer coisa errada, fecha a janela na sua cara.",
      choices: [
        {
          id: 'r4c_obrigado',
          text: '"Obrigado, Seu Raimundo. Vou falar com ela."',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_raimundo_concluido' },
            { type: 'add_condition', condition: 'raimundo_indicacao' },
          ],
        },
      ],
    },

    r5_final: {
      id: 'r5_final',
      mood: 'friendly',
      text: '*(Ele assente lento)* Cuida de você lá fora. *(Vira pro balcão e não fala mais nada — mas dessa vez não é grosseria. É preocupação.)*',
      choices: [
        {
          id: 'r5f_sair',
          text: 'Sair do bar.',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_raimundo_concluido' },
          ],
        },
      ],
    },
  },
};

const DIALOGUE_SENHORA: ScenarioDialogue = {
  type: 'scenario_dialogue',
  id: 'nordeste_dialogo_senhora',
  regionId: 'nordeste',
  backgroundImageSource: require('../../assets/scenario/nordeste/nordeste_dialogo_senhora.png'),
  npcId: 'conceicao',
  npcName: 'Dona Conceição',
  npcRole: 'Moradora',
  initialLineId: 's1',
  lines: {
    s1: {
      id: 's1',
      mood: 'suspicious',
      text: '*(Ela abre só um fio da persiana)* Que foi? Num tô comprando nada não.',
      choices: [
        {
          id: 's1_raimundo',
          text: '"Seu Raimundo do bar me mandou. Disse que a senhora podia me ajudar."',
          requiresConditions: ['raimundo_indicacao'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2_raimundo' }],
        },
        {
          id: 's1_investigador',
          text: '"Sou investigador. Vim de fora por causa do que está acontecendo aqui."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2_investigador' }],
        },
        {
          id: 's1_direto',
          text: '"Soube que tem algo de ruim acontecendo aqui na cidade."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2_direto' }],
        },
        {
          id: 's1_educado',
          text: '"Boa tarde, dona. Tô passando pela cidade e a coisa tá estranha demais."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2_educado' }],
        },
        {
          id: 's1_pressao',
          text: '"Sei que a senhora sabe alguma coisa. Todo mundo aqui sabe."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2_pressao' }],
        },
      ],
    },

    s2_raimundo: {
      id: 's2_raimundo',
      mood: 'neutral',
      text: '*(Para. Abre mais um pouco)* Raimundo mandou... *(Suspira fundo)* Então ele já sabe que voltou. *(Longa pausa)* Entra pelos fundos. Num é coisa de falar assim, na rua.',
      choices: [
        {
          id: 's2r_entrar',
          text: 'Ir para a porta dos fundos.',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa' }],
        },
      ],
    },

    s2_investigador: {
      id: 's2_investigador',
      mood: 'suspicious',
      text: '*(Te mede dos pés à cabeça)* Investigador... de onde? Prefeitura num mandou ninguém não.',
      choices: [
        {
          id: 's2i_particular',
          text: '"Particular. Investigo coisas que a prefeitura não quer ver."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2i_continuar' }],
        },
        {
          id: 's2i_raimundo',
          text: '"Falei com Seu Raimundo. Ele me indicou a senhora."',
          requiresConditions: ['raimundo_indicacao'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2_raimundo' }],
        },
        {
          id: 's2i_janela_fechada',
          text: '"A senhora vai ficar aí na janela ou me deixa explicar direito?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2_pressao' }],
        },
      ],
    },

    s2i_continuar: {
      id: 's2i_continuar',
      mood: 'suspicious',
      text: '*(Olha pra você um tempo)* ...Você tem cara de pessoa séria. *(Com cautela)* O que ocê já sabe?',
      choices: [
        {
          id: 's2ic_cheiro',
          text: '"Sei que tem um cheiro forte na cidade toda noite. Como enxofre."',
          requiresClues: ['cabra_cheiro'],
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2i_impressionada' },
          ],
        },
        {
          id: 's2ic_rastros',
          text: '"Encontrei rastros na caatinga. Cascos bifurcados. Não são de animal comum."',
          requiresClues: ['cabra_rastros'],
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2i_impressionada' },
          ],
        },
        {
          id: 's2ic_ambos',
          text: '"Rastros estranhos na caatinga e esse cheiro toda noite."',
          requiresClues: ['cabra_cheiro', 'cabra_rastros'],
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2i_muito_impressionada' },
          ],
        },
        {
          id: 's2ic_pouco',
          text: '"Ainda pouco. Por isso vim falar com a senhora."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2i_fechada' }],
        },
      ],
    },

    s2i_impressionada: {
      id: 's2i_impressionada',
      mood: 'neutral',
      text: '*(Assente devagar)* Ocê pelo menos prestou atenção... *(Olha a rua)* Entra. Pelos fundos. Rápido.',
      choices: [
        {
          id: 's2ii_entrar',
          text: 'Ir para a porta dos fundos.',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa' }],
        },
      ],
    },

    s2i_muito_impressionada: {
      id: 's2i_muito_impressionada',
      mood: 'friendly',
      text: '*(Ela para. Olha diferente pra você)* Ocê foi na caatinga e voltou... *(Quase pra si mesma)* Isso não é qualquer um. *(Abre mais a persiana)* Entra pelos fundos.',
      choices: [
        {
          id: 's2im_entrar',
          text: 'Ir para a porta dos fundos.',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa' }],
        },
      ],
    },

    s2i_fechada: {
      id: 's2i_fechada',
      mood: 'suspicious',
      text: '*(Balança a cabeça)* Num posso ajudar quem num foi atrás de nada não. *(Começa a fechar)* Vá perguntar por aí primeiro.',
      choices: [
        {
          id: 's2if_criancas',
          text: '"Algo ruim está acontecendo aqui. Não tenho tempo de dar voltas."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2i_convencer' }],
        },
        {
          id: 's2if_sair',
          text: 'Aceitar e se afastar.',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_senhora_concluido' },
          ],
        },
        {
          id: 's2if_curiosa',
          text: '"Entendo. Mas a senhora vai ficar aqui nessa janela esperando o pior?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2i_desafiada' }],
        },
      ],
    },

    s2i_desafiada: {
      id: 's2i_desafiada',
      mood: 'angry',
      text: '*(Olha duro pra você)* Eu sei muito bem o que fazer. Saia da minha janela *(Fecha a persiana com firmeza)*',
      choices: [
        {
          id: 's2id_sair',
          text: 'Afastar-se.',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_senhora_concluido' },
          ],
        },
      ],
    },

    s2i_convencer: {
      id: 's2i_convencer',
      mood: 'scared',
      text: '*(Hesita. Olha pra rua vazia)* ...Entre. Mas rápido. E não conta pra ninguém que você veio aqui.',
      choices: [
        {
          id: 's2ic_entrar',
          text: 'Entrar pela porta dos fundos.',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa' }],
        },
      ],
    },

    s2_cheiro: {
      id: 's2_cheiro',
      mood: 'scared',
      text: '*(Ela recua um pouco. Olha pra rua antes de responder)* *(Baixíssimo)* Você sentiu... *(Pausa longa)* Entre pelos fundos. Não é coisa de falar aqui fora.',
      choices: [
        {
          id: 's2c_entrar',
          text: 'Ir para a porta dos fundos.',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa' }],
        },
      ],
    },

    s2_direto: {
      id: 's2_direto',
      mood: 'scared',
      text: '*(Ela se assusta e recua)* Ôxe, pelo amor de Deus! Num fala isso alto na rua! *(Sussurra)* Ela escuta... vai simbora. Num posso ajudar não.',
      choices: [
        {
          id: 's2d_insistir',
          text: '"Alguma coisa está acontecendo aqui. Preciso de ajuda."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2d_resistir' }],
        },
        {
          id: 's2d_sair',
          text: 'Pedir desculpa e se afastar.',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_senhora_concluido' },
          ],
        },
        {
          id: 's2d_mais_alto',
          text: '"Fale senhora! O que tem de tão ruim acontecendo aqui?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2d_fechou' }],
        },
      ],
    },

    s2d_fechou: {
      id: 's2d_fechou',
      mood: 'angry',
      text: '*(Ela fecha a persiana com força. O estalo ecoa na rua vazia.)*',
      choices: [
        {
          id: 's2df_sair',
          text: 'Afastar-se da janela.',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_senhora_concluido' },
          ],
        },
      ],
    },

    s2d_resistir: {
      id: 's2d_resistir',
      mood: 'scared',
      text: '*(Em conflito)* Eu sei que sim... *(Voz mínima)* Mas falar sobre isso chama. Quanto mais a gente comenta, mais ela fica por perto.',
      choices: [
        {
          id: 's2dr_experiencia',
          text: '"A senhora já viu isso antes. Nos seus olhos eu vejo."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2d_cede' }],
        },
        {
          id: 's2dr_raimundo',
          text: '"Raimundo do bar me disse que a senhora era a única que podia ajudar."',
          requiresConditions: ['raimundo_indicacao'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2d_cede' }],
        },
        {
          id: 's2dr_respeitar',
          text: '"Entendo. Vou buscar mais informação antes."',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_senhora_concluido' },
          ],
        },
      ],
    },

    s2d_cede: {
      id: 's2d_cede',
      mood: 'neutral',
      text: '*(Longa pausa. Olha pra rua. Olha pra você)* ...Porta dos fundos. Mas você não esteve aqui, tá bom?',
      choices: [
        {
          id: 's2dc_entrar',
          text: 'Entrar pela porta dos fundos.',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa' }],
        },
      ],
    },

    s2_educado: {
      id: 's2_educado',
      mood: 'neutral',
      text: '*(Te avalia)* Você tem mais jeito que a maioria que passa por aqui. *(Pausa)* O que você quer saber?',
      choices: [
        {
          id: 's2e_cidade',
          text: '"A cidade parece com medo de algo. Isso é recente?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2e_cidade' }],
        },
        {
          id: 's2e_confianca',
          text: '"Todos tem medo. Mas a senhora foi uma das poucas pessoas que me recebeu. Por que? O que a senhora sabe?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2e_confianca' }],
        },
        {
          id: 's2e_cheiro',
          text: '"A senhora também sente aquele cheiro estranho toda noite?"',
          requiresClues: ['cabra_cheiro'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2_cheiro' }],
        },
      ],
    },

    s2e_cidade: {
      id: 's2e_cidade',
      mood: 'neutral',
      text: 'Dez dias. *(Seca)* Antes disso, a última vez foi quando eu tinha doze anos. *(Uma sombra no rosto)* Eu me lembro de tudo. *(Olha diferente pra você)* Você quer mesmo saber?',
      choices: [
        {
          id: 's2ec_sim',
          text: '"Quero. A senhora parece ser a única que pode me contar direito."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2_raimundo' }],
        },
        {
          id: 's2ec_nao',
          text: '"Acho melhor não... Obrigado pelo tempo da senhora."',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_senhora_concluido' },
          ],
        },
      ],
    },

    s2e_confianca: {
      id: 's2e_confianca',
      mood: 'neutral',
      text: '*(Ri baixinho, sem humor)* Porque eu sou velha e cansada de ver essa cidade sofrer sozinha. *(Pausa)* Entra. Pelos fundos.',
      choices: [
        {
          id: 's2ec2_entrar',
          text: 'Ir para a porta dos fundos.',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa' }],
        },
      ],
    },

    s2_pressao: {
      id: 's2_pressao',
      mood: 'angry',
      text: '*(Ela fecha os olhos por um segundo — não de medo, de raiva controlada)* Sabe de alguma coisa, é... *(Fria)* Todo mundo ta assutado. Isso num quer dizer que seja da conta de gente metida a besta.',
      choices: [
        {
          id: 's2p_recuar',
          text: '"A senhora tem razão. Me desculpe a grosseria."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2_educado' }],
        },
        {
          id: 's2p_insistir',
          text: '"Então não vai me ajudar. Eu entendo. Mas quando piorar, vai lembrar disso."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora#s2p_reagiu' }],
        },
        {
          id: 's2p_sair',
          text: 'Sair sem dizer mais nada.',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_senhora_concluido' },
          ],
        },
      ],
    },

    s2p_reagiu: {
      id: 's2p_reagiu',
      mood: 'neutral',
      text: '*(Longa pausa. Ela te examina)* ...Você é teimoso. *(Suspira)* Entra pelos fundos. Mas faz isso mais uma vez e eu fecho a porta na sua cara.',
      choices: [
        {
          id: 's2pr_entrar',
          text: 'Ir para a porta dos fundos sem dizer nada.',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa' }],
        },
      ],
    },
  },
};

const DIALOGUE_SENHORA_CASA: ScenarioDialogue = {
  type: 'scenario_dialogue',
  id: 'nordeste_dialogo_senhora_casa',
  regionId: 'nordeste',
  backgroundImageSource: require('../../assets/scenario/nordeste/nordeste_dialogo_senhora_casa.png'),
  npcId: 'conceicao',
  npcName: 'Dona Conceição',
  npcRole: 'Moradora',
  initialLineId: 's3',
  lines: {
    s3: {
      id: 's3',
      mood: 'neutral',
      text: '*(Dentro, cheiro de vela e erva. Ela senta devagar)* Quando eu era menina, começou igualzinho. Sumiu uma criança... depois outra... *(Pausa longa)* Minha mãe me trancou dentro de casa por um mês inteiro.',
      choices: [
        {
          id: 's3_oque_era',
          text: '"O que era? A senhora sabe o nome?"',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s3_nome' },
            { type: 'add_clue', clueId: 'cabra_crianca' },
          ],
        },
        {
          id: 's3_como_parou',
          text: '"Como parou da última vez?"',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s3_parou' },
            { type: 'add_clue', clueId: 'cabra_crianca' },
          ],
        },
        {
          id: 's3_voz',
          text: '"Ouvi que essa coisa imita voz de gente. É verdade?"',
          requiresClues: ['cabra_voz'],
          consequences: [
            { type: 'add_clue', clueId: 'cabra_crianca' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s3_voz' },
          ],
        },
        {
          id: 's3_criancas',
          text: '"Por que são sempre crianças? Adultos não são atacados?"',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s3_criancas' },
            { type: 'add_clue', clueId: 'cabra_criancas' },
          ],
        },
      ],
    },

    s3_nome: {
      id: 's3_nome',
      mood: 'scared',
      text: '*(Faz o sinal da cruz)* Cabra Cabriola. *(Quase num sussurro)* Coisa antiga do sertão. Vem quando menino perde o respeito, fica sem educação. *(Pausa)* Pega os mais malcriados primeiro.',
      choices: [
        {
          id: 's3n_como_para',
          text: '"Como se para ela?"',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_nome' },
            { type: 'add_clue', clueId: 'cabra_criancas_mal_educadas' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s4' },
          ],
        },
        {
          id: 's3n_mais',
          text: '"A senhora a viu? Como é ela?"',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_nome' },
            { type: 'add_clue', clueId: 'cabra_criancas_mal_educadas' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s3_nome_b' },
          ],
        },
      ],
    },

    s3_nome_b: {
      id: 's3_nome_b',
      mood: 'scared',
      text: '*(Enrijece)* Eu não vi. Graças a Deus. *(Baixa os olhos)* Mas minha mãe viu uma vez. Falava de chifres grandes, dentes demais, tamanho de boi. *(Pausa)* E o cheiro. Nunca esqueceu o cheiro.',
      choices: [
        {
          id: 's3nb_para',
          text: '"Como se para ela?"',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s4' },
            { type: 'add_clue', clueId: 'cabra_nome' },
            { type: 'add_clue', clueId: 'cabra_cheiro' },
          ],
        },
      ],
    },

    s3_parou: {
      id: 's3_parou',
      mood: 'neutral',
      text: 'Minha mãe sabia a reza. Aprendeu com a mãe dela. *(Pausa)* É preciso muita coragem para ficar na frente do bicho e rezar. Ela rezou na praça até o amanhecer. De manhã o cheiro tinha sumido. Nunca mais voltou... Até agora.',
      choices: [
        {
          id: 's3p_reza',
          text: '"A senhora sabe essa reza?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s4' }],
        },
        {
          id: 's3p_nome',
          text: '"Essa criatura tem nome?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s3_nome' }],
        },
        {
          id: 's3p_voz',
          text: '"Ela imita vozes?"',
          requiresClues: ['cabra_voz'],
          consequences: [
            { type: 'add_clue', clueId: 'cabra_voz' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s3_voz' },
          ],
        },
      ],
    },

    s3_voz: {
      id: 's3_voz',
      mood: 'scared',
      text: '*(Se persigna)* É verdade sim. Imita direitinho — voz de mãe, de pai, até de quem já morreu. Minha comadre perdeu o filho assim. Abriu a porta achando que era o pai. O homem tava longe da cidade naquele dia. *(Firme)* Nunca abre porta de noite pra voz que você não esperava ouvir.',
      choices: [
        {
          id: 's3v_reza',
          text: '"Como se protege dela?"',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s4' },
            { type: 'add_clue', clueId: 'cabra_noite' },
          ],
        },
        {
          id: 's3v_nome',
          text: '"Essa coisa tem nome?"',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s3_nome' },
            { type: 'add_clue', clueId: 'cabra_noite' },
          ],
        },
        {
          id: 's3v_noite',
          text: '"Ela só age de noite mesmo?"',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s3_noite' },
            { type: 'add_clue', clueId: 'cabra_noite' },
          ],
        },
      ],
    },

    s3_noite: {
      id: 's3_noite',
      mood: 'neutral',
      text: 'De noite sim. De dia some. Ninguém sabe pra onde. *(Pausa)* Isso não quer dizer que de dia você tá seguro.',
      choices: [
        {
          id: 's3n2_reza',
          text: '"Como se para ela, então?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s4' }],
        },
      ],
    },

    s3_criancas: {
      id: 's3_criancas',
      mood: 'scared',
      text: '*(Pausa longa)* Adulto num tá seguro... só num é o alvo principal. *(Olha pro canto)* Ela vem atrás de criança sem educação, sem obediência. *(Baixo)* Parece que o comportamento chama ela.',
      choices: [
        {
          id: 's3c_nome',
          text: '"Essa coisa tem nome?"',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_criancas_mal_educadas' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s3_nome' },
          ],
        },
        {
          id: 's3c_para',
          text: '"Como se para ela?"',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_criancas_mal_educadas' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s4' },
          ],
        },
      ],
    },

    s4: {
      id: 's4',
      mood: 'friendly',
      text: '*(Levanta devagar, vai até uma gaveta velha e tira um papel dobrado, amarelado)* Minha mãe deixou isso. *(Entrega com as duas mãos)* Faz o sinal da cruz três vezes e reza com fé. Ela num aguenta oração de verdade.',
      choices: [
        {
          id: 's4_aceitar',
          text: 'Receber o papel com cuidado.',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_reza' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s5' },
          ],
        },
      ],
    },

    s5: {
      id: 's5',
      mood: 'friendly',
      text: '*(Senta de novo, parecendo mais leve)* Ela vem de noite. De dia some. *(Olha firme)* Reza antes de sair. E num vá sozinho se puder evitar.',
      choices: [
        {
          id: 's5_garoto',
          text: '"Vi uma criança chorando no beco"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s5_garoto' }],
        },
        {
          id: 's5_raimundo',
          text: '"Vi um bar aberto, mas não tinha ninguém praticamente"',
          blockConditions: ['raimundo_indicacao'],
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_senhora_casa#s5_raimundo' },
          ],
        },
        {
          id: 's5_sozinho',
          text: '"Obrigado, minha Senhora."',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_senhora_concluido' },
          ],
        },
      ],
    },

    s5_garoto: {
      id: 's5_garoto',
      mood: 'neutral',
      text: '*(Assente)* Franciscleison... perdeu o amiguinho esses dias. Tá arrasado. *(Pausa)* Se for falar com ele, vá com jeito. *(Firme)* E mande ele pra casa antes da noite. Criança num tem que ver o que você vai ver.',
      choices: [
        {
          id: 's5g_obrigado',
          text: '"Palavra. Obrigado por tudo, minha Senhora."',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_senhora_concluido' },
          ],
        },
      ],
    },

    s5_raimundo: {
      id: 's5_raimundo',
      mood: 'neutral',
      text: '*(Ri discreto)* É o bar de Raimundo. *(Pausa)* Ele é bom homem. Vá falar com ele. Ele pode te ajudar a entender a cidade.',
      choices: [
        {
          id: 's5r_obrigado',
          text: '"Farei isso. Obrigado."',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_senhora_concluido' },
          ],
        },
      ],
    },
  },
};

const DIALOGUE_CRIANCA: ScenarioDialogue = {
  type: 'scenario_dialogue',
  id: 'nordeste_dialogo_crianca',
  regionId: 'nordeste',
  backgroundImageSource: require('../../assets/scenario/nordeste/nordeste_dialogo_crianca.png'),
  npcId: 'franciscleison',
  npcName: 'Franciscleison',
  npcRole: 'Criança da Cidade',
  initialLineId: 'j1',
  lines: {
    j1: {
      id: 'j1',
      mood: 'scared',
      text: '*(Recua, segurando o terço com força)* Ocê num é daqui não. *(Desconfiado)* Mainha disse pra num falar com estranho.',
      choices: [
        {
          id: 'j1_gentil',
          text: '"Pode ficar onde você está. Só quero conversar um pouco."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2' }],
        },
        {
          id: 'j1_terco',
          text: '"Esse terço que você está segurando é bonito. De quem é?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j1_terco' }],
        },
        {
          id: 'j1_cheiro',
          text: '"Esse cheiro aqui na cidade... você também sente?"',
          requiresClues: ['cabra_cheiro'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j1_cheiro' }],
        },
        {
          id: 'j1_assustar',
          text: '"Aqui não é lugar pra criança ficar sozinha num beco escuro."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j1_assustado' }],
        },
        {
          id: 'j1_ignorar',
          text: 'Deixar a criança em paz.',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_cidade' }],
        },
      ],
    },

    j1_terco: {
      id: 'j1_terco',
      mood: 'scared',
      text: '*(Olha pro terço)* É da minha vó. Ela disse que protege. *(Pausa curta)* Que nem sempre funciona.',
      choices: [
        {
          id: 'j1t_protege',
          text: '"Protege do quê?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2' }],
        },
        {
          id: 'j1t_vovo',
          text: '"Sua vó parece sábia."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2' }],
        },
      ],
    },

    j1_cheiro: {
      id: 'j1_cheiro',
      mood: 'scared',
      text: '*(Faz careta)* Fedor de bode... mas pior. *(Baixa a voz)* Aparece toda noite. Quando aparece, a gente sabe que ela tá perto.',
      choices: [
        {
          id: 'j1c_ela',
          text: '"Ela? Quem é ela?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2' }],
        },
        {
          id: 'j1c_noite',
          text: '"Toda noite... você não dorme então?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2' }],
        },
      ],
    },

    j1_assustado: {
      id: 'j1_assustado',
      mood: 'scared',
      text: '*(Olha pra rua nervoso)* Eu sei... mainha tá me chamando tem um tempo. Mas... *(Hesita)* Num consigo entrar em casa ainda.',
      choices: [
        {
          id: 'j1a_porque',
          text: '"Por quê? O que está te impedindo?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2' }],
        },
        {
          id: 'j1a_pedro',
          text: '"É por causa do seu amigo?"',
          requiresClues: ['cabra_amigo_sumiu'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2_pedro' }],
        },
      ],
    },

    j2: {
      id: 'j2',
      mood: 'scared',
      text: '*(Olha pro terço)* Ocê veio por causa do Pedro?',
      choices: [
        {
          id: 'j2_quem',
          text: '"Quem é Pedro?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2_pedro_info' }],
        },
        {
          id: 'j2_sim',
          text: '"Me conta sobre o Pedro."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2_pedro' }],
        },
        {
          id: 'j2_nao',
          text: '"Não sei quem é Pedro. Só quero entender o que está acontecendo aqui."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2_cidade' }],
        },
      ],
    },

    j2_pedro_info: {
      id: 'j2_pedro_info',
      mood: 'sad',
      text: "*(Os olhos enchem d'água)* Meu melhor amigo... sumiu faz três dias. Os adulto fala que ele fugiu de casa. *(Balança a cabeça)* Pedro num fugiria não. Ele morria de medo do escuro.",
      choices: [
        {
          id: 'j2pi_acreditar',
          text: '"Eu acredito em você. O que você acha que aconteceu com ele?"',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_amigo_sumiu' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j3' },
          ],
        },
        {
          id: 'j2pi_pressionar',
          text: '"Fuga ou não, você sabe de alguma coisa. Pode falar."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2_pressao' }],
        },
      ],
    },

    j2_pedro: {
      id: 'j2_pedro',
      mood: 'sad',
      text: '*(Baixa os olhos)* Pedro sumiu. Saiu de noite atrás de uma voz. *(Pausa)* A mãe dele não tinha voltado.',
      choices: [
        {
          id: 'j2p_voz',
          text: '"Uma voz que imitava a mãe dele... Você já ouviu isso antes?"',
          requiresClues: ['cabra_voz'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j3_sabe_voz' }],
        },
        {
          id: 'j2p_continuar',
          text: '"Que horas era?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j3' }],
        },
      ],
    },

    j2_cidade: {
      id: 'j2_cidade',
      mood: 'suspicious',
      text: '*(Te olha com desconfiança renovada)* Num sabe do Pedro mas quer entender o que acontece... *(Torce a boca)* Estranho isso.',
      choices: [
        {
          id: 'j2c_explicar',
          text: '"Cheguei hoje. Vi que a cidade está quieta demais. Me conta o que aconteceu."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2_pedro_info' }],
        },
        {
          id: 'j2c_cheiro',
          text: '"Esse cheiro na cidade. Toda noite. O que é?"',
          requiresClues: ['cabra_cheiro'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2_pedro_info' }],
        },
      ],
    },

    j2_pressao: {
      id: 'j2_pressao',
      mood: 'scared',
      text: '*(Ele recua)* Eu num sei de nada não! *(Voz embargada)* Deixa eu em paz.',
      choices: [
        {
          id: 'j2pr_recuar',
          text: '"Me desculpe. Fui longe demais. Eu fico quieto."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j2' }],
        },
        {
          id: 'j2pr_sair',
          text: 'Deixar a criança em paz.',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_cidade' },
            { type: 'add_condition', condition: 'dialogo_crianca_concluido' },
          ],
        },
      ],
    },

    j3: {
      id: 'j3',
      mood: 'scared',
      text: '*(Baixinho)* Eu vi ele aqui... ele tava estranho... como se tivesse escutando alguma coisa. Aí saiu correndo dizendo que a mãe dele tava chamando...',
      choices: [
        {
          id: 'j3_voz',
          text: '"Uma voz que imitava a mãe dele... Você já ouviu falar disso?"',
          requiresClues: ['cabra_voz'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j3_sabe_voz' }],
        },
        {
          id: 'j3_cheiro',
          text: '"Quando ele saiu, tinha aquele cheiro no ar?"',
          requiresClues: ['cabra_cheiro'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j3_cheiro' }],
        },
        {
          id: 'j3_noite',
          text: '"Que horas era?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j3_noite' }],
        },
        {
          id: 'j3_avisa',
          text: '"Você precisa ficar em casa de noite. Não abre porta pra ninguém."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j3_aviso' }],
        },
        {
          id: 'j3_vovo',
          text: '"Sua vó sabia algo sobre isso?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j3_vovo' }],
        },
      ],
    },

    j3_sabe_voz: {
      id: 'j3_sabe_voz',
      mood: 'scared',
      text: '*(Os olhos arregalam)* Minha vó falava disso... uma coisa que imita voz pra pegar criança... *(Olha pro chão)* Mas Pedro num era malcriado não...',
      choices: [
        {
          id: 'j3sv_malcriado',
          text: '"Como assim malcriado? O que sua vó dizia?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j3_malcriado' }],
        },
        {
          id: 'j3sv_ajuda',
          text: '"Preciso da sua ajuda pra entender essa criatura."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_difícil' }],
        },
      ],
    },

    j3_malcriado: {
      id: 'j3_malcriado',
      mood: 'scared',
      text: 'Ela dizia que vinha atrás de criança sem obediência, sem respeito com os mais velho. *(Pausa)* Pedro era teimoso às vezes... mas num era ruim de verdade.',
      choices: [
        {
          id: 'j3m_criancas',
          text: '"Então ela escolhe as crianças que desobedecem?"',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_criancas_mal_educadas' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_decisao' },
          ],
        },
      ],
    },

    j3_cheiro: {
      id: 'j3_cheiro',
      mood: 'scared',
      text: 'Tinha... fedor danado de bode. Mas pior. *(Faz careta)* Eu quase vomitei.',
      choices: [
        {
          id: 'j3c_noite',
          text: '"Que horas era?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j3_noite' }],
        },
      ],
    },

    j3_noite: {
      id: 'j3_noite',
      mood: 'scared',
      text: 'Era quase meia-noite. *(Baixa a voz ao máximo)* Minha vó dizia que ela só aparece de noite. De dia some... ninguém sabe pra onde. *(Para)* Só sei que de dia a gente fica assustado e de noite fica com pavor.',
      choices: [
        {
          id: 'j3n_continua',
          text: '"De noite o que acontece exatamente?"',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_noite' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_decisao' },
          ],
        },
      ],
    },

    j3_vovo: {
      id: 'j3_vovo',
      mood: 'neutral',
      text: 'Minha vó sabia muita coisa... *(Hesita)* Ela dizia que a criatura num gosta de criança que obedece. Que prefere as danadas, as mal-educadas. *(Olha pro terço)* Pedro às vezes era teimoso...',
      choices: [
        {
          id: 'j3v_malcriado',
          text: '"E você? Você é malcriado?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j3_sobre_si' }],
        },
        {
          id: 'j3v_continua',
          text: '"O que mais sua vó dizia?"',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_criancas_mal_educadas' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_decisao' },
          ],
        },
      ],
    },

    j3_sobre_si: {
      id: 'j3_sobre_si',
      mood: 'neutral',
      text: '*(Hesita muito antes de responder)* ...Às vezes. *(Olha pra baixo)* Esses dias eu tava sendo meio ruim com o Pedro. Discutimo antes dele sumir. *(Baixo)* Num parei de pensar nisso.',
      choices: [
        {
          id: 'j3ss_culpa',
          text: '"Isso não é culpa sua. Mas precisa tomar cuidado agora."',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_criancas_mal_educadas' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_decisao' },
          ],
        },
      ],
    },

    j3_aviso: {
      id: 'j3_aviso',
      mood: 'neutral',
      text: '*(Assente devagar)* Eu sei. Mainha falou a mesma coisa. *(Olha pra você)* Mas e o Pedro? Alguém vai achar ele?',
      choices: [
        {
          id: 'j3av_eu_vou',
          text: '"Vou tentar. Mas preciso que você me ajude de um jeito."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_difícil' }],
        },
        {
          id: 'j3av_eu_tento',
          text: '"Vou fazer o possível. Mas você precisa ficar em casa."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_missao' }],
        },
      ],
    },

    j4_decisao: {
      id: 'j4_decisao',
      mood: 'neutral',
      text: 'De noite ela ronda a cidade... *(Engole seco)* Eu queria ajudar o Pedro. Mas mainha me mata se eu sair.',
      choices: [
        {
          id: 'j4d_jeito',
          text: '"Você pode ajudar sem sair de casa."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_missao' }],
        },
        {
          id: 'j4d_fique',
          text: '"Então fique em casa. Eu cuido disso."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_missao' }],
        },
        {
          id: 'j4d_mais',
          text: '"Me conta mais sobre o que sua vó dizia."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_vovo_extra' }],
        },
      ],
    },

    // Caminho mais difícil para conseguir a ajuda
    j4_difícil: {
      id: 'j4_difícil',
      mood: 'suspicious',
      text: '*(Ele cruza os braços — gesto muito adulto num rosto de criança)* Como é que eu posso ajudar? Sou criança.',
      choices: [
        {
          id: 'j4df_malcriado',
          text: '"Você é malcriado com seus pais às vezes?"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_teste' }],
        },
        {
          id: 'j4df_explicar',
          text: '"Preciso que você fique em casa e não abra pra ninguém."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_missao' }],
        },
        {
          id: 'j4df_desistir',
          text: '"Deixa quieto, eu cuido disso."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_cidade' }],
        },
      ],
    },

    j4_teste: {
      id: 'j4_teste',
      mood: 'suspicious',
      text: '*(Franzido de testa)* Por que tá me perguntando isso? *(Desconfiado)* O que tem a ver?',
      choices: [
        {
          id: 'j4t_explicar',
          text: '"A criatura escolhe crianças que desobedecem. Se você for obediente, ela perde interesse."',
          requiresClues: ['cabra_criancas_mal_educadas'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_entendeu' }],
        },
        {
          id: 'j4t_curiosidade',
          text: '"Só curiosidade. Esqueça."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j6_final' }],
        },
      ],
    },

    j4_entendeu: {
      id: 'j4_entendeu',
      mood: 'scared',
      text: '*(Os olhos arregalaram)* Ela escolhe as malcriadas... *(Engole seco)* Esses dias eu tava sendo ruim com mainha. Gritei com ela por nada. *(Olha pro chão)* E briguei com o Pedro antes dele sumir.',
      choices: [
        {
          id: 'j4e_culpa',
          text: '"Isso não é culpa sua. Mas agora você pode ajudar."',
          consequences: [
            { type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_plano_dificil' },
          ],
        },
      ],
    },

    j4_plano_dificil: {
      id: 'j4_plano_dificil',
      mood: 'neutral',
      text: '*(Olha firme pra você, com mais seriedade do que deveria ser possível para a idade dele)* O que eu tenho que fazer?',
      choices: [
        {
          id: 'j4pd_plano',
          text: '"Vai pra casa, desobedeça sua mãe em algo. E não abre a porta pra ninguém, nem pra voz de quem você conhece."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j5_plano' }],
        },
      ],
    },

    j4_vovo_extra: {
      id: 'j4_vovo_extra',
      mood: 'neutral',
      text: '*(Pensa)* Ela dizia que a criatura faz a caatinga ficar confusa de noite... pra prender quem vai atrás dela. *(Pausa)* E que de dia ela fica quieta, mas não some de verdade. Fica esperando.',
      choices: [
        {
          id: 'j4ve_obrigado',
          text: '"Isso me ajuda muito. Obrigado."',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j4_missao' }],
        },
      ],
    },

    j4_missao: {
      id: 'j4_missao',
      mood: 'neutral',
      text: 'Como eu ajudo ficando em casa?',
      choices: [
        {
          id: 'j4m_explicar',
          text: '"Se você sair, ela vai atrás de você primeiro, fique em casa que eu fico de olho"',
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j5_plano' }],
        },
        {
          id: 'j4m_malcriado',
          text: '"Ela vai atrás de criança malcriada. Faça alguma malcriação e fique em casa"',
          requiresClues: ['cabra_criancas_mal_educadas'],
          consequences: [{ type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j5_plano_extra' }],
        },
      ],
    },

    j5_plano: {
      id: 'j5_plano',
      mood: 'friendly',
      text: '*(Olha firme)* Tá certo... mas você promete que vai achar o Pedro? *(Pausa)* E se eu ouvir uma voz me chamando lá fora à noite, num é você, né?',
      choices: [
        {
          id: 'j5p_jurar',
          text: '"Não vou te chamar de noite. Se ouvir qualquer voz — não importa de quem — não abre."',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_amigo_sumiu' },
            { type: 'add_clue', clueId: 'cabra_criancas' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j6_final' },
          ],
        },
      ],
    },

    j5_plano_extra: {
      id: 'j5_plano_extra',
      mood: 'scared',
      text: '*(Engole seco)* Ela vai atrás de malcriado... *(Quase pra si mesmo)* Tudo bem vou fazer isso',
      choices: [
        {
          id: 'j5pe_confirmar',
          text: '"E não abre a porta pra ninguém, mesmo que seja uma voz que você reconheça."',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_amigo_sumiu' },
            { type: 'add_clue', clueId: 'cabra_criancas' },
            { type: 'add_condition', condition: 'ajuda_franciscleison' },
            { type: 'navigate', sceneId: 'nordeste_dialogo_crianca#j6_final' },
          ],
        },
      ],
    },

    j6_final: {
      id: 'j6_final',
      mood: 'friendly',
      text: '*(Estende o terço de madeira)* Fica com isso. Minha vó disse que protege. Você tá indo lá fora.',
      choices: [
        {
          id: 'j6f_aceitar',
          text: 'Receber o terço e agradecer.',
          consequences: [
            { type: 'add_clue', clueId: 'cabra_voz' },
            { type: 'add_condition', condition: 'ajuda_franciscleison' },
            { type: 'add_condition', condition: 'dialogo_crianca_concluido' },
            { type: 'navigate', sceneId: 'nordeste_cidade' },
          ],
        },
        {
          id: 'j6f_recusar',
          text: '"Guarda o seu. Você pode precisar mais."',
          consequences: [
            { type: 'add_condition', condition: 'ajuda_franciscleison' },
            { type: 'add_condition', condition: 'dialogo_crianca_concluido' },
            { type: 'navigate', sceneId: 'nordeste_cidade' },
          ],
        },
      ],
    },
  },
};

export const NORDESTE_SCENES: Record<string, Scene> = {
  nordeste_entrada: SCENE_ENTRADA,
  nordeste_cidade: SCENE_CIDADE,
  nordeste_caatinga_dia: SCENE_CAATINGA_DIA,
  nordeste_caatinga_dia_2: SCENE_CAATINGA_DIA_2,
  nordeste_caatinga_dia_3: SCENE_CAATINGA_DIA_3,
  nordeste_caatinga_dia_4: SCENE_CAATINGA_DIA_4,
  nordeste_caatinga_confusao: SCENE_CAATINGA_CONFUSAO,
  nordeste_caatinga_fuga_reza: SCENE_CAATINGA_FUGA_REZA,
  nordeste_caatinga_pego: SCENE_CAATINGA_PEGO,
  nordeste_confronto_noite: SCENE_CONFRONTO_NOITE,
  nordeste_confronto_solo: SCENE_CONFRONTO_SOLO,
  nordeste_confronto_solo_game_over: SCENE_CONFRONTO_SOLO_GAME_OVER,
  nordeste_confronto_noite_game_over1: SCENE_CONFRONTO_NOITE_GAME_OVER1,
  nordeste_confronto_noite_game_over2: SCENE_CONFRONTO_NOITE_GAME_OVER2,
  nordeste_catalogar_inicio: SCENE_CATALOGAR_INICIO,
  nordeste_catalogar: SCENE_CATALOGAR,
  nordeste_cidade_game_over: SCENE_CIDADE_GAME_OVER,
  nordeste_dialogo_raimundo: DIALOGUE_RAIMUNDO,
  nordeste_dialogo_senhora: DIALOGUE_SENHORA,
  nordeste_dialogo_senhora_casa: DIALOGUE_SENHORA_CASA,
  nordeste_dialogo_crianca: DIALOGUE_CRIANCA,
};
