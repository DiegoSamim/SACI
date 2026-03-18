import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Battle from '../screens/Battle';
import Inventory from '../screens/Inventory';
import Dialogue from '../screens/Dialogue';
import Menu from '../screens/Menu/index';
import Scenario from '../screens/Scenario';
import SplashScreen from '../screens/SplashScreen';
import GameOver from '../screens/GameOver';
import ComingSoonRegion from '../screens/ComingSoonRegion';
import TabRoutes from './tab.routes';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackRoutes() {
    return (
        <Stack.Navigator
            initialRouteName={'Splash'}
            screenOptions={{
                headerShown: false,
                animation: 'fade',
                contentStyle: {
                    backgroundColor: 'transparent',
                },
            }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Menu" component={Menu} />
            <Stack.Screen name="MainTabs" component={TabRoutes} />
            <Stack.Screen name="Scenario" component={Scenario} />
            <Stack.Screen name="ComingSoonRegion" component={ComingSoonRegion} />
            <Stack.Screen name="Dialogue" component={Dialogue} />
            <Stack.Screen name="Battle" component={Battle} />
            <Stack.Screen name="Inventory" component={Inventory} />
            <Stack.Screen name="GameOver" component={GameOver} />
        </Stack.Navigator>
    );
}