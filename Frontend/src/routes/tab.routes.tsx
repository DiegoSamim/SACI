import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_COLORS } from '../constants/colors';

import Map from '../screens/Map';
import Catalog from '../screens/Catalog';

import { MainTabParamList } from '../types/navigation';
import { ICONS, ICONS_DARK } from '@/constants/icons';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function TabRoutes() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: APP_COLORS.background.tabBar,
          height: 56,
          paddingTop: 6,
          paddingBottom: insets.bottom,
        },

        tabBarShowLabel: false,
        tabBarActiveTintColor: APP_COLORS.background.tabBar,
        tabBarInactiveTintColor: APP_COLORS.background.baseSoft,

        animation: 'shift',
      }}>
      <Tab.Screen
        name="Map"
        component={Map}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <View
              style={
                focused
                  ? {
                      backgroundColor: APP_COLORS.background.baseSoft,
                      width: size * 1.7,
                      height: size * 1.7,
                      borderRadius: (size * 1.7) / 2,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }
                  : undefined
              }>
              <Image
                source={focused ? ICONS.mapa : ICONS_DARK.mapa}
                style={{
                  width: 32,
                  height: 32,
                }}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Catalog"
        component={Catalog}
        options={{
          tabBarIcon: ({ focused, size, color }) => (
            <View
              style={
                focused
                  ? {
                      backgroundColor: APP_COLORS.background.baseSoft,
                      width: size * 1.7,
                      height: size * 1.7,
                      borderRadius: (size * 1.7) / 2,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }
                  : undefined
              }>
              <Image
                source={focused ? ICONS.livro : ICONS_DARK.livro}
                style={{
                  width: 32,
                  height: 32,
                }}
                resizeMode="contain"
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
