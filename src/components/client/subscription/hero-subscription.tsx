
type HeroSubscriptionProps = {
  title?: string;
  description?: string;
};

export function HeroSubscription({
  description,
  title,
}: HeroSubscriptionProps) {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-foreground mb-4">
        {title ? (
          <span className="text-primary-500">{title}</span>
        ) : (
          <>
            Simplifique a gestão da sua empresa com{" "}
            <span className="text-primary-500">Mindgest</span>
          </>
        )}
      </h1>
      <p className="text-lg text-foreground max-w-3xl mx-auto">
        {description}
      </p>
    </div>
  );
}
