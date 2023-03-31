import warning from '../_util/warning';

// 从 4.0 开始，antd 不再内置 Icon 组件，请使用独立的包 @ant-design/icons。
const Icon: React.FC = () => {
  warning(false, 'Icon', 'Empty Icon');
  return null;
};

export default Icon;
