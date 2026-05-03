import { useState } from 'react';
import { Search, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { nationalities, destinations } from '@/data/travelRequirements';

type CountryComboboxProps = {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
};

const CountryCombobox = ({ value, onChange, options, placeholder }: CountryComboboxProps) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className="w-full flex items-center justify-between rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all text-right"
        >
          <span className={cn(!selected && 'text-muted-foreground')}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="w-4 h-4 opacity-50 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            const opt = options.find((o) => o.value === itemValue);
            if (!opt) return 0;
            return opt.label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="חפש מדינה..." />
          <CommandList>
            <CommandEmpty>לא נמצאו תוצאות</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.value}
                  onSelect={(v) => {
                    onChange(v);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('w-4 h-4 ml-2', value === o.value ? 'opacity-100' : 'opacity-0')} />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

type Props = {
  onSearch: (nationality: string, destination: string) => void;
  loading?: boolean;
};

const TravelSearchForm = ({ onSearch, loading }: Props) => {
  const [nationality, setNationality] = useState('IL');
  const [destination, setDestination] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nationality && destination && nationality !== destination) {
      onSearch(nationality, destination);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative z-20 px-4">
      <div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              🛂 לאום (מדינת הדרכון)
            </label>
            <CountryCombobox
              value={nationality}
              onChange={setNationality}
              options={nationalities}
              placeholder="בחר לאום..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              ✈️ יעד נסיעה
            </label>
            <CountryCombobox
              value={destination}
              onChange={setDestination}
              options={destinations}
              placeholder="בחר יעד..."
            />
          </div>
        </div>
        {nationality && destination && nationality === destination && (
          <p className="text-destructive text-sm mb-4 text-center">הלאום והיעד לא יכולים להיות זהים</p>
        )}
        <Button
          type="submit"
          disabled={loading || !nationality || !destination || nationality === destination}
          className="w-full gradient-primary text-primary-foreground py-3 text-lg font-medium rounded-xl transition-all disabled:opacity-40 shadow-glow"
        >
          <Search className="w-5 h-5 ml-2" />
          {loading ? 'בודק דרישות...' : 'בדוק דרישות'}
        </Button>
      </div>
    </form>
  );
};

export default TravelSearchForm;