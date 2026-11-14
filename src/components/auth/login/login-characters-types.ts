export type LoginFocusTarget = "idle" | "email" | "password" | "totp";

export type LoginSceneReaction = "idle" | "error" | "submitting" | "success";

export interface NormalizedPointer {
  /** Posição horizontal normalizada no intervalo [-1, 1]. */
  x: number;
  /** Posição vertical normalizada no intervalo [-1, 1]. */
  y: number;
  /** Indica se o cursor está ativo dentro do palco/ecrã de login. */
  active: boolean;
}

export interface LoginCharactersSceneProps {
  focusTarget: LoginFocusTarget;
  passwordVisible: boolean;
  reaction: LoginSceneReaction;
  typingLength?: number;
  pointer: NormalizedPointer;
  entered: boolean;
  className?: string;
}

