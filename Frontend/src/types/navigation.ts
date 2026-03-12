export type RootStackParamList = {
  Splash: undefined;
  Menu: undefined;
  MainTabs: undefined;
  Scenario:
    | {
        regionName: string;
        scenarioName: string;
      }
    | undefined;
  Battle: undefined;
  Inventory: undefined;
};

export type MainTabParamList = {
  Map: undefined;
  Catalog: undefined;
};
