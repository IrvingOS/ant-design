import classNames from 'classnames';
import * as React from 'react';
import warning from '../_util/warning';
import { ConfigContext } from '../config-provider';
import type { SizeType } from '../config-provider/SizeContext';
import { useToken } from '../theme/internal';

export interface ButtonGroupProps {
  size?: SizeType;
  style?: React.CSSProperties;
  className?: string;
  prefixCls?: string;
  children?: React.ReactNode;
}

// group size 上下文
export const GroupSizeContext = React.createContext<SizeType | undefined>(undefined);

const ButtonGroup: React.FC<ButtonGroupProps> = (props) => {
  const { getPrefixCls, direction } = React.useContext(ConfigContext);

  const { prefixCls: customizePrefixCls, size, className, ...others } = props;
  const prefixCls = getPrefixCls('btn-group', customizePrefixCls);

  const [, , hashId] = useToken();

  let sizeCls = '';

  // 解析 size classname
  switch (size) {
    case 'large':
      sizeCls = 'lg';
      break;
    case 'small':
      sizeCls = 'sm';
      break;
    case 'middle':
    case undefined:
      break;
    default:
      warning(!size, 'Button.Group', 'Invalid prop `size`.');
  }

  // 组织 group 的类名
  const classes = classNames(
    prefixCls,
    {
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-rtl`]: direction === 'rtl',
    },
    className,
    hashId,
  );

  return (
    // 将 Group 组件参数 size 绑定在 GroupSizeContext 上下文
    <GroupSizeContext.Provider value={size}>
      <div {...others} className={classes} />
    </GroupSizeContext.Provider>
  );
};

export default ButtonGroup;
