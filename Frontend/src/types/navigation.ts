export type RootStackParamList = {
  Splash: undefined;
  Menu: {
    fromSplash?: boolean;
    reason?: string;
    regionId?: string;
  };
  MainTabs: undefined;
  Dialogue: {
    npcId?: string;
    sceneId?: string;
    regionId?: string;
  };
  Scenario:
  | {
    regionName: string;
    scenarioName: string;
  }
  | undefined;
  Battle: undefined;
  Inventory: undefined;
  GameOver: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Catalog: undefined;
};
