import classNames from 'classnames';
import CSSMotion from 'rc-motion';
import { render, unmount } from 'rc-util/lib/React/render';
import raf from 'rc-util/lib/raf';
import * as React from 'react';
import { getTargetWaveColor } from './util';

function validateNum(value: number) {
  return Number.isNaN(value) ? 0 : value;
}

export interface WaveEffectProps {
  className: string;
  target: HTMLElement;
}

const WaveEffect: React.FC<WaveEffectProps> = (props) => {
  const { className, target } = props;
  const divRef = React.useRef<HTMLDivElement>(null);

  const [color, setWaveColor] = React.useState<string | null>(null);
  const [borderRadius, setBorderRadius] = React.useState<number[]>([]);
  const [left, setLeft] = React.useState(0);
  const [top, setTop] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);
  const [enabled, setEnabled] = React.useState(false);

  const waveStyle = {
    left,
    top,
    width,
    height,
    // borderRadius: number[] 转 border 属性
    borderRadius: borderRadius.map((radius) => `${radius}px`).join(' '),
  } as React.CSSProperties & {
    [name: string]: number | string;
  };

  if (color) {
    waveStyle['--wave-color'] = color;
  }

  function syncPos() {
    const nodeStyle = getComputedStyle(target);

    // Get wave color from target
    // 从波纹目标获取颜色
    // 如按钮的边框是蓝色的，获取到的 waveColor 即蓝色
    setWaveColor(getTargetWaveColor(target));

    const isStatic = nodeStyle.position === 'static';

    // Rect
    // 准备样式
    // borderLeftWidth 这类的样式属性可以声明为 px、em 等多种单位
    // 但 getComputedStyle(target) 所获取的就是计算后的属性值，即 px
    const { borderLeftWidth, borderTopWidth } = nodeStyle;
    setLeft(isStatic ? target.offsetLeft : validateNum(-parseFloat(borderLeftWidth)));
    setTop(isStatic ? target.offsetTop : validateNum(-parseFloat(borderTopWidth)));
    setWidth(target.offsetWidth);
    setHeight(target.offsetHeight);

    // Get border radius
    const {
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius,
    } = nodeStyle;

    setBorderRadius(
      [
        borderTopLeftRadius,
        borderTopRightRadius,
        borderBottomRightRadius,
        borderBottomLeftRadius,
      ].map((radius) => validateNum(parseFloat(radius))),
    );
  }

  React.useEffect(() => {
    if (target) {
      // We need delay to check position here
      // since UI may change after click
      // 我们需要延迟检查此处的位置，因为单击后 UI 可能会更改
      // 创建包装器引用
      const id = raf(() => {
        syncPos();

        setEnabled(true);
      });

      // Add resize observer to follow size
      // 添加 resize 观察器
      let resizeObserver: ResizeObserver;
      // 监测当前 ts 版本支持 ResizeObserver
      if (typeof ResizeObserver !== 'undefined') {
        // syncPos() 作为 eventhandler
        resizeObserver = new ResizeObserver(syncPos);

        // target 波纹目标作为被观察对象
        resizeObserver.observe(target);
      }

      return () => {
        // 解除引用
        raf.cancel(id);
        // 解除观察器
        resizeObserver?.disconnect();
      };
    }
  }, []);

  // 在 syncPos() 执行之前，Wave 的样式属性尚未准备好
  // 所以直接返回 null
  if (!enabled) {
    return null;
  }

  return (
    <CSSMotion
      visible
      motionAppear
      motionName="wave-motion"
      motionDeadline={5000}
      onAppearEnd={(_, event) => {
        console.log(event);
        // Wave 渲染完成后卸载相关节点
        if (event.deadline || (event as TransitionEvent).propertyName === 'opacity') {
          // 包含 WaveEffect 的外部容器
          const holder = divRef.current?.parentElement!;
          // 卸载外部容器
          unmount(holder).then(() => {
            // 从外部容器的父容器中删除外部容器节点
            holder.parentElement?.removeChild(holder);
          });
        }
        return false;
      }}
    >
      {({ className: motionClassName }) => (
        // Wave 节点
        <div ref={divRef} className={classNames(className, motionClassName)} style={waveStyle} />
      )}
    </CSSMotion>
  );
};

export default function showWaveEffect(node: HTMLElement, className: string) {
  // Create holder
  // 包含 WaveEffect 的外部容器
  const holder = document.createElement('div');
  holder.style.position = 'absolute';
  holder.style.left = `0px`;
  holder.style.top = `0px`;
  console.log(node);
  // 在 node 的第一个 child 之前插入 holder
  node?.insertBefore(holder, node?.firstChild);

  render(<WaveEffect target={node} className={className} />, holder);
}
