import { ScenarioScene, ScenarioDialogue, Clue, Scene } from "../../types/narrative"

// ─── Pistas ───────────────────────────────────────────────────────────────────
export const NORDESTE_CLUES: Record<string, Clue> = {
    cabra_noite: {
        id: "cabra_noite",
        regionId: "nordeste",
        title: "Criatura Noturna",
        description: "Seja lá o que for, age apenas à noite. De dia some sem deixar rastros visíveis.",
        icon: "🌕",
    },
    cabra_criancas: {
        id: "cabra_criancas",
        regionId: "nordeste",
        title: "Alvo: Crianças",
        description: "A criatura parece caçar crianças. Adultos não são atacados — apenas as crianças somem.",
        icon: "👧",
    },
    cabra_criancas_mal_educadas: {
        id: "cabra_criancas_mal_educadas",
        regionId: "nordeste",
        title: "Crianças Desobedientes",
        description: "Segundo os mais velhos, a criatura parece escolher as crianças mais malcriadas e desobedientes.",
        icon: "👦",
    },
    cabra_cheiro: {
        id: "cabra_cheiro",
        regionId: "nordeste",
        title: "Odor Inconfundível",
        description: "Um cheiro forte e podre precede a criatura. Como enxofre misturado com bode velho.",
        icon: "💨",
    },
    cabra_voz: {
        id: "cabra_voz",
        regionId: "nordeste",
        title: "A Voz Enganosa",
        description: "Imita vozes de pessoas conhecidas para fazer crianças saírem ou abrirem a porta.",
        icon: "🗣️",
    },
    cabra_reza: {
        id: "cabra_reza",
        regionId: "nordeste",
        title: "Fraqueza: Oração",
        description: "Uma reza antiga afasta a criatura. Dona Conceição conhece as palavras.",
        icon: "🙏",
    },
    cabra_amigo_sumiu: {
        id: "cabra_amigo_sumiu",
        regionId: "nordeste",
        title: "Criança Desaparecida",
        description: "Pedro, amigo de Franciscleison, sumiu há três dias. Saiu de noite, atrás de uma voz.",
        icon: "❓",
    },
    cabra_rastros: {
        id: "cabra_rastros",
        regionId: "nordeste",
        title: "Rastros Estranhos",
        description: "Pegadas que não são de nenhum animal conhecido. Grandes, com cascos bifurcados.",
        icon: "🐾",
    },
    cabra_nome: {
        id: "cabra_nome",
        regionId: "nordeste",
        title: "Cabra Cabriola",
        description: "Dona Conceição revelou o nome: Cabra Cabriola. Uma entidade antiga do sertão.",
        icon: "🐐",
    },
}

// ─── CENAS ────────────────────────────────────────────────────────────────────

// CENA 1 — Entrada da cidade
const SCENE_ENTRADA: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_entrada",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_entrada.png"),
    narrativeText:
        "O sol de rachar castiga o sertão enquanto você avista Sobradinho — uma cidadezinha que parece ter esquecido de existir. Nem sombra de criança na praça empoeirada. As janelas estão fechadas e trancadas em plena tarde. Um cão magro late uma vez e desaparece entre as casas. No ar, um cheiro estranho que você não consegue identificar. Algo está errado aqui.",
    question: "O que você decide fazer?",
    choices: [
        {
            id: "entrar_bar",
            text: "Entrar no único bar com luz acesa",
            consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo" }],
        },
        {
            id: "explorar_cidade",
            text: "Passear pelas ruas primeiro",
            consequences: [{ type: "navigate", sceneId: "nordeste_cidade" }],
        },
        {
            id: "ir_caatinga",
            text: "Ir direto para a caatinga",
            consequences: [{ type: "navigate", sceneId: "nordeste_caatinga_dia" }],
        },
        {
            id: "ir_embora",
            text: "Esse lugar me dá mau presságio. Ir embora.",
            consequences: [{ type: "game_over", reason: "fled" }],
        },
    ],
}

// CENA 2 — Passeando pela cidade
const SCENE_CIDADE: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_cidade",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_cidade.png"),
    narrativeText:
        "As ruas de terra batida estão desertas. Portas trancadas com chave e ferrolho. As venezianas fechadas mesmo com o calor de rachar. No fim da rua principal, uma senhora idosa entreabre a persiana e te observa desconfiada antes de tentar fechá-la de volta. No beco do lado da farmácia, uma criança pequena aperta um terço de madeira nas mãos, os olhos vermelhos de choro recente.",
    question: "O que você faz?",
    choices: [
        {
            id: "falar_senhora",
            text: "Chamar a senhora da janela",
            consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora" }],
        },
        {
            id: "falar_crianca",
            text: "Aproximar da criança no beco",
            consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca" }],
        },
        {
            id: "voltar_entrada",
            text: "Voltar para a entrada da cidade",
            consequences: [{ type: "navigate", sceneId: "nordeste_entrada" }],
        },
    ],
}

// CENA 3 — Caatinga de dia (primeira vez)
const SCENE_CAATINGA_DIA: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_caatinga_dia",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_caatinga_dia.png"),
    narrativeText:
        "A caatinga é uma tela branca e silenciosa. Mandacarus retorcidos, galhos secos como dedos de osso. Você encontra rastros estranhos no chão ressecado — não são de nenhum animal que você conheça. Grandes, com marcas de casco bifurcado. O cheiro da cidade aqui é mais forte, mais concentrado. Um arrepio sobe pela sua espinha mesmo com o calor de quarenta graus.",
    question: "O que você faz?",
    choices: [
        {
            id: "examinar_rastros",
            text: "Examinar os rastros de perto",
            consequences: [
                { type: "add_clue", clueId: "cabra_rastros" },
                { type: "navigate", sceneId: "nordeste_caatinga_dia_2" },
            ],
        },
        {
            id: "seguir_cheiro",
            text: "Seguir o cheiro mais a fundo",
            consequences: [
                { type: "add_clue", clueId: "cabra_cheiro" },
                { type: "navigate", sceneId: "nordeste_caatinga_dia_2" },
            ],
        },
        {
            id: "voltar_caatinga_1",
            text: "Voltar para a cidade",
            consequences: [{ type: "navigate", sceneId: "nordeste_entrada" }],
        },
    ],
}

