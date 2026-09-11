import { Icon } from "@/components";
import { Button, Card, CardContent } from "@/components/ui";
import Image from "next/image";

type Props = {
  refetch: () => void;
  message?: string;
};

export function RequestError({ refetch, message }: Props) {
  return (
    <Card className="p-8 mt-4">
      <CardContent className="space-y-6 flex flex-col items-center justify-center">
        <Image
          src="/error-req.svg"
          alt="Error request"
          width={250}
          height={250}
          priority
        />
        <h2 className="text-xl font-semibold text-foreground">
          {message
            ? message
            : "Ocorreu um erro ao carregar os dados do servidor."}
        </h2>
        <Button
          className="bg-background w-max px-4 transition-colors text-foreground"
          onClick={() => refetch()}
        >
          <Icon name="RefreshCcw" size={20} />
          Tentar novamente
        </Button>
      </CardContent>
    </Card>
  );
}
