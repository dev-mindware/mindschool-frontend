"use client";

import {
  Icon,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  PlansPageSkeleton,
} from "@/components";
import { Plan } from "@/types";
import { useAuth, usePlans } from "@/hooks";
import { useCurrentPlanStore } from "@/stores";
import {
  formatCurrency,
  getPlanFeatures,
} from "@/utils";
import { PlanInclusionFeatures } from "./plan-inclusion-features";
import { useRouter } from "next/navigation";

export function AvailablePlans() {
  const router = useRouter();
  const { user, subscriptionStatus } = useAuth();
  const { plans, isLoading } = usePlans();
  const { setCurrentPlanSelected } = useCurrentPlanStore();

  const currentPlan = user?.company?.subscription.plan;
  const isCurrentPlan = (plan: Plan) => plan.id === currentPlan?.id;

  function onHandlerChoosePlan(plan: Plan) {
    setCurrentPlanSelected(plan);
    router.push("/checkout");
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16" data-tour="plans-header">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Escolha o Plano Ideal para o Seu Negócio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Otimize a gestão do seu negócio com nossas soluções completas.
            Escolha o plano que melhor se adapta às suas necessidades.
          </p>
        </div>

        {isLoading ? (
          <PlansPageSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-tour="plans-grid">
              {plans.map((plan, index) => {
                const isPopular = index === 1;
                const isCurrent = isCurrentPlan(plan);
                const features: string[] = getPlanFeatures(plan);

                return (
                  <Card
                    key={plan.id}
                    className={`relative border-border rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl ${isPopular
                      ? "border-2 border-primary-500 bg-primary-300/5 shadow-2xl scale-105"
                      : "border border-border bg-card"
                      }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary-500 text-white px-4 py-1 shadow-lg">
                          <Icon name="Star" className="h-3 w-3 mr-1" />
                          Mais Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold mb-2">
                        {plan.name}
                      </CardTitle>
                      <div className="text-4xl font-bold text-primary-600 mb-2">
                        {formatCurrency(Number(plan.priceMonthly))}
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <ul className="space-y-3">
                        {features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-3"
                          >
                            <div className="mt-0.5">
                              <Icon
                                name="Check"
                                className="h-5 w-5 text-green-600 flex-shrink-0"
                              />
                            </div>
                            <span className="text-sm text-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="pt-6">
                      <Button
                        size="lg"
                        className="w-full"
                        disabled={isCurrent && subscriptionStatus !== "TRIALING"}
                        variant={isPopular ? "default" : "outline"}
                        onClick={() => onHandlerChoosePlan(plan)}
                      >
                        {isCurrent && subscriptionStatus !== "TRIALING"
                          ? "Plano actual"
                          : `Escolher ${plan.name}`}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <PlanInclusionFeatures />
          </>
        )}
      </div>
    </div>
  );
}
