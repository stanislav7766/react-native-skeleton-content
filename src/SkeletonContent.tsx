/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-array-index-key */
import * as React from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import {
  interpolateColor,
  useDerivedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  ICustomViewStyle,
  DEFAULT_ANIMATION_DIRECTION,
  DEFAULT_ANIMATION_TYPE,
  DEFAULT_BONE_COLOR,
  DEFAULT_DURATION,
  DEFAULT_HIGHLIGHT_COLOR,
  DEFAULT_LOADING,
  ISkeletonContentProps,
} from './Constants';
// import StaticBone from './StaticBone';
// import ShiverBone from './ShiverBone';

const { useState, useCallback } = React;

const styles = StyleSheet.create({
  absoluteGradient: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  gradientChild: {
    flex: 1,
  },
});

const useLayout = () => {
  const [size, setSize] = useState<any>({ width: 0, height: 0 });

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  }, []);

  return [size, onLayout];
};

function SkeletonContent({
  containerStyle = styles.container,
  duration = DEFAULT_DURATION,
  layout = [],
  animationType = DEFAULT_ANIMATION_TYPE,
  animationDirection = DEFAULT_ANIMATION_DIRECTION,
  isLoading = DEFAULT_LOADING,
  boneColor = DEFAULT_BONE_COLOR,
  highlightColor = DEFAULT_HIGHLIGHT_COLOR,
  children,
}: ISkeletonContentProps) {
  const [componentSize, onLayout] = useLayout();

  const animationValue = useDerivedValue(() => {
    if (isLoading) return withTiming(0);
    if (animationType === 'shiver') {
      return withRepeat(withTiming(duration!), -1);
    }
    return withRepeat(withTiming(duration! / 2), -1);
  }, [isLoading, animationType, duration]);

  const backgroundPulseColor = useDerivedValue(() => {
    const x = interpolateColor(
      animationValue.value,
      [0, 1],
      [boneColor!, highlightColor!]
    );
    return x;
  });

  const getBones = (
    bonesLayout: ICustomViewStyle[] | undefined,
    childrenItems: any
  ): JSX.Element[] => {
    if (bonesLayout && bonesLayout.length > 0) {
      return [];
    }
    return React.Children.map(childrenItems, () => {
      if (animationType === 'pulse' || animationType === 'none') {
        return null;
      }
      return null;
    });
  };

  return (
    <View style={containerStyle} onLayout={onLayout}>
      {isLoading ? getBones(layout!, children) : children}
    </View>
  );
}

export default React.memo(SkeletonContent);
