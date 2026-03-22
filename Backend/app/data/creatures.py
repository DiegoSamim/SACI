# app/data/creatures.py

CREATURE_DATA = {
    "nordeste": {
        "id": "cabra_cabriola",
        "name": "Cabra Cabriola",
        "region": "Nordeste do Brasil",

        "confirmed_facts": [
            "Age exclusivamente à noite",
            "Some completamente de dia",
            "Emite cheiro forte de enxofre misturado com bode",
            "Imita com perfeição vozes de pessoas conhecidas",
            "Prefere crianças malcriadas e desobedientes",
            "Grande porte — chifres, dentes afiados, garras",
            "Pode desorientar o ambiente na caatinga",
            "É afastada por oração",
        ],

        # Mapeamento completo de pistas
        # exclusive_to_npc: None = qualquer NPC pode revelar
        # exclusive_to_npc: ["npc_id"] = apenas esses NPCs podem revelar
        "clues_mapping": {
            "cabra_noite": {
                "description": "Age apenas à noite",
                "exclusive_to_npc": None,  # Raimundo, Conceição, Franciscleison, caatinga
                "keywords": [
                    "noite", "noturna", "escuro", "anoitecer",
                    "só à noite", "de dia não", "depois que escurece"
                ],
            },
            "cabra_criancas": {
                "description": "Caça crianças",
                "exclusive_to_npc": None,  # Qualquer um pode observar
                "keywords": [
                    "criança", "menino", "menina", "criançada",
                    "pega criança", "vai atrás de criança"
                ],
            },
            "cabra_criancas_mal_educadas": {
                "description": "Prefere crianças malcriadas e desobedientes",
                "exclusive_to_npc": ["conceicao", "franciscleison"],
                # Raimundo não sabe esse detalhe específico
                "keywords": [
                    "malcriado", "malcriada", "desobediente", "sem educação",
                    "não obedece", "danado", "travesso", "sem respeito",
                    "malcomportado"
                ],
            },
            "cabra_cheiro": {
                "description": "Cheiro de enxofre e bode precede a criatura",
                "exclusive_to_npc": None,  # Qualquer um que sentiu pode confirmar
                "keywords": [
                    "cheiro", "fedor", "fedorento", "cheira",
                    "enxofre", "bode", "podre", "fede"
                ],
            },
            "cabra_voz": {
                "description": "Imita vozes de pessoas conhecidas",
                "exclusive_to_npc": ["conceicao", "franciscleison"],
                # Raimundo ouviu do avô mas vagamente — não tem detalhes suficientes
                # para revelar essa pista de forma confiável
                "keywords": [
                    "voz", "imita", "imitando", "finge", "engana",
                    "parece a voz", "voz da mãe", "voz do pai", "chama pelo nome"
                ],
            },
            "cabra_reza": {
                "description": "Reza de proteção afasta a criatura",
                "exclusive_to_npc": ["conceicao"],
                # Somente Dona Conceição tem a reza de verdade
                # Raimundo pode *mencionar* que reza ajuda, mas não revela a pista
                # pois não tem o conhecimento real — apenas um boato do avô
                "keywords": [
                    "reza", "oração", "rezar", "afasta", "pai nosso",
                    "ave maria", "proteção", "protege", "benção", "orações"
                ],
            },
            "cabra_rastros": {
                "description": "Rastros de cascos bifurcados na caatinga",
                "exclusive_to_npc": None,
                # Descoberto explorando a caatinga — nenhum NPC revela isso
                # Colocamos None pois o sistema de cenas (não NPC) pode revelar
                "keywords": [
                    "rastro", "pegada", "pata", "casco", "trilha",
                    "marca no chão", "passagem", "bifurcado"
                ],
            },
            "cabra_nome": {
                "description": "Nome da criatura: Cabra Cabriola",
                "exclusive_to_npc": ["conceicao"],
                # Somente Dona Conceição sabe o nome — regra central do jogo
                "keywords": [
                    "cabra cabriola", "cabriola"
                ],
            },
            "cabra_amigo_sumiu": {
                "description": "Pedro desapareceu há três dias",
                "exclusive_to_npc": ["franciscleison"],
                # Só Franciscleison pode confirmar o desaparecimento do amigo
                "keywords": [
                    "pedro", "sumiu", "desapareceu", "amigo", "três dias"
                ],
            },
        },

        "false_facts_to_avoid": [
            "Sal grosso não tem efeito — isso é do Saci",
            "Não age durante o dia",
            "Não há localização fixa conhecida",
        ]
    }
}