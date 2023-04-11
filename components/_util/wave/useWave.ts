import showWaveEffect from './WaveEffect';

export default function useWave(
  nodeRef: React.RefObject<HTMLElement>,
  className: string,
): VoidFunction {
  function showWave() {
    // 取到调用者 button 的 ref
    const node = nodeRef.current!;

    // 渲染 wave
    showWaveEffect(node, className);
  }

  return showWave;
}
