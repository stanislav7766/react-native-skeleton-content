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
import StaticBone from './StaticBone';
import ShiverBone from './ShiverBone';

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

  const getBoneContainer = (
    layoutStyle: ICustomViewStyle,
    childrenBones: JSX.Element[],
    key: number | string
  ) => (
    <View key={layoutStyle.key || key} style={layoutStyle}>
      {childrenBones}
    </View>
  );

  const getBones = (
    bonesLayout: ICustomViewStyle[] | undefined,
    childrenItems: any,
    prefix: string | number = ''
  ): JSX.Element[] => {
    if (bonesLayout && bonesLayout.length > 0) {
      const iterator: number[] = new Array(bonesLayout.length).fill(0);
      return iterator.map((_, i) => {
        // has a nested layout
        if (bonesLayout[i].children && bonesLayout[i].children!.length > 0) {
          const containerPrefix = bonesLayout[i].key || `bone_container_${i}`;
          const { children: childBones, ...layoutStyle } = bonesLayout[i];
          return getBoneContainer(
            layoutStyle,
            getBones(childBones, [], containerPrefix),
            containerPrefix
          );
        }
        if (animationType === 'pulse' || animationType === 'none') {
          return (
            <StaticBone
              backgroundPulseColor={backgroundPulseColor}
              boneLayout={bonesLayout[i]}
              key={prefix ? `${prefix}_${i}` : i}
              componentSizeWidth={componentSize.width as number}
              componentSizeHeight={componentSize.height as number}
              animationType={animationType}
              animationDirection={animationDirection}
              boneColor={boneColor}
            />
          );
        }
        return (
          <ShiverBone
            animationValue={animationValue}
            highlightColor={highlightColor}
            boneLayout={bonesLayout[i]}
            key={prefix ? `${prefix}_${i}` : i}
            componentSizeWidth={componentSize.width as number}
            componentSizeHeight={componentSize.height as number}
            animationType={animationType}
            animationDirection={animationDirection}
            boneColor={boneColor}
          />
        );
      });
      // no layout, matching children's layout
    }
    return React.Children.map(childrenItems, (child, i) => {
      const styling = child.props.style || {};

      if (animationType === 'pulse' || animationType === 'none') {
        return (
          <StaticBone
            backgroundPulseColor={backgroundPulseColor}
            boneLayout={styling}
            key={i}
            componentSizeWidth={componentSize.width as number}
            componentSizeHeight={componentSize.height as number}
            animationType={animationType}
            animationDirection={animationDirection}
            boneColor={boneColor}
          />
        );
      }
      return (
        <ShiverBone
          animationValue={animationValue}
          highlightColor={highlightColor}
          boneLayout={styling}
          key={i}
          componentSizeWidth={componentSize.width as number}
          componentSizeHeight={componentSize.height as number}
          animationType={animationType}
          animationDirection={animationDirection}
          boneColor={boneColor}
        />
      );
    });
  };

  return (
    <View style={containerStyle} onLayout={onLayout}>
      {isLoading ? getBones(layout!, children) : children}
    </View>
  );
}

export default React.memo(SkeletonContent);
