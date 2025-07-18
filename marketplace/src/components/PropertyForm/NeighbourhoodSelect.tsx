
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNeighbourhoods } from '@/hooks/useNeighbourhoods';

interface NeighbourhoodSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const NeighbourhoodSelect = ({ value, onValueChange, placeholder = "Select neighbourhood" }: NeighbourhoodSelectProps) => {
  const { data: neighbourhoods, isLoading } = useNeighbourhoods();
  const [open, setOpen] = React.useState(false);

  const selectedNeighbourhood = neighbourhoods?.find(n => n.id === value);

  return (
    <div>
      <Label htmlFor="neighbourhood">Neighbourhood</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={isLoading}
          >
            {selectedNeighbourhood?.name || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search neighbourhoods..." />
            <CommandList>
              <CommandEmpty>No neighbourhood found.</CommandEmpty>
              <CommandGroup>
                {neighbourhoods?.map((neighbourhood) => (
                  <CommandItem
                    key={neighbourhood.id}
                    value={neighbourhood.name}
                    onSelect={() => {
                      onValueChange(neighbourhood.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === neighbourhood.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {neighbourhood.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NeighbourhoodSelect;
