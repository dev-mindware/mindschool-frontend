import { Icon } from "@/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { TopTenProds } from "./charts/top-ten-prods";
import { TrendTime } from "./charts/trend-time";
import { TopTrend } from "./charts/top-trend";
import { AIAlerts } from "./ai-alerts";

export function InventoryDashboard() {
  return (
    <div className="p-6 space-y-6 bg-background">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens em stock
            </CardTitle>
            <Badge variant="secondary" className="text-green-600 bg-green-50">
              <Icon name="TrendingUp" className="w-3 h-3 mr-1" />
              +120%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">10.000</div>
            <div className="flex items-center mt-1 text-muted-foreground">
              <span className="text-lg">Stock elevado</span>
              <Icon name="TrendingUp" className="ml-1" size={14} />
            </div>
            <p className="text-md text-muted-foreground">
              Tendência de crescimento de negócio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items com Stock crítico
            </CardTitle>
            <Badge variant="destructive" className="text-red-600 bg-red-50">
              <Icon name="TrendingDown" className="w-3 h-3 mr-1" />
              -0.01%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">26</div>
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <span className="text-lg">Queda leve</span>
              <Icon name="TrendingDown" className="ml-1" size={14} />
            </div>
            <p className="text-md text-muted-foreground">
              Por preocupação cuide dessa queda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Items sem movimento
            </CardTitle>
            <Select defaultValue="1h">
              <SelectTrigger className="w-16 h-6 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1h</SelectItem>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="7d">7d</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="-mt-4">
            <div className="text-2xl font-bold">170</div>
            <div className="mt-2">
              <p className="mb-2 text-xs font-medium">Principais items:</p>
              <div className="space-y-1">
                <div className="flex items-center text-xs">
                  <div className="w-2 h-2 mr-2 bg-orange-400 rounded-full"></div>
                  <span>Auriculares com fio - 20</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-2 h-2 mr-2 bg-red-500 rounded-full"></div>
                  <span>Consoles PS2 - 21</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-2 h-2 mr-2 bg-red-600 rounded-full"></div>
                  <span>Óculos de Sol - 24</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-2 h-2 mr-2 bg-red-700 rounded-full"></div>
                  <span>Montaria de Amendoim - 45</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="font-medium text-md text-muted-foreground">
              Valor do total do Stock
            </CardTitle>
            <Badge variant="secondary" className="text-green-600 bg-green-50">
              <Icon name="TrendingUp" className="w-3 h-3 mr-1" />
              +5.5%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">52.056.450,00 KZ</div>
            <div className="flex items-center mt-1 text-muted-foreground">
              <span className="text-lg">Quantia Habitual</span>
              <Icon name="TrendingUp" className="ml-2" size={14} />
            </div>
            <p className="text-md text-muted-foreground">
              Atenta às projeções de crescimento
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <TopTenProds />
        </div>

        <div className="lg:col-span-1">
          <AIAlerts />
        </div>

        <div className="lg:col-span-1">
          <TrendTime />
        </div>
      </div>
      <div className="">
        <TopTrend />
      </div>
    </div>
  );
}