// CENA 4 — Caatinga de dia (segunda vez — algo está errado)
const SCENE_CAATINGA_DIA_2: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_caatinga_dia_2",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_caatinga_dia_2.png"),
    narrativeText:
        "Você foi mais fundo. Os rastros levam numa direção, depois dobram, depois somem. Você para. Olha em volta. Um mandacaru enorme à esquerda. Três pedras no caminho. Um galho retorcido em forma de Y na direita. Você jura que já passou por aqui. Os mesmos mandacarus. As mesmas pedras. O mesmo galho.",
    question: "Explorar mais ou retornar?",
    choices: [
        {
            id: "explorar_caatinga_2",
            text: "Explorar mais",
            consequences: [{ type: "navigate", sceneId: "nordeste_caatinga_dia_3" }],
        },
        {
            id: "retornar_caatinga_2",
            text: "Retornar",
            consequences: [{ type: "navigate", sceneId: "nordeste_entrada" }],
        },
    ],
}

// CENA 5 — Caatinga de dia (terceira vez — Não tem volta)
const SCENE_CAATINGA_DIA_3: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_caatinga_dia_3",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_caatinga_dia_2.png"),
    narrativeText:
        "Você muda a direção e tenta voltar por onde veio, mas o cenário se repete de novo. O mesmo mandacaru enorme à esquerda, as mesmas três pedras no caminho e o mesmo galho retorcido em Y. O silêncio pesa nos ouvidos. A sensação é clara: a caatinga está te prendendo em círculos.",
    question: "Explorar mais ou retornar?",
    choices: [
        {
            id: "explorar_caatinga_3",
            text: "Explorar mais",
            consequences: [{ type: "navigate", sceneId: "nordeste_caatinga_dia_4" }],
        },
        {
            id: "retornar_caatinga_3",
            text: "Retornar",
            consequences: [{ type: "navigate", sceneId: "nordeste_caatinga_dia_4" }],
        },
    ],
}

// Cena 6 - Caatinga de dia (quarta vez — Perdido)
const SCENE_CAATINGA_DIA_4: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_caatinga_dia_4",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_caatinga_dia_2.png"),
    narrativeText:
        "Você tenta escolher um caminho diferente, mas o cenário se repete de novo. O mesmo mandacaru enorme à esquerda, as mesmas três pedras no caminho e o mesmo galho retorcido em Y. O silêncio pesa nos ouvidos. A sensação é clara: a caatinga está te prendendo em círculos.",
    choices: [
        {
            id: "explorar_caatinga_3",
            text: "Explorar mais",
            consequences: [{ type: "navigate", sceneId: "nordeste_caatinga_confusao" }],
        },
        {
            id: "retornar_caatinga_3",
            text: "Retornar",
            consequences: [{ type: "navigate", sceneId: "nordeste_caatinga_confusao" }],
        },
    ],
}

// CENA 7 — Caatinga confusão (ultima vez — desorientação total)
const SCENE_CAATINGA_CONFUSAO: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_caatinga_confusao",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_caatinga_confusao.png"),
    narrativeText:
        "O mesmo mandacaru. As mesmas três pedras. O mesmo galho em Y. De novo. Você para e olha para o seu caderno — você anotou a hora que entrou na caatinga. Duas da tarde. Seu relógio marca oito e meia da noite. Você andou por seis horas e meia sem sair do lugar. O sol sumiu enquanto você não estava prestando atenção. Está escuro. O cheiro ficou insuportável. Dois olhos vermelhos piscam entre os mandacarus.",
    question: "Não tem saída.",
    choices: [
        {
            id: "tentar_sair",
            text: "Correr em qualquer direção",
            consequences: [{ type: "navigate", sceneId: "nordeste_caatinga_pego" }],
        },
        {
            id: "rezar_caatinga",
            text: "Rezar — a oração que a senhora ensinou",
            requiresClues: ["cabra_reza"],
            hidden: true,
            consequences: [{ type: "navigate", sceneId: "nordeste_caatinga_fuga_reza" }],
        },
    ],
}

// CENA 8a — Fuga pela reza na caatinga
const SCENE_CAATINGA_FUGA_REZA: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_caatinga_fuga_reza",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_caatinga_fuga_reza.jpg"),
    narrativeText:
        "Você fecha os olhos, respira fundo e começa a rezar. As palavras da Dona Conceição na sua cabeça. A voz sai trêmula, mas vai ficando mais firme. Os olhos vermelhos piscam. Recuam. Um guincho rasgado ecoa pela caatinga. De repente você reconhece onde está — a entrada da caatinga, a duzentos metros da cidade. Você corre sem olhar pra trás.",
    question: "",
    choices: [
        {
            id: "fuga_reza_voltar",
            text: "Correr de volta para a cidade",
            consequences: [
                { type: "add_clue", clueId: "cabra_noite" },
                { type: "navigate", sceneId: "nordeste_cidade" },
            ],
        },
    ],
}

// CENA 8b — Game over na caatinga
const SCENE_CAATINGA_PEGO: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_caatinga_pego",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_caatinga_pego.png"),
    narrativeText:
        "Você corre. Os mandacarus passam por você como sombras idênticas. Esquerda. Direita. Em frente. O mesmo mandacaru. As mesmas pedras. O mesmo galho. O cheiro envolve você como uma névoa. Os olhos vermelhos estão em toda parte agora. Uma risada baixa, gutural, como de animal — mas com algo humano demais. Você entendeu tarde demais. Ela não estava te perseguindo. Ela estava te esperando.",
    question: "",
    choices: [
        {
            id: "caatinga_game_over",
            text: "...",
            consequences: [{ type: "game_over", reason: "caught" }],
        },
    ],
}

