import type { NavigatorScreenParams } from '@react-navigation/native';
import type { RegionId } from './ids';

/**
 * Rotas carregam **`regionId`**, nunca nome de exibição. Derivar id de label com
 * `toLowerCase()`/`replace()` produzia ids que não existem em `RegionId` — era a
 * dívida C1. Nome de exibição vem de `REGION_LABELS`, na apresentação.
 *
 * Telas de jogo não recebem estado por parâmetro: o `runStore` é a fonte. Passar
 * cena por rota faria a navegação virar um segundo estado, divergente do save.
 */
export type RootStackParamList = {
  Splash: undefined;
  Menu: { fromSplash?: boolean } | undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Scenario: undefined;
  Dialogue: undefined;
  Ending: undefined;
  ComingSoonRegion: { regionId: RegionId };
  Inventory: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Catalog: undefined;
};
