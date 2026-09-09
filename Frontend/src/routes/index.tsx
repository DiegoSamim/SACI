import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { ImageBackground } from 'react-native';
import StackRoutes from './stack.routes';
import DevInspector from '../components/dev/DevInspector';

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
      className="flex-1">
      <NavigationContainer theme={appTheme}>
        <StackRoutes />
      </NavigationContainer>
      {/* Uma montagem só, acima da navegação: o inspetor cobre toda tela sem
          que nenhuma delas saiba que ele existe. `__DEV__` é constante do
          Metro, então em produção o bundler elimina o ramo inteiro. */}
      {__DEV__ && <DevInspector />}
    </ImageBackground>
  );
}