// CENA 9a — Confronto final (à noite, com ajuda do Franciscleison)
const SCENE_CONFRONTO_NOITE: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_confronto_noite",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_confronto_noite.png"),
    narrativeText:
        "Meia-noite. A cidade está muda. Você se esconde na sombra de uma casa, de onde consegue ver a porta de Franciscleison. Tudo está quieto demais. Então o cheiro vem. Forte. Podre. Errado. E a voz quebra o silêncio. Franciscleison... abre a porta, meu filho... É a voz da mãe dele. Do lado de dentro da casa, você vê um leve movimento pela fresta da janela. Ele está lá. Acordado. Esperando. A voz chama de novo — mais doce, mais próxima. Abre, meu filho... sou eu.",
    question: "A voz chama de novo. Franciscleison treme.",
    choices: [
        {
            id: "avisar_voz",
            text: "Sussurrar pra ele: é armadilha, não se mexa",
            requiresClues: ["cabra_voz"],
            consequences: [{ type: "navigate", sceneId: "nordeste_catalogar_inicio" }],
        },
        {
            id: "rezar_confronto",
            text: "Puxá-lo e começar a rezar alto",
            requiresClues: ["cabra_reza"],
            consequences: [{ type: "navigate", sceneId: "nordeste_catalogar_inicio" }],
        },
        {
            id: "hesitar_confronto",
            text: "Hesitar, sem saber o que fazer",
            consequences: [{ type: "game_over", reason: "caught" }],
        },
    ],
}

// CENA 9b — Confronto final sem o garoto (pistas da caatinga)
const SCENE_CONFRONTO_SOLO: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_confronto_solo",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_confronto_solo.png"),

    narrativeText:
        "Meia-noite. Você está só na praça escura. Os olhos vermelhos aparecem entre as sombras da praça. Uma voz — a sua própria voz — fala o seu nome. Ela está testando você.",
    question: "A voz te chama de novo. O que você faz?",
    choices: [
        {
            id: "rezar_solo",
            text: "Rezar a oração da Dona Conceição",
            requiresClues: ["cabra_reza", "cabra_noite", "cabra_rastros", "cabra_voz"],
            consequences: [{ type: "navigate", sceneId: "nordeste_catalogar_inicio" }],
        },
        {
            id: "nao_reza_solo",
            text: "Tentar enfrentar",
            consequences: [{ type: "game_over", reason: "caught" }],
        },
    ],
}

// CENA 10 — Início da catalogação (transição)
const SCENE_CATALOGAR_INICIO: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_catalogar_inicio",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_catalogar_inicio.png"),
    narrativeText:
        "A oração ecoa na praça empoeirada. Os olhos vermelhos piscam — uma, duas, três vezes — e recuam para a escuridão. Um guincho animal rasga a noite. Depois: silêncio. O cheiro começa a dissipar. Você ouve passos apressados se distanciando na caatinga. Ela foi embora. Você abre o bestiário com mãos trêmulas e começa a documentar tudo que aprendeu.",
    question: "",
    choices: [
        {
            id: "catalogar_confirmar",
            text: "Registrar a criatura no bestiário",
            consequences: [{ type: "navigate", sceneId: "nordeste_catalogar" }],
        },
    ],
}

// CENA 11 — Catalogação final
const SCENE_CATALOGAR: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_catalogar",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_catalogar.png"),
    narrativeText:
        "Cabra Cabriola — Nordeste do Brasil. Criatura noturna de grande porte, chifres curvos, dentes afiados. Age preferencialmente contra crianças desobedientes. Imita vozes humanas para atrair vítimas. Exala odor forte de enxofre e animal. Fraqueza confirmada: oração de proteção popular. Ao amanhecer, Sobradinho parece diferente. Uma janela aberta. Um riso de criança de dentro de uma casa. A cidade está acordando.",
    question: "",
    choices: [
        {
            id: "voltar_mapa",
            text: "Voltar ao mapa",
            consequences: [{ type: "game_over", reason: "catalogued" }],
        },
    ],
}

// CENA 12 — Game over: foi embora e voltou
const SCENE_CIDADE_GAME_OVER: ScenarioScene = {
    type: "scenario_scene",
    id: "nordeste_cidade_game_over",
    regionId: "nordeste",
    imageSource: require("../../assets/scenario/nordeste/nordeste_cidade_game_over.png"),
    narrativeText:
        "Você voltou para Sobradinho alguns dias depois. A praça está mais vazia do que antes — se é que isso era possível. Na porta do bar fechado com cadeado, uma única folha de papel amarelada está pregada com um prego enferrujado. Nela, sete nomes escritos a lápis. Nomes de criança. O último na lista: Franciscleison. ",
    question: "",
    choices: [
        {
            id: "game_over_final",
            text: "Fechar o bestiário",
            consequences: [{ type: "game_over", reason: "fled" }],
        },
    ],
}

// ─── DIÁLOGOS ─────────────────────────────────────────────────────────────────

