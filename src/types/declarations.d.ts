// src/types/declarations.d.ts
// This file provides type declarations for modules without built-in TypeScript support

declare module 'react-native-gesture-handler' {
  import { ComponentType } from 'react';
  
  export const GestureHandlerRootView: ComponentType<any>;
  export * from 'react-native-gesture-handler/lib/typescript/index';
}

declare module '@expo/vector-icons' {
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';

  export interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }

  export class Ionicons extends ComponentType<IconProps> {}
  export class MaterialIcons extends ComponentType<IconProps> {}
  export class FontAwesome extends ComponentType<IconProps> {}
  export class Feather extends ComponentType<IconProps> {}
  export class AntDesign extends ComponentType<IconProps> {}
  export class Entypo extends ComponentType<IconProps> {}
}

declare module 'react-native-mmkv' {
  export class MMKV {
    constructor(options?: { id?: string; path?: string; encryptionKey?: string });
    
    set(key: string, value: string | number | boolean): void;
    getString(key: string): string | undefined;
    getNumber(key: string): number | undefined;
    getBoolean(key: string): boolean | undefined;
    delete(key: string): void;
    clearAll(): void;
    getAllKeys(): string[];
    contains(key: string): boolean;
  }
}

declare module '@react-native-community/slider' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';

  export interface SliderProps {
    value?: number;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
    disabled?: boolean;
    onValueChange?: (value: number) => void;
    onSlidingStart?: (value: number) => void;
    onSlidingComplete?: (value: number) => void;
    style?: StyleProp<ViewStyle>;
  }

  export default class Slider extends Component<SliderProps> {}
}

declare module 'expo-linear-gradient' {
  import { ComponentType } from 'react';
  import { ViewProps } from 'react-native';

  export interface LinearGradientProps extends ViewProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
  }

  export class LinearGradient extends ComponentType<LinearGradientProps> {}
}