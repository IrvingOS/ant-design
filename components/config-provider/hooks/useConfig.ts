import { useContext } from 'react';
import DisabledContext from '../DisabledContext';
import SizeContext from '../SizeContext';

function useConfig() {
  // componentDisabled、componentSize 均从全局上下文中取得
  const componentDisabled = useContext(DisabledContext);
  const componentSize = useContext(SizeContext);

  return {
    componentDisabled,
    componentSize,
  };
}

export default useConfig;