// DIÁLOGO — Seu Raimundo
const DIALOGUE_RAIMUNDO: ScenarioDialogue = {
    type: "scenario_dialogue",
    id: "nordeste_dialogo_raimundo",
    regionId: "nordeste",
    backgroundImageSource: require("../../assets/scenario/nordeste/nordeste_dialogo_raimundo.png"),
    npcId: "raimundo",
    npcName: "Seu Raimundo",
    npcRole: "Dono do Bar",
    initialLineId: "r1",
    lines: {
        r1: {
            id: "r1",
            mood: "suspicious",
            text: "Bar tá fechado, moço. Tá vendo a placa ali. *(Ele esfrega o balcão com um pano encardido, sem nem olhar pra você)*",
            choices: [
                {
                    id: "r1_insistir",
                    text: '"Não vim beber. Vim perguntar sobre os desaparecimentos."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r2_desconfiado" }],
                },
                {
                    id: "r1_investigador",
                    text: '"Sou investigador. Estou aqui sobre as crianças que sumiram."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r2_aberto" }],
                },
                {
                    id: "r1_cheiro",
                    text: '"Tem um cheiro estranho nessa cidade. Sabe me dizer o que é?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r2_cheiro" }],
                },
                {
                    id: "r1_sair",
                    text: "Sair sem dizer nada.",
                    consequences: [{ type: "navigate", sceneId: "nordeste_entrada" }],
                },
            ],
        },

        // Rota pelo cheiro
        r2_cheiro: {
            id: "r2_cheiro",
            mood: "suspicious",
            text: "*(Ele para. Olha pro balcão. Demora um tempo longo antes de responder)* Cheiro. *(Bufou)* Todo mundo sentiu. Ninguém fala. Prefeitura diz que é alguma coisa no rio. Mentira. O rio tá seco faz três anos.",
            choices: [
                {
                    id: "r2c_criancas",
                    text: '"E as crianças que sumiram? Também é o rio?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r3" }],
                },
                {
                    id: "r2c_oque_acha",
                    text: '"O que você acha que é, então?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r3" }],
                },
            ],
        },

        // Rota desconfiada — mais difícil
        r2_desconfiado: {
            id: "r2_desconfiado",
            mood: "suspicious",
            text: "*(Ele levanta o olho, te medindo)* Desaparecimento... *(Ri sem graça)* Prefeitura diz que é fuga. Família diz que é tragédia. Eu digo que... *(para)* ...deixa isso pra lá. O que é que ocê quer saber?",
            choices: [
                {
                    id: "r2d_oque_aconteceu",
                    text: '"O que você chama? Pode falar."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r3" }],
                },
                {
                    id: "r2d_quantas",
                    text: '"Quantas crianças sumiram?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r2b_quantas" }],
                },
            ],
        },

        r2b_quantas: {
            id: "r2b_quantas",
            mood: "neutral",
            text: "Três em dez dia. *(Larga o pano)* O último foi o menino do Severino, lá do açude. O bichinho saiu de noite... disse que ouviu uma voz chamando. Nunca mais apareceu.",
            choices: [
                {
                    id: "r2bq_voz",
                    text: '"Uma voz? De quem?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r3" }],
                },
                {
                    id: "r2bq_criatura",
                    text: '"Você acha que tem alguma coisa por trás disso?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r3" }],
                },
            ],
        },

        // Rota aberta — investigador, mais fácil
        r2_aberto: {
            id: "r2_aberto",
            mood: "neutral",
            text: "*(Ele para de esfregar o balcão e olha pra você pela primeira vez de verdade)* Investigador. *(Examina você)* Três crianças em dez dias. Prefeitura diz que fugiram de casa. *(Balança a cabeça lentamente)* Não fugiram, não.",
            choices: [
                {
                    id: "r2a_certeza",
                    text: '"Como você tem certeza?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r3" }],
                },
                {
                    id: "r2a_ouviu",
                    text: '"Você sabe o que aconteceu com elas?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r3" }],
                },
            ],
        },

        // Nó central — todos os caminhos chegam aqui
        r3: {
            id: "r3",
            mood: "scared",
            text: "*(Ele abaixa a voz e se inclina)* Meu avô contava uma história... de uma coisa que vinha de noite. Pegava menino que num obedecia. Imitava voz de gente de casa pra enganar. *(pausa)* Eu achava que era história pra meter medo em criança teimosa... mas agora...",
            choices: [
                {
                    id: "r3_criatura_qual",
                    text: '"Que criatura? Você sabe o nome dela?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r3_nome" }],
                },
                {
                    id: "r3_como_para",
                    text: '"Tem como parar essa coisa?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r4" }],
                },
                {
                    id: "r3_acredita",
                    text: '"Você acredita que é uma criatura?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r3_acredita" }],
                },
            ],
        },

        r3_nome: {
            id: "r3_nome",
            mood: "scared",
            text: "*(Ele balança a cabeça)* Meu avô nunca disse o nome. Dizia que falar o nome chamava. Só uma pessoa aqui pode saber de verdade — Dona Conceição, lá na outra rua. Ela é a mais velha da cidade. Viveu a última vez que isso aconteceu, ainda criança.",
            choices: [
                {
                    id: "r3n_conceicao",
                    text: '"Preciso falar com essa Dona Conceição."',
                    consequences: [
                        { type: "add_clue", clueId: "cabra_criancas" },
                        { type: "navigate", sceneId: "nordeste_dialogo_raimundo#r4_conceicao" },
                    ],
                },
            ],
        },

        r3_acredita: {
            id: "r3_acredita",
            mood: "neutral",
            text: "*(Suspira pesado)* Eu num acreditava não... mas três menino sumir assim, sem rastro nenhum? E esse fedor toda noite... cheiro de bode podre... isso num é coisa de Deus não.",
            choices: [
                {
                    id: "r3a_continuar",
                    text: '"Tem alguém que sabe mais sobre isso aqui na cidade?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r4_conceicao" }],
                },
            ],
        },

        r4: {
            id: "r4",
            mood: "neutral",
            text: "*(Ele pensa por um momento)* Meu avô dizia que a reza afasta. Mas eu não sei reza nenhuma dessas antigas. Quem sabe é Dona Conceição — mais velha da cidade, viveu a última vez que isso aconteceu. Mas ela não abre a porta pra qualquer um, não.",
            choices: [
                {
                    id: "r4_como_convencer",
                    text: '"Como eu faço pra ela me receber?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r4_conceicao" }],
                },
            ],
        },

        r4_conceicao: {
            id: "r4_conceicao",
            mood: "friendly",
            text: "Chega com calma e fala que foi eu que mandei. Ela num abre a porta pra qualquer um não. *(Empurra um copo d'água para você)* E vá com jeito, visse? A véia é arisca. Se desconfiar, fecha na sua cara.",
            choices: [
                {
                    id: "r4c_obrigado",
                    text: '"Obrigado, Seu Raimundo. Vou falar com ela."',
                    consequences: [
                        { type: "add_clue", clueId: "cabra_noite" },
                        { type: "navigate", sceneId: "nordeste_cidade" },
                    ],
                },
            ],
        },

        r_irritado: {
            id: "r_irritado",
            mood: "angry",
            text: "Com medo?! *(Bate o pano no balcão com força)* Você não sabe de nada, não! Pode ir embora. Eu não tenho nada pra dizer pra forasteiro metido a besta!",
            choices: [
                {
                    id: "r_irritado_desculpa",
                    text: '"Desculpe. Fui sem educação. Não quis ofender."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r_desculpa" }],
                },
                {
                    id: "r_irritado_sair",
                    text: "Sair sem dizer mais nada.",
                    consequences: [{ type: "navigate", sceneId: "nordeste_entrada" }],
                },
            ],
        },

        r_desculpa: {
            id: "r_desculpa",
            mood: "suspicious",
            text: "*(Ele resmunga. Pega o pano de volta)* Tá bom. Mas sem gracinha *(Pausa)* O que você quer saber?",
            choices: [
                {
                    id: "rd_criancas",
                    text: '"O que aconteceu com as crianças?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_raimundo#r3" }],
                },
            ],
        },
    },
}

