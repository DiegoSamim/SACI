export type FolkloreCreature = {
  id: string;
  name: string;
  region: string;
  origin: string;
  habitat: string;
  description: string;
  characteristics: string[];
  culturalMeaning: string;
  curiosity: string;
};

export const FOLKLORE_CREATURES = [
  {
    id: 'mula_sem_cabeca',
    number: 1,
    name: 'Mula-Sem-Cabeça',
    region: 'Sudeste e Centro-Oeste do Brasil',
    origin: 'Período colonial brasileiro',
    habitat: 'Estradas rurais, campos e fazendas',
    description:
      'A Mula-Sem-Cabeça é uma das lendas mais conhecidas do folclore brasileiro. Segundo a tradição popular, trata-se de uma mulher que foi amaldiçoada e se transforma em uma mula que solta fogo pelo pescoço durante a noite.',
    characteristics: [
      'Solta chamas pelo pescoço',
      'Corre rapidamente pelas estradas',
      'Costuma aparecer durante a noite',
    ],
    culturalMeaning:
      'A lenda surgiu durante o período colonial e está associada a narrativas populares que refletiam valores morais e religiosos da época.',
    curiosity:
      'Apesar do nome, em algumas versões da lenda a criatura possui cabeça, mas ela é envolvida por chamas intensas.',
  },

  {
    id: 'cabra_cabriola',
    number: 2,
    name: 'Cabra Cabriola',
    region: 'Nordeste do Brasil',
    origin:
      'Folclore ibérico adaptado ao Nordeste brasileiro durante a colonização portuguesa, com influências afro-brasileiras. Registros orais datam do século XIX, especialmente em Pernambuco, Alagoas, Sergipe e Bahia.',
    habitat: 'Ruas desertas, arredores de cidades do interior e casas de crianças desobedientes.',
    description:
      'A Cabra Cabriola é uma das criaturas mais antigas do folclore nordestino, trazida pelos portugueses durante o período colonial e mesclada com crenças afro-brasileiras. Monstro com forma de cabra horrenda e humanoide, de proporções avantajadas, com grande carranca que expele fogo e fuligem pelas narinas e olhos. Seus movimentos grotescos se anunciam pela batida dos cascos enquanto projeta imensas garras em braços esguios. Age exclusivamente à noite e ao anoitecer sai à caça, invadindo casas pelo telhado, pela janela ou pela porta em busca de crianças desobedientes. É conhecida por sua inteligência astuta: ouve e imita com perfeição a voz das mães para enganar crianças e fazê-las abrir a porta. Segundo a tradição, quando uma criança começa a chorar de repente sem motivo à noite, é sinal de que a Cabra Cabriola está por perto.',
    characteristics: [
      'Aparência de cabra monstruosa e humanoide, de grande porte',
      'Dentes afiados, cascos sujos e garras nos braços esguios',
      'Cheiro fétido inconfundível, descrito como bode podre com enxofre',
      'Age exclusivamente à noite e de dia some sem deixar rastros',
      'Imita com perfeição a voz de pessoas conhecidas, especialmente mães',
      'Invade casas pelo telhado, janelas ou portas arranhando e destelhando',
      'Astuta como uma raposa. Aprende vozes ao espionar e depois as replica',
      'Prefere crianças desobedientes, malcriadas e travessas',
    ],
    culturalMeaning:
      'A Cabra Cabriola funcionou por gerações como um mecanismo de controle social e ferramenta pedagógica no interior nordestino. Em épocas de pouca iluminação pública, o medo assumia formas físicas nos relatos sussurrados à beira do fogão a lenha. A lenda ensinava obediência, a não sair à noite e a não abrir a porta para estranhos além de regras de segurança transmitidas através do terror. Representa a manifestação do medo como instrumento de educação, ao lado do Bicho-Papão e da Cuca no imaginário popular brasileiro.',
    curiosity:
      'A lenda tem raízes em Portugal (conhecida como Cabra Cabrês) e chegou ao Brasil na época colonial, mas foi profundamente transformada pelo sincretismo com crenças afro-brasileiras. Uma versão mais antiga a descreve como um duende maligno que assumia forma de cabra e atacava mães amamentando. No século XIX era tema de canção de embalar nos estados do Piauí e Pernambuco. A criatura também aparece no folclore da Espanha e em mitos da América Central (o Gulén-Gulén-Bo), sugerindo uma origem comum europeia medieval. Alguns estudiosos apontam que seus avistamentos diminuíram drasticamente com a eletrificação rural do Nordeste no século XX.',
  },
  {
    id: 'boitata',
    number: 3,
    name: 'Boitatá',
    region: 'Diversas regiões do Brasil',
    origin: 'Tradições indígenas brasileiras',
    habitat: 'Florestas, campos e áreas próximas a rios',
    description:
      'O Boitatá é descrito como uma grande serpente de fogo que protege as florestas. Segundo a tradição, a criatura aparece como uma luz intensa que se move rapidamente pela mata.',
    characteristics: [
      'Forma de serpente luminosa',
      'Brilha intensamente na escuridão',
      'Associado à proteção da natureza',
    ],
    culturalMeaning:
      'Nas lendas indígenas, o Boitatá é considerado um guardião das florestas que pune aqueles que provocam incêndios ou destroem a natureza.',
    curiosity: "O nome Boitatá vem do tupi e pode ser interpretado como 'cobra de fogo'.",
  },

  {
    id: 'curupira',
    number: 4,
    name: 'Curupira',
    region: 'Região Norte e áreas de floresta do Brasil',
    origin: 'Mitologia indígena brasileira',
    habitat: 'Florestas e matas densas',
    description:
      'O Curupira é um ser protetor das florestas conhecido por possuir os pés virados para trás. Essa característica serve para confundir caçadores que tentam seguir seus rastros.',
    characteristics: [
      'Pés voltados para trás',
      'Protetor das florestas',
      'Confunde caçadores com rastros falsos',
    ],
    culturalMeaning:
      'A lenda representa a importância da preservação da natureza nas culturas indígenas brasileiras.',
    curiosity:
      'Relatos sobre o Curupira existem desde os primeiros registros feitos por exploradores europeus no século XVI.',
  },

  {
    id: 'negrinho_do_pastoreio',
    number: 5,
    name: 'Negrinho do Pastoreio',
    region: 'Região Sul do Brasil',
    origin: 'Tradições do Rio Grande do Sul',
    habitat: 'Campos e áreas rurais',
    description:
      'O Negrinho do Pastoreio é uma figura muito conhecida no folclore do sul do Brasil. A história conta sobre um menino que teria sofrido injustiças, mas que se tornou um espírito protetor que ajuda pessoas a encontrar objetos perdidos.',
    characteristics: [
      'Associado a cavalos e campos',
      'Ajuda a encontrar objetos perdidos',
      'Figura muito presente na cultura gaúcha',
    ],
    culturalMeaning:
      'A lenda carrega elementos históricos e sociais do período da escravidão no Brasil.',
    curiosity:
      'Em muitas tradições populares, as pessoas acendem velas ou fazem pequenos pedidos ao Negrinho do Pastoreio para recuperar algo perdido.',
  },
] as const;
