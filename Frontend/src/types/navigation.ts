import { NavigatorScreenParams } from "@react-navigation/native";

export type RootStackParamList = {
  Splash: undefined;
  Menu: {
    fromSplash?: boolean;
    reason?: string;
    regionId?: string;
  };
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
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
  ComingSoonRegion: {
    regionName: string;
  };
  Battle: undefined;
  Inventory: undefined;
  GameOver: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Catalog: undefined;
};