// DIÁLOGO — Dona Conceição
const DIALOGUE_SENHORA: ScenarioDialogue = {
    type: "scenario_dialogue",
    id: "nordeste_dialogo_senhora",
    regionId: "nordeste",
    backgroundImageSource: require("../../assets/scenario/nordeste/nordeste_dialogo_senhora.png"),
    npcId: "conceicao",
    npcName: "Dona Conceição",
    npcRole: "Moradora",
    initialLineId: "s1",
    lines: {
        s1: {
            id: "s1",
            mood: "suspicious",
            text: "*(Ela abre só um pedacinho da persiana)* Que foi, meu filho? Num tô comprando nada não.",
            choices: [
                {
                    id: "s1_raimundo",
                    text: '"Seu Raimundo do bar me mandou. Disse que a senhora podia me ajudar."',
                    requiresClues: ["cabra_noite"],
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2_raimundo" }],
                },
                {
                    id: "s1_investigador",
                    text: '"Sou investigador. Vim por causa das crianças que sumiram."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2_investigador" }],
                },
                {
                    id: "s1_direto",
                    text: '"Preciso saber sobre a criatura que está aqui."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2_direto" }],
                },
                {
                    id: "s1_vizinha",
                    text: '"Boa tarde, dona. Estou passando pela cidade e queria entender o que está acontecendo."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2_educado" }],
                },
            ],
        },

        // Mais fácil — veio indicado pelo Raimundo
        s2_raimundo: {
            id: "s2_raimundo",
            mood: "neutral",
            text: "*(Ela para... abre mais um pouco)* Raimundo mandou... *(Suspira)* Então ele já sabe que voltou... *(pausa)* Entra pelos fundo. Num é coisa de ficar falando assim na rua não.",
            choices: [
                {
                    id: "s2r_entrar",
                    text: "Ir para a porta dos fundos.",
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora_casa" }],
                },
            ],
        },

        // Médio — investigador sem indicação
        s2_investigador: {
            id: "s2_investigador",
            mood: "suspicious",
            text: "*(Ela te mede dos pé à cabeça)* Investigador? De onde, hein? Prefeitura num mandou ninguém não. *(Pausa)* Que tipo de investigador é ocê?",
            choices: [
                {
                    id: "s2i_particular",
                    text: '"Particular. Investigo casos assim — coisas que a prefeitura não quer olhar."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2i_continuar" }],
                },
                {
                    id: "s2i_raimundo",
                    text: '"Falei com Seu Raimundo. Ele me disse que a senhora poderia ajudar."',
                    requiresClues: ["cabra_noite"],
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2_raimundo" }],
                },
            ],
        },

        s2i_continuar: {
            id: "s2i_continuar",
            mood: "suspicious",
            text: "*(Ela fica olhando pra você um tempo)* ...Você tem cara de pessoa séria. *(Com cautela)* O que você já sabe?",
            choices: [
                {
                    id: "s2ic_cheiro",
                    text: '"Sei que tem um cheiro estranho na cidade e que crianças estão sumindo à noite."',
                    requiresClues: ["cabra_cheiro"],
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2i_impressionada" }],
                },
                {
                    id: "s2ic_rastros",
                    text: '"Encontrei rastros na caatinga. Não são de animal comum."',
                    requiresClues: ["cabra_rastros"],
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2i_impressionada" }],
                },
                {
                    id: "s2ic_pouco",
                    text: '"Ainda pouco. Por isso vim falar com a senhora."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2i_fechada" }],
                },
            ],
        },

        s2i_impressionada: {
            id: "s2i_impressionada",
            mood: "neutral",
            text: "*(Assente devagar)* Ocê pelo menos prestou atenção... *(Olha a rua)* Entra. Pelos fundo. Rápido.",
            choices: [
                {
                    id: "s2ii_entrar",
                    text: "Ir para a porta dos fundos.",
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora_casa" }],
                },
            ],
        },

        s2i_fechada: {
            id: "s2i_fechada",
            mood: "suspicious",
            text: "*(Ela balança a cabeça)* Então você não sabe de nada mesmo. *(Começa a fechar a persiana)* Não posso ajudar quem não foi atrás de nada. Vá perguntar por aí primeiro.",
            choices: [
                {
                    id: "s2if_insistir",
                    text: '"Por favor, dona. Crianças estão sumindo. Não tenho tempo."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2i_convencer" }],
                },
                {
                    id: "s2if_sair",
                    text: "Aceitar e se afastar.",
                    consequences: [{ type: "navigate", sceneId: "nordeste_cidade" }],
                },
            ],
        },

        s2i_convencer: {
            id: "s2i_convencer",
            mood: "scared",
            text: "*(Ela hesita. Olha pra rua por um longo momento)* ...Entre. Mas rápido. E não conta pra ninguém que você veio aqui.",
            choices: [
                {
                    id: "s2ic_entrar",
                    text: "Entrar pela porta dos fundos.",
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora_casa" }],
                },
            ],
        },

        // Difícil — abordagem direta, sem nada
        s2_direto: {
            id: "s2_direto",
            mood: "scared",
            text: "*(Ela se assusta e quase fecha)* Ôxe, homem! Num fala isso alto não! *(Sussurra)* Ela escuta... Vá simbora daqui. Num posso ajudar não.",
            choices: [
                {
                    id: "s2d_insistir_criancas",
                    text: '"Dona, crianças estão desaparecendo. Preciso de ajuda."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2d_resistir" }],
                },
                {
                    id: "s2d_sair",
                    text: "Pedir desculpa e se afastar.",
                    consequences: [{ type: "navigate", sceneId: "nordeste_cidade" }],
                },
            ],
        },

        s2d_resistir: {
            id: "s2d_resistir",
            mood: "scared",
            text: "*(Ela aperta os olhos, em conflito)* Eu sei que estão. *(Voz baixíssima)* Mas falar sobre isso chama. Quanto mais a gente comenta, mais ela fica por perto. É assim que funciona.",
            choices: [
                {
                    id: "s2dr_reza",
                    text: '"A senhora sabe como parar isso. Vi nos seus olhos."',
                    requiresClues: ["cabra_noite"],
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2d_cede" }],
                },
                {
                    id: "s2dr_respeitar",
                    text: '"Entendo. Vou buscar mais informação antes de voltar."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_cidade" }],
                },
            ],
        },

        s2d_cede: {
            id: "s2d_cede",
            mood: "neutral",
            text: "*(Longa pausa. Ela olha pra rua. Olha pra você)* ...Porta dos fundos. Mas você não foi aqui, tá bom?",
            choices: [
                {
                    id: "s2dc_entrar",
                    text: "Entrar pela porta dos fundos.",
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora_casa" }],
                },
            ],
        },

        // Abordagem educada
        s2_educado: {
            id: "s2_educado",
            mood: "neutral",
            text: "*(Ela te avalia)* Você tem mais jeito que a maioria que passa por aqui. *(Pausa)* O que você quer saber?",
            choices: [
                {
                    id: "s2e_criancas",
                    text: '"As crianças que sumiram. O que a senhora acha que aconteceu?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2e_criancas" }],
                },
                {
                    id: "s2e_cidade",
                    text: '"A cidade parece com medo de algo. Faz tempo que está assim?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2e_cidade" }],
                },
            ],
        },

        s2e_criancas: {
            id: "s2e_criancas",
            mood: "scared",
            text: "*(Ela fecha a persiana um pouco mais)* Eu tenho minhas suspeitas. Mas não é coisa que se fala assim, na janela, de tarde. *(Olha pra você)* Você é de confiança?",
            choices: [
                {
                    id: "s2ec_sim",
                    text: '"Sou. Só quero ajudar."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2_raimundo" }],
                },
            ],
        },

        s2e_cidade: {
            id: "s2e_cidade",
            mood: "neutral",
            text: "Dez dias. *(Seca)* Antes disso, a última vez foi quando eu tinha doze anos. *(Uma sombra passa pelo rosto dela)* Eu me lembro de tudo. *(Ela te olha diferente agora)* Você quer mesmo saber?",
            choices: [
                {
                    id: "s2ec2_sim",
                    text: '"Quero. A senhora parece ser a pessoa certa pra me contar."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora#s2_raimundo" }],
                },
            ],
        },

    },
}

