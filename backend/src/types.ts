/**
 * Типы сообщений между потоками
 */
export enum ThreadMessageTypes {
  OnEsbNotification,
  OnExclusionsChanged,
}

/**
 * Сообщение между потоками приложения
 */
export interface ThreadMessage {
  type: ThreadMessageTypes;
  data?: unknown;
}
