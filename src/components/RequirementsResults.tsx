import { Shield, FileText, Syringe, Heart, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import type { TravelRequirements, DocumentRequirement } from '@/data/travelRequirements';

type Props = {
  data: TravelRequirements;
};

const iconMap: Record<DocumentRequirement['type'], React.ReactNode> = {
  passport: <Shield className="w-5 h-5" />,
  visa: <FileText className="w-5 h-5" />,
  vaccination: <Syringe className="w-5 h-5" />,
  insurance: <Heart className="w-5 h-5" />,
  document: <FileText className="w-5 h-5" />,
};

const typeLabel: Record<DocumentRequirement['type'], string> = {
  passport: 'דרכון',
  visa: 'ויזה',
  vaccination: 'חיסון',
  insurance: 'ביטוח',
  document: 'מסמך',
};

const RequirementsResults = ({ data }: Props) => {
  const required = data.documents.filter((d) => d.required);
  const recommended = data.documents.filter((d) => !d.required);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10" dir="rtl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {data.nationality} → {data.destination}
        </h2>
        <p className="text-muted-foreground">{data.visaSummary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">תוקף דרכון נדרש</div>
          <div className="text-lg font-semibold text-foreground">{data.passportValidity}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">סוג ויזה</div>
          <div className="text-lg font-semibold text-foreground">{data.visaType}</div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">מסמכים חובה</h3>
        </div>
        <div className="space-y-3">
          {required.map((doc, i) => (
            <DocumentCard key={i} doc={doc} />
          ))}
        </div>
      </div>

      {recommended.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">מומלצים</h3>
          </div>
          <div className="space-y-3">
            {recommended.map((doc, i) => (
              <DocumentCard key={i} doc={doc} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 p-4 bg-muted rounded-xl text-sm text-muted-foreground text-center">
        ⚠️ המידע מבוסס על מקורות רשמיים אך עשוי להשתנות. מומלץ לבדוק מול שגרירות היעד לפני הנסיעה.
      </div>
    </div>
  );
};

const DocumentCard = ({ doc }: { doc: DocumentRequirement }) => (
  <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
    <div className={`p-2 rounded-lg ${doc.required ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
      {iconMap[doc.type]}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-foreground">{doc.title}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {typeLabel[doc.type]}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{doc.description}</p>
      {doc.source && (
        <div className="mt-2 flex items-center gap-1 text-xs text-primary">
          {doc.sourceUrl ? (
            <a href={doc.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
              <ExternalLink className="w-3 h-3" />
              מקור: {doc.source}
            </a>
          ) : (
            <span>מקור: {doc.source}</span>
          )}
        </div>
      )}
    </div>
  </div>
);

export default RequirementsResults;