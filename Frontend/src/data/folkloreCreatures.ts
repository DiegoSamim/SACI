export type FolkloreCreature = {
    id: string
    name: string
    region: string
    origin: string
    habitat: string
    description: string
    characteristics: string[]
    culturalMeaning: string
    curiosity: string
}

export const FOLKLORE_CREATURES = [
    {
        id: "mula_sem_cabeca",
        number: 1,
        name: "Mula-Sem-Cabeça",
        region: "Sudeste e Centro-Oeste do Brasil",
        origin: "Período colonial brasileiro",
        habitat: "Estradas rurais, campos e fazendas",
        description:
            "A Mula-Sem-Cabeça é uma das lendas mais conhecidas do folclore brasileiro. Segundo a tradição popular, trata-se de uma mulher que foi amaldiçoada e se transforma em uma mula que solta fogo pelo pescoço durante a noite.",
        characteristics: [
            "Solta chamas pelo pescoço",
            "Corre rapidamente pelas estradas",
            "Costuma aparecer durante a noite",
        ],
        culturalMeaning:
            "A lenda surgiu durante o período colonial e está associada a narrativas populares que refletiam valores morais e religiosos da época.",
        curiosity:
            "Apesar do nome, em algumas versões da lenda a criatura possui cabeça, mas ela é envolvida por chamas intensas."
    },

    {
        id: "cabra_cabriola",
        number: 2,
        name: "Cabra Cabriola",
        region: "Nordeste do Brasil",
        origin: "Tradições populares nordestinas do século XIX",
        habitat: "Pequenas cidades e áreas rurais",
        description:
            "A Cabra Cabriola é uma criatura do folclore nordestino que teria aparecido em diversas histórias populares durante o século XIX. A lenda descreve um ser misterioso que vagava pelas cidades causando medo entre os moradores.",
        characteristics: [
            "Associada a histórias de mistério e medo",
            "Relatada em diversas cidades do Nordeste",
            "Figura presente em narrativas populares",
        ],
        culturalMeaning:
            "A história foi muito utilizada para explicar acontecimentos misteriosos ou assustar crianças durante a noite.",
        curiosity:
            "Relatos sobre a Cabra Cabriola ficaram famosos em jornais e histórias populares do Nordeste brasileiro."
    },

    {
        id: "boitata",
        number: 3,
        name: "Boitatá",
        region: "Diversas regiões do Brasil",
        origin: "Tradições indígenas brasileiras",
        habitat: "Florestas, campos e áreas próximas a rios",
        description:
            "O Boitatá é descrito como uma grande serpente de fogo que protege as florestas. Segundo a tradição, a criatura aparece como uma luz intensa que se move rapidamente pela mata.",
        characteristics: [
            "Forma de serpente luminosa",
            "Brilha intensamente na escuridão",
            "Associado à proteção da natureza",
        ],
        culturalMeaning:
            "Nas lendas indígenas, o Boitatá é considerado um guardião das florestas que pune aqueles que provocam incêndios ou destroem a natureza.",
        curiosity:
            "O nome Boitatá vem do tupi e pode ser interpretado como 'cobra de fogo'."
    },

    {
        id: "curupira",
        number: 4,
        name: "Curupira",
        region: "Região Norte e áreas de floresta do Brasil",
        origin: "Mitologia indígena brasileira",
        habitat: "Florestas e matas densas",
        description:
            "O Curupira é um ser protetor das florestas conhecido por possuir os pés virados para trás. Essa característica serve para confundir caçadores que tentam seguir seus rastros.",
        characteristics: [
            "Pés voltados para trás",
            "Protetor das florestas",
            "Confunde caçadores com rastros falsos",
        ],
        culturalMeaning:
            "A lenda representa a importância da preservação da natureza nas culturas indígenas brasileiras.",
        curiosity:
            "Relatos sobre o Curupira existem desde os primeiros registros feitos por exploradores europeus no século XVI."
    },

    {
        id: "negrinho_do_pastoreio",
        number: 5,
        name: "Negrinho do Pastoreio",
        region: "Região Sul do Brasil",
        origin: "Tradições do Rio Grande do Sul",
        habitat: "Campos e áreas rurais",
        description:
            "O Negrinho do Pastoreio é uma figura muito conhecida no folclore do sul do Brasil. A história conta sobre um menino que teria sofrido injustiças, mas que se tornou um espírito protetor que ajuda pessoas a encontrar objetos perdidos.",
        characteristics: [
            "Associado a cavalos e campos",
            "Ajuda a encontrar objetos perdidos",
            "Figura muito presente na cultura gaúcha",
        ],
        culturalMeaning:
            "A lenda carrega elementos históricos e sociais do período da escravidão no Brasil.",
        curiosity:
            "Em muitas tradições populares, as pessoas acendem velas ou fazem pequenos pedidos ao Negrinho do Pastoreio para recuperar algo perdido."
    }
] as const