/* eslint-disable react/button-has-type */
import classNames from 'classnames';
import omit from 'rc-util/lib/omit';
import * as React from 'react';
import warning from '../_util/warning';
import Wave from '../_util/wave';
import { ConfigContext } from '../config-provider';
import DisabledContext from '../config-provider/DisabledContext';
import SizeContext from '../config-provider/SizeContext';
import { useCompactItemContext } from '../space/Compact';
import LoadingIcon from './LoadingIcon';
import Group, { GroupSizeContext } from './button-group';
import { isTwoCNChar, isUnBorderedButtonType, spaceChildren } from './buttonHelpers';
import useStyle from './style';

import type { SizeType } from '../config-provider/SizeContext';
import type { ButtonHTMLType, ButtonShape, ButtonType } from './buttonHelpers';

export type LegacyButtonType = ButtonType | 'danger';

export function convertLegacyProps(type?: LegacyButtonType): ButtonProps {
  if (type === 'danger') {
    return { danger: true };
  }
  return { type };
}

// type?: ButtonType                    ? 表示可选参数，在传参时可以不传
// type: ButtonType | undefined | null  这种情况下，type 必须传，即使是 undefined 或 null
export interface BaseButtonProps {
  type?: ButtonType;
  icon?: React.ReactNode;
  shape?: ButtonShape;
  size?: SizeType;
  disabled?: boolean;
  loading?: boolean | { delay?: number };
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  ghost?: boolean;
  danger?: boolean;
  block?: boolean;
  children?: React.ReactNode;
}

export type AnchorButtonProps = {
  href: string;
  target?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
} & BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement | HTMLButtonElement>, 'type' | 'onClick'>;

export type NativeButtonProps = {
  htmlType?: ButtonHTMLType;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
} & BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'onClick'>;

export type ButtonProps = Partial<AnchorButtonProps & NativeButtonProps>;

type CompoundedComponent = React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<HTMLElement>
> & {
  Group: typeof Group;
  /** @internal */
  __ANT_BUTTON: boolean;
};

type Loading = number | boolean;

type LoadingConfigType = {
  loading: boolean;
  delay: number;
};

// 获取 loading 配置
function getLoadingConfig(loading: BaseButtonProps['loading']): LoadingConfigType {
  // loading?: boolean | { delay?: number };
  if (typeof loading === 'object' && loading) {
    // 如果 loading 为 object，即传参为 { delay?: number } 时
    const delay = loading?.delay;
    // 这里的类型判断很严谨
    const isDelay = !Number.isNaN(delay) && typeof delay === 'number';
    return {
      loading: false,
      delay: isDelay ? delay : 0,
    };
  }

  return {
    // !! 将操作变量转为 bool 值
    // 如果操作变量为非空对象、非空字符串、大于 0 等真值时，返回 true
    loading: !!loading,
    delay: 0,
  };
}

