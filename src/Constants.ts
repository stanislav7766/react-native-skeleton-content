import { StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

export type _animationType = 'none' | 'shiver' | 'pulse' | undefined;
export type _animationDirection =
  | 'horizontalLeft'
  | 'horizontalRight'
  | 'verticalTop'
  | 'verticalDown'
  | 'diagonalDownLeft'
  | 'diagonalDownRight'
  | 'diagonalTopLeft'
  | 'diagonalTopRight'
  | undefined;

export interface ICustomViewStyle extends ViewStyle {
  children?: ICustomViewStyle[];
  key?: number | string;
}

export interface ISkeletonContentProps {
  isLoading: boolean;
  layout?: ICustomViewStyle[];
  duration?: number;
  containerStyle?: StyleProp<ViewStyle>;
  animationType?: _animationType;
  animationDirection?: _animationDirection;
  boneColor?: string;
  highlightColor?: string;
  easing?: Animated.EasingNodeFunction;
  children?: any;
}

export interface IDirection {
  x: number;
  y: number;
}

export const DEFAULT_BORDER_RADIUS = 4;
export const DEFAULT_DURATION = 1200;
export const DEFAULT_ANIMATION_TYPE: _animationType = 'shiver';
export const DEFAULT_ANIMATION_DIRECTION: _animationDirection =
  'horizontalRight';
export const DEFAULT_BONE_COLOR = '#E1E9EE';
export const DEFAULT_HIGHLIGHT_COLOR = '#F2F8FC';
export const DEFAULT_LOADING = true;
