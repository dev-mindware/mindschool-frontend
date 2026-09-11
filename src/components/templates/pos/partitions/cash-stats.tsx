import { Card, CardContent } from "@/components";

export function CashStats() {
  return (
    <div className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">Cash</h3>
          </div>
          <p className="mb-1 text-2xl font-bold">37.050 Kz</p>
          <p className="text-sm text-muted-foreground/90">
            Referência a notas físicas que entraram
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-muted-foreground">
              Pagamento Eletrônico
            </h3>
          </div>
          <p className="mb-1 text-2xl font-bold">97.050 Kz</p>
          <p className="text-sm text-muted-foreground/90">
            Refere - se ao dinheiro que entrou de forma eletrônica
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center w-full mx-auto mb-4 border-2 rounded-full border-primary/60">
        <div>
          <p className="text-lg font-semibold">Receitas</p>
          <p className="text-xl font-bold text-primary">121.000 Kz</p>
        </div>
      </div>

      <div className="flex items-center justify-center w-full mx-auto mb-4 border-2 rounded-full border-primary/60">
        <div>
          <p className="text-lg font-semibold">Despesas</p>
          <p className="text-xl font-bold text-primary">13.100 Kz</p>
        </div>
      </div>
    </div>
  );
}