// 形参中能取到 ref，是因为 ForwardRef
const InternalButton: React.ForwardRefRenderFunction<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
> = (props, ref) => {
  const {
    loading = false,
    prefixCls: customizePrefixCls,
    type = 'default',
    danger,
    shape = 'default',
    size: customizeSize,
    disabled: customDisabled,
    className,
    rootClassName,
    children,
    icon,
    ghost = false,
    block = false,
    // React does not recognize the `htmlType` prop on a DOM element. Here we pick it out of `rest`.
    htmlType = 'button',
    ...rest
  } = props;

  const { getPrefixCls, autoInsertSpaceInButton, direction } = React.useContext(ConfigContext);
  // 获取 button 的 css 类名前缀
  const prefixCls = getPrefixCls('btn', customizePrefixCls);

  const [wrapSSR, hashId] = useStyle(prefixCls);

  // SizeContext 上下文，为了取上下文中配置的统一 size
  const size = React.useContext(SizeContext);
  // DisabledContext 上下文，为了取上下文中配置的统一 disabled
  const disabled = React.useContext(DisabledContext);
  // ??: const mergedDisabled = customDisabled ? customDisabled : disabled;
  const mergedDisabled = customDisabled ?? disabled;

  const groupSize = React.useContext(GroupSizeContext);
  // loading 状态
  const loadingOrDelay: LoadingConfigType = React.useMemo(
    () => getLoadingConfig(loading),
    [loading],
  );
  const [innerLoading, setLoading] = React.useState<Loading>(loadingOrDelay.loading);
  // 按钮的内容是否是两个汉字，如“提交”
  const [hasTwoCNChar, setHasTwoCNChar] = React.useState(false);
  const buttonRef = (ref as any) || React.createRef<HTMLAnchorElement | HTMLButtonElement>();

  // 是否需要在两个汉字的按钮的两个汉字间插入间距
  // 条件：子 DOM 只有一个（即两个汉字组成的文本）、不带图标、不是无边框按钮
  const isNeedInserted = () =>
    React.Children.count(children) === 1 && !icon && !isUnBorderedButtonType(type);

  const fixTwoCNChar = () => {
    // FIXME: for HOC usage like <FormatMessage />
    if (!buttonRef || !buttonRef.current || autoInsertSpaceInButton === false) {
      return;
    }
    const buttonText = buttonRef.current.textContent;
    if (isNeedInserted() && isTwoCNChar(buttonText)) {
      // 需要插入且为两个汉字
      // 如果 hasTwoCNChar 未设为 true，则调用 set
      // 减少重复渲染
      if (!hasTwoCNChar) {
        setHasTwoCNChar(true);
      }
    } else if (hasTwoCNChar) {
      // 不需插入，且 hasTwoCNChar 已置为 true
      // 重新置为 false
      setHasTwoCNChar(false);
    }
  };

  // 对 loadingOrDelay 的处理
  React.useEffect(() => {
    let delayTimer: number | null = null;

    if (loadingOrDelay.delay > 0) {
      // delay 大于 0，进行 dalay 的处理
      // dalay ms 后将 loading 置为 true
      delayTimer = window.setTimeout(() => {
        delayTimer = null;
        setLoading(true);
      }, loadingOrDelay.delay);
    } else {
      // delay 为 0，直接置为 loading
      setLoading(loadingOrDelay.loading);
    }

    // 清除计时器
    function cleanupTimer() {
      if (delayTimer) {
        window.clearTimeout(delayTimer);
        delayTimer = null;
      }
    }

    // 组件卸载前清除计时器
    return cleanupTimer;
  }, [loadingOrDelay]);

  // 对 buttonRef 的处理，并且监听其变化
  React.useEffect(fixTwoCNChar, [buttonRef]);

  // 处理点击事件
  const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent>) => {
    const { onClick } = props;
    // FIXME: https://github.com/ant-design/ant-design/issues/30207
    if (innerLoading || mergedDisabled) {
      e.preventDefault();
      return;
    }
    (onClick as React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>)?.(e);
  };

  warning(
    !(typeof icon === 'string' && icon.length > 2),
    'Button',
    `\`icon\` is using ReactNode instead of string naming in v4. Please check \`${icon}\` at https://ant.design/components/icon`,
  );

  warning(
    !(ghost && isUnBorderedButtonType(type)),
    'Button',
    "`link` or `text` button can't be a `ghost` button.",
  );

  // 在 hasTwoCNChar 为 true 的情况下，是否需要自动插入
  // autoInsertSpaceInButton 默认为 undefined，故 autoInsertSpace 为 true
  const autoInsertSpace = autoInsertSpaceInButton !== false;
  // 全局的紧凑尺寸上下文
  const { compactSize, compactItemClassnames } = useCompactItemContext(prefixCls, direction);

  // size 名称转换，全称转 classname 简称
  const sizeClassNameMap = { large: 'lg', small: 'sm', middle: undefined };
  const sizeFullname = compactSize || groupSize || customizeSize || size;
  const sizeCls = sizeFullname ? sizeClassNameMap[sizeFullname] || '' : '';

  // 如果 loading 状态为 true，则将 iconType 置为 loading
  // 任何 state 更新时都会重新计算
  const iconType = innerLoading ? 'loading' : icon;

  // 获取 link 型 button 属性
  const linkButtonRestProps = omit(rest as AnchorButtonProps & { navigate: any }, ['navigate']);

  const hrefAndDisabled = linkButtonRestProps.href !== undefined && mergedDisabled;

  // 组织 button 的类名
  const classes = classNames(
    prefixCls,
    hashId,
    {
      [`${prefixCls}-${shape}`]: shape !== 'default' && shape,
      [`${prefixCls}-${type}`]: type,
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-icon-only`]: !children && children !== 0 && !!iconType,
      [`${prefixCls}-background-ghost`]: ghost && !isUnBorderedButtonType(type),
      [`${prefixCls}-loading`]: innerLoading,
      [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && autoInsertSpace && !innerLoading,
      [`${prefixCls}-block`]: block,
      [`${prefixCls}-dangerous`]: !!danger,
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [`${prefixCls}-disabled`]: hrefAndDisabled,
    },
    compactItemClassnames,
    className,
    rootClassName,
  );

  // 对 icon 进行处理
  // 存在 icon 且 loading 为 false 时，直接返回 icon
  // 否则，处理后返回
  const iconNode =
    icon && !innerLoading ? (
      icon
    ) : (
      <LoadingIcon existIcon={!!icon} prefixCls={prefixCls} loading={!!innerLoading} />
    );

  // 对 button 的child 进行处理
  // <Button>{child}</Button>
  const kids =
    children || children === 0
      ? spaceChildren(children, isNeedInserted() && autoInsertSpace)
      : null;

  // 如果 href 属性存在，返回的是一个 a 标签
  // 无论 type 是否是 link 类型的
  if (linkButtonRestProps.href !== undefined) {
    return wrapSSR(
      <a {...linkButtonRestProps} className={classes} onClick={handleClick} ref={buttonRef}>
        {iconNode}
        {kids}
      </a>,
    );
  }

  // 构建原生 button 组件
  let buttonNode = (
    <button
      {...(rest as NativeButtonProps)}
      type={htmlType}
      className={classes}
      onClick={handleClick}
      disabled={mergedDisabled}
      ref={buttonRef}
    >
      {iconNode}
      {kids}
    </button>
  );

  // 对存在 border 的按钮类型进行波纹处理处理
  // 波纹处理：点击后 border 外会有一圈波纹
  if (!isUnBorderedButtonType(type)) {
    buttonNode = <Wave disabled={!!innerLoading}>{buttonNode}</Wave>;
  }

  return wrapSSR(buttonNode);
};

// React.forwardRef 使得对外暴露 Button 组件能接收 ref 并转发给 InternalButton
// CompoundedComponent：复合组件
const Button = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  InternalButton,
) as CompoundedComponent;

if (process.env.NODE_ENV !== 'production') {
  Button.displayName = 'Button';
}

Button.Group = Group;
Button.__ANT_BUTTON = true;

export default Button;
