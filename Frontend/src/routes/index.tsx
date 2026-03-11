import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { ImageBackground } from 'react-native';
import StackRoutes from './stack.routes';

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export default function Routes() {
  return (
    <ImageBackground
      source={require('../assets/BackgroundPapel.png')}
      resizeMode="cover"
      className="flex-1"
    >
      <NavigationContainer theme={appTheme}>
        <StackRoutes />
      </NavigationContainer>
    </ImageBackground>
  );
}