import dayjs from 'dayjs';

/**
 * 统一日期时间格式化
 * @param value - ISO 日期字符串或 Date 对象
 * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 */
export const formatDateTime = (
  value: string | Date | null | undefined,
  format = 'YYYY-MM-DD HH:mm:ss',
): string => {
  if (!value) return '-';
  return dayjs(value).format(format);
};

/**
 * 仅日期
 */
export const formatDate = (
  value: string | Date | null | undefined,
  format = 'YYYY-MM-DD',
): string => {
  if (!value) return '-';
  return dayjs(value).format(format);
};

/**
 * 截断文本并返回原文用于 Tooltip
 * @param text - 原始文本
 * @param maxLength - 最大长度
 */
export const truncateText = (
  text: string | null | undefined,
  maxLength = 30,
): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
