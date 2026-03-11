import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Menu from '../screens/Menu/index';

const Stack = createNativeStackNavigator();

export default function StackRoutes() {
    return (
        <Stack.Navigator
            initialRouteName={'Menu'}
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: 'transparent',
                },
            }}>
            <Stack.Screen name="Menu" component={Menu} />
        </Stack.Navigator>
    );
}