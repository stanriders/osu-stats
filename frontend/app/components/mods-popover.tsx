import { Tooltip } from "radix-ui";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Mods, type Mod } from "~/lib/mods";

export default function ModsPopover({
  ruleset,
  name,
  modsState,
  modButtonHandler,
}: {
  ruleset: number | null;
  name: string;
  modsState: Array<Mod>;
  modButtonHandler: (mod: Mod) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={modsState.length > 0 ? "secondary" : "outline"}>
          <span>{name}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-170 min-w-100" align="center">
        {Mods.filter((x) =>
          ruleset != null
            ? x.types.some((m) => m.rulesets.indexOf(ruleset) != -1)
            : true,
        ).map((category) => {
          return (
            <div key={category.name} className="flex w-full items-center">
              <div className={`px-2 ${category.color} min-w-26`}>
                {category.name}
              </div>
              <div className="flex flex-wrap">
                {category.types
                  .filter((x) =>
                    ruleset != null ? x.rulesets.indexOf(ruleset) != -1 : true,
                  )
                  .map((mod) => {
                    return (
                      <div key={mod.acronym}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <Button
                              className="w-12"
                              variant={
                                modsState.some((x) => x.acronym === mod.acronym)
                                  ? "secondary"
                                  : "outline"
                              }
                              onClick={() => modButtonHandler(mod)}
                            >
                              {mod.acronym}
                            </Button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              sideOffset={1}
                              className="z-100 bg-card px-2 py-1 text-xs text-card-foreground shadow-xs ring-1 ring-foreground/10"
                            >
                              {mod.name}
                              <Tooltip.Arrow className="fill-foreground" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
