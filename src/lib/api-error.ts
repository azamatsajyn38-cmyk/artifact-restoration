/**
 * Классифицирует ошибки AI-сервисов и возвращает правильный HTTP-статус
 * вместо generic 500.
 */
export function classifyApiError(error: unknown): { status: number; message: string } {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();

  // Провайдер не настроен (нет ключа, выключен)
  if (lower.includes("не настроен") || lower.includes("должен указать")) {
    return { status: 503, message: msg };
  }

  // Шаблон не найден
  if (lower.includes("шаблон промпта") && lower.includes("не найден")) {
    return { status: 503, message: msg };
  }

  // Квота / rate limit
  if (lower.includes("quota") || lower.includes("квота") || lower.includes("rate limit") || lower.includes("429") || lower.includes("too many requests")) {
    return { status: 429, message: msg };
  }

  // Невалидный ключ / нет доступа / нет кредитов
  if (lower.includes("key not valid") || lower.includes("invalid api key") || lower.includes("invalid_api_key") || lower.includes("permission") || lower.includes("credits") || lower.includes("licenses") || lower.includes("unauthorized") || lower.includes("403") || lower.includes("401")) {
    return { status: 403, message: msg };
  }

  // Таймаут / сеть
  if (lower.includes("timeout") || lower.includes("fetch failed") || lower.includes("econnrefused") || lower.includes("etimedout") || lower.includes("enetunreach")) {
    return { status: 502, message: "Не удалось подключиться к AI-сервису. Проверьте сетевое соединение." };
  }

  // Ошибка парсинга ответа
  if (lower.includes("failed to parse") || lower.includes("json") || lower.includes("unexpected token")) {
    return { status: 502, message: "AI-сервис вернул некорректный ответ. Попробуйте ещё раз." };
  }

  // Всё остальное
  return { status: 500, message: msg || "Неизвестная ошибка сервера" };
}
