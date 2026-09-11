import {
  Icon,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components";

export function CashOpeningNotification() {
  const notifications = [
    {
      id: 1,
      message:
        "O Caixa nº04 solicitou abertura de caixa para começar com as atividades",
      time: "2 min",
    },
    {
      id: 2,
      message:
        "O Caixa nº03 solicitou abertura de caixa para começar com as atividades",
      time: "10 min",
    },
    {
      id: 3,
      message:
        "O Caixa nº02 solicitou abertura de caixa para começar com as atividades",
      time: "12 min",
    },
    {
      id: 4,
      message: "O Caixa nº07 solicitou fechamento de caixa",
      time: "15 min",
    },
    {
      id: 5,
      message: "O Caixa nº05 solicitou pausa no expediente",
      time: "20 min",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Pedido de abertura de caixa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-background"
          >
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-accent">
              <Icon name="Bell" className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">{notification.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {notification.time}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <Icon name="Ellipsis" className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
