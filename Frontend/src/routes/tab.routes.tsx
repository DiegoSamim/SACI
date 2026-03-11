import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { MaterialIcons } from '@expo/vector-icons'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Map from '../screens/Map'
import Catalog from '../screens/Catalog'

import { MainTabParamList } from '../types/navigation'

const Tab = createBottomTabNavigator<MainTabParamList>()

export default function TabRoutes() {

    const insets = useSafeAreaInsets()

    return (
        <Tab.Navigator
            initialRouteName="Map"
            screenOptions={{
                headerShown: false,

                tabBarStyle: {
                    backgroundColor: '#1f2937',
                    height: 56,
                    paddingTop: 6,
                    paddingBottom: insets.bottom,
                },

                tabBarShowLabel: false,
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: '#d1d5db',

                animation: "shift",
            }}
        >

            <Tab.Screen
                name="Map"
                component={Map}
                options={{
                    tabBarIcon: ({ focused, size, color }) => (
                        <View
                            style={
                                focused
                                    ? {
                                        backgroundColor: '#374151',
                                        width: size * 1.7,
                                        height: size * 1.7,
                                        borderRadius: (size * 1.7) / 2,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }
                                    : undefined
                            }
                        >
                            <MaterialIcons name="map" size={size} color={color} />
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
                                        backgroundColor: '#374151',
                                        width: size * 1.7,
                                        height: size * 1.7,
                                        borderRadius: (size * 1.7) / 2,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }
                                    : undefined
                            }
                        >
                            <MaterialIcons name="menu-book" size={size} color={color} />
                        </View>
                    ),
                }}
            />

        </Tab.Navigator>
    )
}