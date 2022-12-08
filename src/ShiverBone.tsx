import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolateNode,
  useAnimatedStyle,
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
      outputRange.push(-boneWidth, +boneWidth);
    } else if (animationDirection === 'horizontalLeft') {
      outputRange.push(+boneWidth, -boneWidth);
    } else if (animationDirection === 'verticalDown') {
      outputRange.push(-boneHeight, +boneHeight);
    } else if (animationDirection === 'verticalTop') {
      outputRange.push(+boneHeight, -boneHeight);
    }
    return outputRange;
  }, [animationDirection, boneHeight, boneWidth]);

  const gradientEndDirection = React.useMemo((): IDirection => {
    let direction = { x: 0, y: 0 };
    if (animationType === 'shiver') {
      if (
        animationDirection === 'horizontalLeft' ||
        animationDirection === 'horizontalRight'
      ) {
        direction = { x: 1, y: 0 };
      } else if (
        animationDirection === 'verticalTop' ||
        animationDirection === 'verticalDown'
      ) {
        direction = { x: 0, y: 1 };
      } else if (
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
    return direction;
  }, [animationDirection, animationType, boneHeight, boneWidth]);

  const transformStyle = useAnimatedStyle(() => {
    if (
      animationDirection === 'verticalTop' ||
      animationDirection === 'verticalDown' ||
      animationDirection === 'horizontalLeft' ||
      animationDirection === 'horizontalRight'
    ) {
      const interpolatedPosition = interpolateNode(animationValue.value, {
        inputRange: [0, 1],
        outputRange: positionRange,
      });
      if (
        animationDirection === 'verticalTop' ||
        animationDirection === 'verticalDown'
      ) {
        return {
          transform: [{ translateY: interpolatedPosition }],
        };
      }
      return {
        transform: [{ translateX: interpolatedPosition }],
      };
    }
    if (
      animationDirection === 'diagonalDownRight' ||
      animationDirection === 'diagonalTopRight' ||
      animationDirection === 'diagonalDownLeft' ||
      animationDirection === 'diagonalTopLeft'
    ) {
      const diagonal = Math.sqrt(
        boneHeight * boneHeight + boneWidth * boneWidth
      );
      const mainDimension = Math.max(boneHeight, boneWidth);
      const oppositeDimension =
        mainDimension === boneWidth ? boneHeight : boneWidth;
      const diagonalAngle = Math.acos(mainDimension / diagonal);
      let rotateAngle =
        animationDirection === 'diagonalDownRight' ||
        animationDirection === 'diagonalTopLeft'
          ? Math.PI / 2 - diagonalAngle
          : Math.PI / 2 + diagonalAngle;
      const additionalRotate =
        animationDirection === 'diagonalDownRight' ||
        animationDirection === 'diagonalTopLeft'
          ? 2 * diagonalAngle
          : -2 * diagonalAngle;
      const distanceFactor = (diagonal + oppositeDimension) / 2;
      if (mainDimension === boneWidth && boneWidth !== boneHeight)
        rotateAngle += additionalRotate;
      const sinComponent = Math.sin(diagonalAngle) * distanceFactor;
      const cosComponent = Math.cos(diagonalAngle) * distanceFactor;
      let xOutputRange: number[];
      let yOutputRange: number[];
      if (
        animationDirection === 'diagonalDownRight' ||
        animationDirection === 'diagonalTopLeft'
      ) {
        xOutputRange =
          animationDirection === 'diagonalDownRight'
            ? [-sinComponent, sinComponent]
            : [sinComponent, -sinComponent];
        yOutputRange =
          animationDirection === 'diagonalDownRight'
            ? [-cosComponent, cosComponent]
            : [cosComponent, -cosComponent];
      } else {
        xOutputRange =
          animationDirection === 'diagonalDownLeft'
            ? [-sinComponent, sinComponent]
            : [sinComponent, -sinComponent];
        yOutputRange =
          animationDirection === 'diagonalDownLeft'
            ? [cosComponent, -cosComponent]
            : [-cosComponent, cosComponent];
        if (mainDimension === boneHeight && boneWidth !== boneHeight) {
          xOutputRange.reverse();
          yOutputRange.reverse();
        }
      }
      let translateX = interpolateNode(animationValue.value, {
        inputRange: [0, 1],
        outputRange: xOutputRange,
      });
      let translateY = interpolateNode(animationValue.value, {
        inputRange: [0, 1],
        outputRange: yOutputRange,
      });
      // swapping the translates if width is the main dim
      if (mainDimension === boneWidth)
        [translateX, translateY] = [translateY, translateX];
      const rotate = `${rotateAngle}rad`;
      return { transform: [{ translateX, translateY, rotate }] };
    }

    return {
      transform: [],
    };
  }, [
    animationDirection,
    positionRange,
    animationValue.value,
    boneHeight,
    boneWidth,
  ]);

  const gradientSizeStyle = useAnimatedStyle(() => {
    if (
      animationDirection === 'diagonalDownRight' ||
      animationDirection === 'diagonalDownLeft' ||
      animationDirection === 'diagonalTopRight' ||
      animationDirection === 'diagonalTopLeft'
    ) {
      let width = boneWidth;
      let height = boneHeight;
      if (boneHeight >= boneWidth) height *= 1.5;
      else width *= 1.5;
      return { width, height };
    }
    return {};
  }, [animationDirection, boneWidth, boneHeight]);

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
