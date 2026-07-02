import { Alert } from "@/components/ui/alert";

type AuthMessageProps = {
  error?: string;
  success?: string;
};

export function AuthMessage({ error, success }: AuthMessageProps) {
  const message = error || success;

  if (!message) {
    return null;
  }

  return (
    <Alert
      tone={error ? "danger" : "success"}
      title={error ? "Nao foi possivel concluir a operacao" : "Operacao concluida"}
      description={message}
    />
  );
}
