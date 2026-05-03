import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { nationalities, destinations } from '@/data/travelRequirements';

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
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              required
            >
              <option value="">בחר לאום...</option>
              {nationalities.map((n) => (
                <option key={n.value} value={n.value}>{n.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              ✈️ יעד נסיעה
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              required
            >
              <option value="">בחר יעד...</option>
              {destinations.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
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