// DIÁLOGO — Dona Conceição (dentro de casa)
const DIALOGUE_SENHORA_CASA: ScenarioDialogue = {
    type: "scenario_dialogue",
    id: "nordeste_dialogo_senhora_casa",
    regionId: "nordeste",
    backgroundImageSource: require("../../assets/scenario/nordeste/nordeste_dialogo_senhora_casa.png"),
    npcId: "conceicao",
    npcName: "Dona Conceição",
    npcRole: "Moradora",
    initialLineId: "s3",
    lines: {
        s3: {
            id: "s3",
            mood: "neutral",
            text: "*(Dentro da casa, cheiro de vela e erva. Ela senta devagar)* Quando eu era menina, começou igualzinho. Um sumiu... depois outro... depois mais dois. *(Pausa)* Minha mãe me trancou dentro de casa por um mês inteiro.",
            choices: [
                {
                    id: "s3_oque_era",
                    text: '"O que era? A senhora sabe o nome?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora_casa#s3_nome" }],
                },
                {
                    id: "s3_como_parou",
                    text: '"Como parou da última vez?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora_casa#s3_parou" }],
                },
                {
                    id: "s3_voz",
                    text: '"Ouvi que ela imita voz de gente. É verdade?"',
                    consequences: [
                        { type: "add_clue", clueId: "cabra_voz" },
                        { type: "navigate", sceneId: "nordeste_dialogo_senhora_casa#s3_voz" },
                    ],
                },
            ],
        },

        s3_nome: {
            id: "s3_nome",
            mood: "scared",
            text: "*(Faz o sinal da cruz)* Cabra Cabriola... *(quase num sussurro)* Foi assim que minha mãe chamava. Coisa antiga do sertão. Vem quando menino perde o respeito... pega os mais danado primeiro.",
            choices: [
                {
                    id: "s3n_como_para",
                    text: '"Como se para ela?"',
                    consequences: [
                        { type: "add_clue", clueId: "cabra_nome" },
                        { type: "add_clue", clueId: "cabra_criancas_mal_educadas" },
                        { type: "navigate", sceneId: "nordeste_dialogo_senhora_casa#s4" },
                    ],
                },
            ],
        },

        s3_parou: {
            id: "s3_parou",
            mood: "neutral",
            text: "Minha mãe sabia a reza. Aprendeu com a mãe dela, que viveu a vez anterior. *(Pausa)* Ela saiu uma noite, rezando em voz alta, e ficou na praça até o amanhecer. De manhã, o cheiro tinha sumido. Nunca mais voltou — até agora.",
            choices: [
                {
                    id: "s3p_reza",
                    text: '"A senhora sabe essa reza?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora_casa#s4" }],
                },
                {
                    id: "s3p_nome",
                    text: '"Essa criatura tem nome?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora_casa#s3_nome" }],
                },
            ],
        },

        s3_voz: {
            id: "s3_voz",
            mood: "scared",
            text: "*(Se persigna)* É verdade sim. Imita direitinho... voz de mãe, de pai... até de quem já morreu. Minha comadre perdeu o filho assim. Ele abriu a porta achando que era o pai... o homem tava longe da cidade.",
            choices: [
                {
                    id: "s3v_reza",
                    text: '"Como se protege dela?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora_casa#s4" }],
                },
                {
                    id: "s3v_nome",
                    text: '"Essa coisa tem nome?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_senhora_casa#s3_nome" }],
                },
            ],
        },

        s4: {
            id: "s4",
            mood: "friendly",
            text: "*(Vai até uma gaveta velha)* Minha mãe deixou isso aqui... *(Entrega o papel)* Faz o sinal da cruz e reza com fé. Ela num aguenta oração de verdade.",
            choices: [
                {
                    id: "s4_aceitar",
                    text: "Receber o papel com cuidado e agradecer.",
                    consequences: [
                        { type: "add_clue", clueId: "cabra_reza" },
                        { type: "navigate", sceneId: "nordeste_dialogo_senhora_casa#s5" },
                    ],
                },
            ],
        },

        s5: {
            id: "s5",
            mood: "friendly",
            text: "*(Senta novamente)* Ela vem de noite. De dia some que ninguém vê. *(Olha firme)* Reza antes de sair, visse? E num vá sozinho se puder evitar.",
            choices: [
                {
                    id: "s5_garoto",
                    text: '"Vi uma criança no beco. Posso tentar contar com ela?"',
                    consequences: [
                        { type: "add_clue", clueId: "cabra_noite" },
                        { type: "navigate", sceneId: "nordeste_dialogo_senhora_casa#s5_garoto" },
                    ],
                },
                {
                    id: "s5_sozinho",
                    text: '"Vou sozinho se precisar. Obrigado, Dona Conceição."',
                    consequences: [
                        { type: "add_clue", clueId: "cabra_noite" },
                        { type: "navigate", sceneId: "nordeste_cidade" },
                    ],
                },
            ],
        },

        s5_garoto: {
            id: "s5_garoto",
            mood: "neutral",
            text: "*(Ela assente devagar)* Franciscleison... perdeu o amiguinho esses dia. Tá todo tadinho. *(Pausa)* Se for falar com ele, vá com jeito. E mande ele pra casa cedo. Criança num tem que ver essas coisa não.",
            choices: [
                {
                    id: "s5g_obrigado",
                    text: '"Palavra. Obrigado por tudo, Dona Conceição."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_cidade" }],
                },
            ],
        },
    },
}

