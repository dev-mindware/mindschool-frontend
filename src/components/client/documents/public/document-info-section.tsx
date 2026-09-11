import { User, Building2 } from "lucide-react";

type Props = {
    title: string;
    name: string;
    location?: string;
    taxNumber?: string;
    icon: "user" | "building";
};

export function DocumentInfoSection({
    title,
    name,
    location,
    taxNumber,
    icon,
}: Props) {
    const Icon = icon === "user" ? User : Building2;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase">
                <Icon className="w-3 h-3" />
                <span>{title}</span>
            </div>
            <div>
                <h3 className="font-semibold text-base">{name}</h3>
                {location && <p className="text-sm text-muted-foreground">{location}</p>}
                {taxNumber && (
                    <p className="text-xs text-muted-foreground mt-1">
                        NIF: {taxNumber}
                    </p>
                )}
            </div>
        </div>
    );
}
