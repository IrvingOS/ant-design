import { useLocale as useDumiLocale } from 'dumi';

export interface LocaleMap<Key extends string> {
  cn: Record<Key, string>;
  en: Record<Key, string>;
}

// useLocale hoook 供文档根据语言环境选择对应的文本内容
export default function useLocale<Key extends string>(
  localeMap?: LocaleMap<Key>,
): [Record<Key, string>, 'cn' | 'en'] {
  // dumi 文档工具基于 umi 构建
  // 这里的 useDumiLocale 实际是 umi 提供的 useLocale hook
  const { id } = useDumiLocale();
  // 根据 locale 返回 LocaleMap 对应的文本内容
  const localeType = id === 'zh-CN' ? 'cn' : 'en';
  return [localeMap?.[localeType], localeType];
}
