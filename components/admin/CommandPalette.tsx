"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { navSections } from "./SideNav";

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type CommandEntry = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const buildCommandGroups = () => {
  return navSections.map((section) => ({
    heading: section.title,
    commands: section.items.flatMap((item) => {
      if ("href" in item) {
        return [{ label: item.label, href: item.href, icon: item.icon }];
      }

      return item.children.map((child) => ({
        label: `${item.label} · ${child.label}`,
        href: child.href,
        icon: item.icon,
      }));
    }),
  }));
};

const commandGroups = buildCommandGroups();

const CommandPalette = ({ open, setOpen }: CommandPaletteProps) => {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden max-w-xl  p-2 pt-10  shadow-2xl">
        <Command className=" p-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 max-w-xl">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {commandGroups.map((group) => (
              <CommandGroup key={group.heading} heading={group.heading}>
                {group.commands.map((command) => {
                  const Icon = command.icon;
                  return (
                    <CommandItem
                      key={command.href}
                      value={command.label}
                      onSelect={() => {
                        runCommand(() => router.push(command.href));
                      }}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{command.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default CommandPalette;