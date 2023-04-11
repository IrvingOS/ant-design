import classNames from 'classnames';
import isVisible from 'rc-util/lib/Dom/isVisible';
import { composeRef, supportRef } from 'rc-util/lib/ref';
import React, { useContext, useRef } from 'react';
import type { ConfigConsumerProps } from '../../config-provider';
import { ConfigContext } from '../../config-provider';
import { cloneElement } from '../reactNode';
import useStyle from './style';
import useWave from './useWave';

export interface WaveProps {
  // 是否开启波纹
  disabled?: boolean;
  // 子节点
  children?: React.ReactNode;
}

const Wave: React.FC<WaveProps> = (props) => {
  const { children, disabled } = props;
  const { getPrefixCls } = useContext<ConfigConsumerProps>(ConfigContext);
  // containerRef 将会作为 ref 传递
  const containerRef = useRef<HTMLElement>(null);

  // ============================== Style ===============================
  // prefixCls：ant-wave
  const prefixCls = getPrefixCls('wave');
  const [, hashId] = useStyle(prefixCls);

  // =============================== Wave ===============================
  // Wave 节点渲染 hook
  const showWave = useWave(containerRef, classNames(prefixCls, hashId));

  // ============================== Effect ==============================
  // useEffect 是异步宏任务，在当前事件循环执行完毕（render）后，在下一轮事件循环中执行
  // 在 render 之后，containerRef 已经作为 ref 返回给调用者了
  // 所以在 useEffect 执行时，containerRef.current 中能取到调用者 ref
  React.useEffect(() => {
    const node = containerRef.current;
    // console.log(node);
    if (!node || node.nodeType !== 1 || disabled) {
      return;
    }

    // nodeType enum
    //
    // Node.ELEMENT_NODE                  1     一个 元素 节点，例如 <p> 和 <div>
    // Node.ATTRIBUTE_NODE                2     元素 的耦合 属性
    // Node.TEXT_NODE                     3     Element 或者 Attr 中实际的 文字
    // Node.CDATA_SECTION_NODE            4     一个 CDATASection，例如 <!CDATA[[ … ]]>
    // Node.PROCESSING_INSTRUCTION_NODE   7     一个用于 XML 文档的 ProcessingInstruction (en-US) ，例如 <?xml-stylesheet ... ?> 声明
    // Node.COMMENT_NODE                  8     一个 Comment 节点
    // Node.DOCUMENT_NODE                 9     一个 Document 节点
    // Node.DOCUMENT_TYPE_NODE            10    描述文档类型的 DocumentType 节点。例如 <!DOCTYPE html> 就是用于 HTML5 的
    // Node.DOCUMENT_FRAGMENT_NODE        11    一个 DocumentFragment 节点

    // Click handler
    const onClick = (e: MouseEvent) => {
      // Fix radio button click twice
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        !isVisible(e.target as HTMLElement) ||
        // No need wave
        !node.getAttribute ||
        node.getAttribute('disabled') ||
        (node as HTMLInputElement).disabled ||
        node.className.includes('disabled') ||
        node.className.includes('-leave')
      ) {
        return;
      }

      // 调用 Wave hook 来 show Wave
      showWave();
    };

    // console.log(node);

    // Bind events
    node.addEventListener('click', onClick, true);
    return () => {
      node.removeEventListener('click', onClick, true);
    };
  }, [disabled]);

  // ============================== Render ==============================
  if (!React.isValidElement(children)) {
    return (children ?? null) as unknown as React.ReactElement;
  }

  // 合并原节点的 ref 和 containerRef
  const ref = supportRef(children) ? composeRef((children as any).ref, containerRef) : containerRef;

  // 等价于 return cloneElement(children, { ref: ref });
  // 将合并后的 ref 作为参数克隆原来的 children
  // 如果是来自 button.tsx 的调用，则以此前生成的 buttonNode，加上当前的 ref，克隆出一个新的节点返回给调用者
  // 这个新的节点就是 <Wave /> 包装过的节点
  // containerRef 会作为新节点的 ref 参数传递，其指向该新节点
  // 在点击新的节点时，触发 onClick 事件，其调用 useWave hook，在其中 nodeRef.current 就能引用到该节点
  return cloneElement(children, { ref });
};

if (process.env.NODE_ENV !== 'production') {
  Wave.displayName = 'Wave';
}

export default Wave;
