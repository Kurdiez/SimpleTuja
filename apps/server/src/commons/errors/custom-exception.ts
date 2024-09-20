export class CustomException extends Error {
  readonly cause?: unknown;
  readonly code?: unknown;
  readonly context?: { [key: string]: unknown };
  readonly createdAt: Date;

  constructor(
    message: string,
    {
      error,
      code,
      ...context
    }: { error?: unknown; code?: unknown; [key: string]: unknown } = {},
  ) {
    super(message);
    this.name = CustomException.name;
    this.cause = error;
    this.code = code;
    this.context = context;
    this.createdAt = new Date();
  }
}

export const getErrorMessages = (
  error: unknown,
  _messages?: string[],
): string[] => {
  const messages = _messages ?? [];
  if (error instanceof CustomException) {
    messages.push(`${error.name}: ${error.message}`);
    if (error.cause) {
      getErrorMessages(error.cause, messages);
    }
  } else if (error instanceof Error) {
    messages.push(error.stack ?? `${error.name}: ${error.message}`);
  }
  return messages;
};
