import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import {
  ICustomViewStyle,
  DEFAULT_BORDER_RADIUS,
  _animationDirection,
  _animationType,
  DEFAULT_HIGHLIGHT_COLOR,
  IDirection,
} from './Constants';

const styles = StyleSheet.create({
  gradientChild: {
    flex: 1,
  },
  absoluteGradient: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
});

interface IProps {
  animationValue: Animated.SharedValue<number>;
  highlightColor: string;
  boneLayout: ICustomViewStyle;
  key: number | string;
  componentSizeWidth: number;
  componentSizeHeight: number;
  animationDirection: _animationDirection;
  animationType: _animationType;
  boneColor: string;
}

function ShiverBone({
  animationValue,
  highlightColor = DEFAULT_HIGHLIGHT_COLOR,
  boneLayout,
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

  const positionRange = React.useMemo((): number[] => {
    const outputRange: number[] = [];
    if (animationDirection === 'horizontalRight') {
      return [-boneWidth, +boneWidth];
    }
    if (animationDirection === 'horizontalLeft') {
      return [+boneWidth, -boneWidth];
    }
    if (animationDirection === 'verticalDown') {
      return [-boneHeight, +boneHeight];
    }
    if (animationDirection === 'verticalTop') {
      return [+boneHeight, -boneHeight];
    }
    return outputRange;
  }, [animationDirection, boneHeight, boneWidth]);

  const gradientEndDirection = React.useMemo((): IDirection => {
    if (animationType === 'shiver') {
      if (
        animationDirection === 'horizontalLeft' ||
        animationDirection === 'horizontalRight'
      ) {
        return { x: 1, y: 0 };
      }
      if (
        animationDirection === 'verticalTop' ||
        animationDirection === 'verticalDown'
      ) {
        return { x: 0, y: 1 };
      }
      if (
        animationDirection === 'diagonalTopRight' ||
        animationDirection === 'diagonalDownRight' ||
        animationDirection === 'diagonalDownLeft' ||
        animationDirection === 'diagonalTopLeft'
      ) {
        if (boneWidth && boneHeight && boneWidth > boneHeight)
          return { x: 0, y: 1 };
        return { x: 1, y: 0 };
      }
    }
    return { x: 0, y: 0 };
  }, [animationDirection, animationType, boneHeight, boneWidth]);

  const translateYAnim1 = useDerivedValue(() => {
    return interpolate(animationValue.value, [0, 1], positionRange);
  }, [animationValue.value, positionRange]);

  const diagonal = React.useMemo(() => {
    return Math.sqrt(boneHeight * boneHeight + boneWidth * boneWidth);
  }, [boneHeight, boneWidth]);

  const mainDimension = React.useMemo(
    () => Math.max(boneHeight, boneWidth),
    [boneHeight, boneWidth]
  );

  const oppositeDimension = React.useMemo(
    () => (mainDimension === boneWidth ? boneHeight : boneWidth),
    [boneHeight, boneWidth, mainDimension]
  );

  const diagonalAngle = React.useMemo(
    () => Math.acos(mainDimension / diagonal),
    [diagonal, mainDimension]
  );

  const distanceFactor = React.useMemo(
    () => (diagonal + oppositeDimension) / 2,
    [diagonal, oppositeDimension]
  );

  const rotateAngle = React.useMemo(() => {
    let rotateAngle1 =
      animationDirection === 'diagonalDownRight' ||
      animationDirection === 'diagonalTopLeft'
        ? Math.PI / 2 - diagonalAngle
        : Math.PI / 2 + diagonalAngle;
    const additionalRotate =
      animationDirection === 'diagonalDownRight' ||
      animationDirection === 'diagonalTopLeft'
        ? 2 * diagonalAngle
        : -2 * diagonalAngle;
    if (mainDimension === boneWidth && boneWidth !== boneHeight)
      rotateAngle1 += additionalRotate;

    return rotateAngle1;
  }, [animationDirection, boneHeight, boneWidth, diagonalAngle, mainDimension]);

  const sinComponent = React.useMemo(
    () => Math.sin(diagonalAngle) * distanceFactor,
    [diagonalAngle, distanceFactor]
  );

  const cosComponent = React.useMemo(
    () => Math.cos(diagonalAngle) * distanceFactor,
    [diagonalAngle, distanceFactor]
  );

  const xOutputRange = React.useMemo(() => {
    let xOutputRange1: number[];
    if (
      animationDirection === 'diagonalDownRight' ||
      animationDirection === 'diagonalTopLeft'
    ) {
      xOutputRange1 =
        animationDirection === 'diagonalDownRight'
          ? [-sinComponent, sinComponent]
          : [sinComponent, -sinComponent];
    } else {
      xOutputRange1 =
        animationDirection === 'diagonalDownLeft'
          ? [-sinComponent, sinComponent]
          : [sinComponent, -sinComponent];
      if (mainDimension === boneHeight && boneWidth !== boneHeight) {
        xOutputRange1.reverse();
      }
    }
    return xOutputRange1;
  }, [animationDirection, boneHeight, boneWidth, mainDimension, sinComponent]);

  const yOutputRange = React.useMemo(() => {
    let yOutputRange1: number[];
    if (
      animationDirection === 'diagonalDownRight' ||
      animationDirection === 'diagonalTopLeft'
    ) {
      yOutputRange1 =
        animationDirection === 'diagonalDownRight'
          ? [-cosComponent, cosComponent]
          : [cosComponent, -cosComponent];
    } else {
      yOutputRange1 =
        animationDirection === 'diagonalDownLeft'
          ? [cosComponent, -cosComponent]
          : [-cosComponent, cosComponent];
      if (mainDimension === boneHeight && boneWidth !== boneHeight) {
        yOutputRange1.reverse();
      }
    }
    return yOutputRange1;
  }, [animationDirection, boneHeight, boneWidth, cosComponent, mainDimension]);

  const translateXAnim11 = useDerivedValue(() => {
    return interpolate(animationValue.value, [0, 1], xOutputRange);
  }, [animationValue.value, xOutputRange]);

  const translateYAnim11 = useDerivedValue(() => {
    return interpolate(animationValue.value, [0, 1], yOutputRange);
  }, [animationValue.value, yOutputRange]);

  const transformStyle = useAnimatedStyle(() => {
    if (
      animationDirection === 'verticalTop' ||
      animationDirection === 'verticalDown' ||
      animationDirection === 'horizontalLeft' ||
      animationDirection === 'horizontalRight'
    ) {
      if (
        animationDirection === 'verticalTop' ||
        animationDirection === 'verticalDown'
      ) {
        return {
          transform: [{ translateY: translateYAnim1.value }],
        };
      }
      return {
        transform: [{ translateX: translateYAnim1.value }],
      };
    }
    if (
      animationDirection === 'diagonalDownRight' ||
      animationDirection === 'diagonalTopRight' ||
      animationDirection === 'diagonalDownLeft' ||
      animationDirection === 'diagonalTopLeft'
    ) {
      const rotate = `${rotateAngle}rad`;
      if (mainDimension === boneWidth) {
        return {
          transform: [
            {
              translateX: translateYAnim11.value,
              translateY: translateXAnim11.value,
              rotate,
            },
          ],
        };
      }

      return {
        transform: [
          {
            translateX: translateXAnim11.value,
            translateY: translateYAnim11.value,
            rotate,
          },
        ],
      };
    }

    return {
      transform: [],
    };
  }, [
    translateXAnim11.value,
    translateYAnim11.value,
    translateYAnim1.value,
    animationDirection,
  ]);

  const gradientWidth = React.useMemo(() => {
    let width = boneWidth;
    if (boneHeight < boneWidth) width *= 1.5;
    return width;
  }, [boneHeight, boneWidth]);

  const gradientHeight = React.useMemo(() => {
    let height = boneHeight;
    if (boneHeight >= boneWidth) height *= 1.5;

    return height;
  }, [boneHeight, boneWidth]);

  const gradientSizeStyle = useAnimatedStyle(() => {
    if (
      animationDirection === 'diagonalDownRight' ||
      animationDirection === 'diagonalDownLeft' ||
      animationDirection === 'diagonalTopRight' ||
      animationDirection === 'diagonalTopLeft'
    ) {
      return { width: gradientWidth, height: gradientHeight };
    }
    return {};
  }, [animationDirection, gradientHeight, gradientWidth]);

  return (
    <View key={boneLayout.key || key} style={boneStyle1}>
      <Animated.View
        style={[styles.absoluteGradient, transformStyle, gradientSizeStyle]}
      >
        <LinearGradient
          colors={[boneColor!, highlightColor!, boneColor!]}
          start={{ x: 0, y: 0 }}
          end={gradientEndDirection}
          style={styles.gradientChild}
        />
      </Animated.View>
    </View>
  );
}

export default React.memo(ShiverBone);
