export function isNotGrey(color: string) {
  // eslint-disable-next-line no-useless-escape
  const match = (color || '').match(/rgba?\((\d*), (\d*), (\d*)(, [\d.]*)?\)/);
  if (match && match[1] && match[2] && match[3]) {
    return !(match[1] === match[2] && match[2] === match[3]);
  }
  return true;
}

// 判断 color 是否是有效的 Wave 颜色
// 如果 color 是纯白、灰色、透明或者无效 rgba，则不能作为 Wave 颜色
export function isValidWaveColor(color: string) {
  return (
    color &&
    color !== '#fff' &&
    color !== '#ffffff' &&
    color !== 'rgb(255, 255, 255)' &&
    color !== 'rgba(255, 255, 255, 1)' &&
    isNotGrey(color) &&
    !/rgba\((?:\d*, ){3}0\)/.test(color) && // any transparent rgba color
    color !== 'transparent'
  );
}

// 获取目标 波纹 颜色
export function getTargetWaveColor(node: HTMLElement) {
  // borderTopColor: 目标元素顶部 border 的颜色
  // borderColor: 目标元素 border 的颜色
  // backgroundColor: 目标元素背景的颜色
  // 分别测试这几个颜色，看能否作为 Wave 颜色
  const { borderTopColor, borderColor, backgroundColor } = getComputedStyle(node);
  if (isValidWaveColor(borderTopColor)) {
    return borderTopColor;
  }
  if (isValidWaveColor(borderColor)) {
    return borderColor;
  }
  if (isValidWaveColor(backgroundColor)) {
    return backgroundColor;
  }
  return null;
}
