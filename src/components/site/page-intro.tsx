import { cn } from "@/lib/utils";

type PageIntroProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageIntro({ title, description, className }: PageIntroProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
