import React from 'react';
import { cloneElement, isFragment } from '../_util/reactNode';

// 是两个字的按钮，如“提交”
const rxTwoCNChar = /^[\u4e00-\u9fa5]{2}$/;
export const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);

export function isString(str: any) {
  return typeof str === 'string';
}

// 不是无边框的按钮类型
export function isUnBorderedButtonType(type?: ButtonType) {
  return type === 'text' || type === 'link';
}

// 在长度为 2 个的汉字中间加上 空格
function splitCNCharsBySpace(child: React.ReactElement | string | number, needInserted: boolean) {
  if (child === null || child === undefined) {
    return;
  }

  const SPACE = needInserted ? ' ' : '';

  if (
    typeof child !== 'string' &&
    typeof child !== 'number' &&
    isString(child.type) &&
    isTwoCNChar(child.props.children)
  ) {
    return cloneElement(child, {
      children: child.props.children.split('').join(SPACE),
    });
  }

  if (typeof child === 'string') {
    return isTwoCNChar(child) ? <span>{child.split('').join(SPACE)}</span> : <span>{child}</span>;
  }

  if (isFragment(child)) {
    return <span>{child}</span>;
  }

  return child;
}

// 对 button 的子节点以及文字进行处理
export function spaceChildren(children: React.ReactNode, needInserted: boolean) {
  let isPrevChildPure: boolean = false;
  const childList: React.ReactNode[] = [];

  // React.Children.forEach 遍历 children
  React.Children.forEach(children, (child) => {
    const type = typeof child;
    console.log(child, type);
    // 是否是普通的 child，类型为 string || number
    // 如果 child 是文本，则是普通的 child
    const isCurrentChildPure = type === 'string' || type === 'number';
    if (isPrevChildPure && isCurrentChildPure) {
      // 如果前一个 child 是普通 child，当前 child 也是普通 child
      // 则直接将当前 child 拼接到前一个 child 后
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      childList[lastIndex] = `${lastChild}${child}`;
    } else {
      childList.push(child);
    }

    isPrevChildPure = isCurrentChildPure;
  });

  return React.Children.map(childList, (child) =>
    splitCNCharsBySpace(child as React.ReactElement | string | number, needInserted),
  );
}

// as const 使得数组的每一项都是 readonly
const ButtonTypes = ['default', 'primary', 'ghost', 'dashed', 'link', 'text'] as const;
// 将数组常量转为对应的 type 类型
// 注意此处的命名 const ButtonTypes / type ButtonType
export type ButtonType = typeof ButtonTypes[number];

const ButtonShapes = ['default', 'circle', 'round'] as const;
export type ButtonShape = typeof ButtonShapes[number];

const ButtonHTMLTypes = ['submit', 'button', 'reset'] as const;
export type ButtonHTMLType = typeof ButtonHTMLTypes[number];
