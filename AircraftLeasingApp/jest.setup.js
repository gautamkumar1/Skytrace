import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children }) =>
      React.createElement(React.Fragment, null, children),
    DefaultTheme: {
      colors: {
        primary: '#000',
        background: '#fff',
        card: '#fff',
        text: '#000',
        border: '#ccc',
        notification: '#f00',
      },
    },
    useTheme: () => ({
      colors: {
        primary: '#000',
        background: '#fff',
        card: '#fff',
        text: '#000',
        border: '#ccc',
        notification: '#f00',
      },
    }),
  };
});

jest.mock('@react-navigation/native-stack', () => {
  const React = require('react');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({ children }) =>
        React.createElement(React.Fragment, null, children),
      Screen: () => null,
    }),
  };
});

jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }) =>
        React.createElement(React.Fragment, null, children),
      Screen: () => null,
    }),
  };
});

jest.mock('react-native-haptic-feedback', () => ({
  default: { trigger: jest.fn() },
}));

jest.mock('@react-native-documents/picker', () => ({
  pick: jest.fn(async () => []),
  types: { pdf: 'application/pdf', plainText: 'text/plain' },
  keepLocalCopy: true,
}));

const chainable = () => {
  const api = {
    delay: () => api,
    duration: () => api,
  };
  return api;
};

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  const enteringChain = chainable();

  const useSharedValue = (init) => ({ value: init });
  const useAnimatedStyle = (fn) => {
    try {
      return typeof fn === 'function' ? fn() : {};
    } catch {
      return {};
    }
  };
  const useAnimatedProps = (fn) => {
    try {
      return typeof fn === 'function' ? fn() : {};
    } catch {
      return {};
    }
  };

  const withSpring = (to) => to;
  const withTiming = (to) => to;
  const withDelay = (_d, v) => v;
  const withRepeat = (a) => a;
  const withSequence = (...args) => args[0];

  const interpolate = () => 64;
  const Extrapolation = { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' };

  const Animated = {
    View: (props) => React.createElement(View, props),
    createAnimatedComponent: (C) => C,
  };

  return {
    __esModule: true,
    default: Animated,
    FadeInDown: { delay: () => enteringChain },
    FadeInLeft: { delay: () => enteringChain },
    FadeInRight: { delay: () => enteringChain },
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withSpring,
    withTiming,
    withDelay,
    withRepeat,
    withSequence,
    interpolate,
    Extrapolation,
  };
});