// DIÁLOGO — Franciscleison
const DIALOGUE_CRIANCA: ScenarioDialogue = {
    type: "scenario_dialogue",
    id: "nordeste_dialogo_crianca",
    regionId: "nordeste",
    backgroundImageSource: require("../../assets/scenario/nordeste/nordeste_dialogo_crianca.png"),
    npcId: "franciscleison",
    npcName: "Franciscleison",
    npcRole: "Criança da Cidade",
    initialLineId: "j1",
    lines: {
        j1: {
            id: "j1",
            mood: "scared",
            text: "*(Ele recua, segurando o terço)* Ocê num é daqui não... *(Desconfiado)* Mainha disse pra num falar com estranho.",
            choices: [
                {
                    id: "j1_gentil",
                    text: '"Tudo bem. Pode ficar onde você está. Só quero conversar um pouquinho."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j2" }],
                },
                {
                    id: "j1_direto",
                    text: '"Estou aqui pra ajudar. Você sabe o que está acontecendo com as crianças?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j1_direto" }],
                },
                {
                    id: "j1_ignorar",
                    text: "Deixar a criança em paz.",
                    consequences: [{ type: "navigate", sceneId: "nordeste_cidade" }],
                },
            ],
        },

        j1_direto: {
            id: "j1_direto",
            mood: "scared",
            text: "*(Ele recua mais)* Eu não sei de nada não. Vai embora.",
            choices: [
                {
                    id: "j1d_recuar",
                    text: '"Tudo bem. Fui sem jeito. Me desculpa, tá?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j2" }],
                },
                {
                    id: "j1d_sair",
                    text: "Deixar a criança em paz.",
                    consequences: [{ type: "navigate", sceneId: "nordeste_cidade" }],
                },
            ],
        },

        j2: {
            id: "j2",
            mood: "scared",
            text: "*(Olha pro terço)* Ocê veio por causa do Pedro?",
            choices: [
                {
                    id: "j2_pedro",
                    text: '"Pedro é seu amigo que sumiu?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j3" }],
                },
                {
                    id: "j2_quem_pedro",
                    text: '"Quem é Pedro?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j2_pedro_info" }],
                },
            ],
        },

        j2_pedro_info: {
            id: "j2_pedro_info",
            mood: "sad",
            text: "*(Os olho enchem d’água)* Meu melhor amigo... sumiu faz três dia. Os adulto fala que ele fugiu... mas Pedro num fugia não. Ele morria de medo do escuro.",
            choices: [
                {
                    id: "j2pi_acreditar",
                    text: '"Eu acredito em você. O que você acha que aconteceu?"',
                    consequences: [
                        { type: "add_clue", clueId: "cabra_amigo_sumiu" },
                        { type: "navigate", sceneId: "nordeste_dialogo_crianca#j3" },
                    ],
                },
            ],
        },

        j3: {
            id: "j3",
            mood: "scared",
            text: "*(Baixinho)* Eu vi ele aqui... ele tava estranho... como se tivesse escutando alguma coisa. Aí saiu correndo dizendo que a mãe dele tava chamando... *(pausa)* mas ela tava dentro de casa.",
            choices: [
                {
                    id: "j3_voz",
                    text: '"Uma voz que imitava a mãe dele... Você já ouviu falar disso antes?"',
                    requiresClues: ["cabra_voz"],
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j3_sabe_voz" }],
                },
                {
                    id: "j3_cheiro",
                    text: '"Quando ele saiu, tinha algum cheiro estranho no ar?"',
                    requiresClues: ["cabra_cheiro"],
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j3_cheiro" }],
                },
                {
                    id: "j3_noite",
                    text: '"Que horas era? De noite?"',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j3_noite" }],
                },
                {
                    id: "j3_avisa",
                    text: '"Você precisa ficar em casa de noite. Não abre porta pra ninguém."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j3_aviso" }],
                },
            ],
        },

        j3_sabe_voz: {
            id: "j3_sabe_voz",
            mood: "scared",
            text: "*(Assustado)* Minha vó falava disso... uma coisa que imita voz... pra enganar menino... *(Olha pro chão)* Mas Pedro num era ruim não...",
            choices: [
                {
                    id: "j3sv_ajuda",
                    text: '"Eu preciso da sua ajuda pra encontrar essa criatura."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j4_ajuda" }],
                },
                {
                    id: "j3sv_seguro",
                    text: '"Você precisa ficar em casa e seguro. Eu cuido disso."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j3_aviso" }],
                },
            ],
        },

        j3_cheiro: {
            id: "j3_cheiro",
            mood: "scared",
            text: "*(Faz careta)* Tinha um fedor danado... de bode... mas pior. Eu quase botei tudo pra fora.",
            choices: [
                {
                    id: "j3c_sim",
                    text: '"Senti. Desde que cheguei na cidade."',
                    consequences: [
                        { type: "add_clue", clueId: "cabra_criancas" },
                        { type: "navigate", sceneId: "nordeste_dialogo_crianca#j3_noite" },
                    ],
                },
            ],
        },

        j3_noite: {
            id: "j3_noite",
            mood: "scared",
            text: "Era quase meia-noite... *(Sussurra)* Minha vó dizia que ela só aparece de noite. De dia some... ninguém sabe pra onde.",
            choices: [
                {
                    id: "j3n_oque_noite",
                    text: '"De noite o que acontece?"',
                    consequences: [
                        { type: "add_clue", clueId: "cabra_noite" },
                        { type: "navigate", sceneId: "nordeste_dialogo_crianca#j4_decisao" },
                    ],
                },
            ],
        },

        j3_aviso: {
            id: "j3_aviso",
            mood: "neutral",
            text: "*(Ele assente devagar)* Eu sei. Minha mãe já falou isso. *(Ele te olha)* Mas e o Pedro? Alguém vai achar ele?",
            choices: [
                {
                    id: "j3av_eu_vou",
                    text: '"Eu vou achar. Mas preciso que você fique em casa e não abra a porta pra ninguém."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j4_missao" }],
                },
            ],
        },

        j4_decisao: {
            id: "j4_decisao",
            mood: "neutral",
            text: "De noite ela roda a cidade... *(Engole seco)* Eu queria ajudar o Pedro... mas mainha me mata se souber.",
            choices: [
                {
                    id: "j4d_ajuda",
                    text: '"Você pode me ajudar de um jeito que não precisa sair de casa."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j4_missao" }],
                },
                {
                    id: "j4d_fica_casa",
                    text: '"Fique em casa. Eu resolvo isso."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j4_missao" }],
                },
            ],
        },

        j4_ajuda: {
            id: "j4_ajuda",
            mood: "neutral",
            text: "*(Ele endireita as costas)* Como? Eu quero ajudar o Pedro.",
            choices: [
                {
                    id: "j4a_plano",
                    text: '"Você vai pra casa, tranca tudo e não abre a porta pra ninguém — nem pra voz de quem você conhece. Isso ajuda muito."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j5_plano" }],
                },
            ],
        },

        j4_missao: {
            id: "j4_missao",
            mood: "neutral",
            text: "Como eu ajudo ficando em casa?",
            choices: [
                {
                    id: "j4m_explicar",
                    text: '"Se você sair, ela vai atrás de você. Ficando em casa, eu fico livre pra agir sem me preocupar com você."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_dialogo_crianca#j5_plano" }],
                },
            ],
        },

        j5_plano: {
            id: "j5_plano",
            mood: "friendly",
            text: "*(Olha firme)* Tá certo... mas ocê promete que vai achar ele? *(Pausa)* E se eu ouvir uma voz me chamando... num é ocê, né?",
            choices: [
                {
                    id: "j5p_jurar",
                    text: '"Não vou te chamar de noite. Se ouvir uma voz — não importa de quem — não abre."',
                    consequences: [
                        { type: "add_clue", clueId: "cabra_amigo_sumiu" },
                        { type: "add_clue", clueId: "cabra_criancas" },
                        { type: "navigate", sceneId: "nordeste_dialogo_crianca#j6_final" },
                    ],
                },
            ],
        },

        j6_final: {
            id: "j6_final",
            mood: "friendly",
            text: "*(Entrega o terço)* Fica com isso... minha vó disse que protege. Ocê vai precisar.",
            choices: [
                {
                    id: "j6f_aceitar",
                    text: "Receber o terço e agradecer.",
                    consequences: [
                        { type: "add_clue", clueId: "cabra_voz" },
                        { type: "navigate", sceneId: "nordeste_cidade" },
                    ],
                },
                {
                    id: "j6f_recusar",
                    text: '"Guarda o seu. Você pode precisar mais."',
                    consequences: [{ type: "navigate", sceneId: "nordeste_cidade" }],
                },
            ],
        },
    },
}

// ─── Registro central ─────────────────────────────────────────────────────────
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
    nordeste_catalogar_inicio: SCENE_CATALOGAR_INICIO,
    nordeste_catalogar: SCENE_CATALOGAR,
    nordeste_cidade_game_over: SCENE_CIDADE_GAME_OVER,
    nordeste_dialogo_raimundo: DIALOGUE_RAIMUNDO,
    nordeste_dialogo_senhora: DIALOGUE_SENHORA,
    nordeste_dialogo_senhora_casa: DIALOGUE_SENHORA_CASA,
    nordeste_dialogo_crianca: DIALOGUE_CRIANCA,
}