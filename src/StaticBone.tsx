import * as React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import {
  ICustomViewStyle,
  DEFAULT_BORDER_RADIUS,
  _animationDirection,
  _animationType,
} from './Constants';

interface IProps {
  backgroundPulseColor: Animated.SharedValue<string>;
  boneLayout: ICustomViewStyle;
  key: number | string;
  componentSizeWidth: number;
  componentSizeHeight: number;
  animationDirection: _animationDirection;
  animationType: _animationType;
  boneColor: string;
}

function StaticBone({
  boneLayout,
  backgroundPulseColor,
  key,
  componentSizeWidth,
  componentSizeHeight,
  animationType,
  animationDirection,
  boneColor,
}: IProps) {
  const { backgroundColor, borderRadius } = boneLayout;

  const boneWidth = React.useMemo(
    (): number =>
      (typeof boneLayout.width === 'string'
        ? componentSizeWidth
        : boneLayout.width) || 0,
    [boneLayout, componentSizeWidth]
  );

  const boneHeight = React.useMemo(
    (): number =>
      (typeof boneLayout.height === 'string'
        ? componentSizeHeight
        : boneLayout.height) || 0,
    [boneLayout, componentSizeHeight]
  );

  const boneStyle1 = React.useMemo(() => {
    const boneStyle: ICustomViewStyle = {
      width: boneWidth,
      height: boneHeight,
      borderRadius: borderRadius || DEFAULT_BORDER_RADIUS,
      ...boneLayout,
    };
    if (animationType !== 'pulse') {
      boneStyle.overflow = 'hidden';
      boneStyle.backgroundColor = backgroundColor || boneColor;
    }
    if (
      animationDirection === 'diagonalDownRight' ||
      animationDirection === 'diagonalDownLeft' ||
      animationDirection === 'diagonalTopRight' ||
      animationDirection === 'diagonalTopLeft'
    ) {
      boneStyle.justifyContent = 'center';
      boneStyle.alignItems = 'center';
    }
    return boneStyle;
  }, [
    boneWidth,
    boneHeight,
    borderRadius,
    boneLayout,
    animationType,
    animationDirection,
    backgroundColor,
    boneColor,
  ]);

  const staticStyle = useAnimatedStyle(() => {
    if (animationType === 'none') return {};
    return {
      backgroundColor: backgroundPulseColor.value,
    };
  }, [animationType, backgroundPulseColor.value]);

  return (
    <Animated.View
      key={boneLayout.key || key}
      style={[boneStyle1, staticStyle]}
    />
  );
}

export default React.memo(StaticBone);
