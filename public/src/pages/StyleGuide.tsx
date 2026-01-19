import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const swatches = [
  { name: 'Primary', var: '--primary' },
  { name: 'Secondary', var: '--secondary' },
  { name: 'Accent', var: '--accent' },
  { name: 'Muted', var: '--muted' },
  { name: 'Success', var: '--success' },
  { name: 'Warning', var: '--warning' },
  { name: 'Info', var: '--info' },
  { name: 'Destructive', var: '--destructive' },
];

const typography = [
  { tag: 'h1', text: 'Heading 1', className: 'text-4xl font-extrabold tracking-tight' },
  { tag: 'h2', text: 'Heading 2', className: 'text-3xl font-bold tracking-tight' },
  { tag: 'h3', text: 'Heading 3', className: 'text-2xl font-semibold' },
  { tag: 'h4', text: 'Heading 4', className: 'text-xl font-semibold' },
  { tag: 'p', text: 'Body text paragraph example with medium length.', className: 'text-base leading-relaxed' },
  { tag: 'small', text: 'Caption / Small label', className: 'text-xs text-muted-foreground' },
];

const StyleGuide = () => {
  return (
    <AppLayout>
      <div className="app-shell py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Design System</h1>
            <p className="text-muted-foreground">Unified tokens, components & themes.</p>
          </div>
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Color Palette</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {swatches.map(s => (
              <div key={s.var} className="space-y-2 text-center">
                <div className="h-16 w-full rounded-md shadow-sm border" style={{ backgroundColor: `hsl(var(${s.var}))` }} />
                <div className="text-xs font-medium">{s.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Semantic Tokens</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[{
              name: 'Background', tokens: ['--background', '--card', '--popover']
            }, {
              name: 'Foreground', tokens: ['--foreground', '--muted-foreground', '--primary-foreground']
            }, {
              name: 'Borders', tokens: ['--border', '--input', '--ring']
            }, {
              name: 'Status', tokens: ['--success', '--warning', '--info', '--destructive']
            }, {
              name: 'Motion', tokens: ['--dur-fast', '--dur-medium', '--ease-standard']
            }, {
              name: 'Elevation', tokens: ['--elevation-1', '--elevation-2', '--elevation-3']
            }].map((group, i) => (
              <div key={i} className="rounded-md border border-border/60 p-4 bg-card shadow-sm">
                <h3 className="text-xs font-semibold mb-2 tracking-wide">{group.name}</h3>
                <ul className="space-y-1">
                  {group.tokens.map(tk => (
                    <li key={tk} className="text-[11px] font-mono text-foreground/70">{tk}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Typography Scale</h2>
          <div className="space-y-4">
            {typography.map(t => (
              <div key={t.text} className="border rounded-md p-4 bg-card shadow-sm">
                <div className={t.className}>{t.text}</div>
                <div className="mt-2 text-xs text-muted-foreground">Class: {t.className}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Interactive States</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Button className="group relative overflow-hidden">
              <span className="relative z-10">Hover Gradient</span>
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-primary/20 to-accent/20" />
            </Button>
            <Button variant="outline" className="focus-outline">Focus Ring Demo</Button>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Cards & Elevation</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 shadow-sm">Shadow sm</Card>
            <Card className="p-6 shadow-md">Shadow md</Card>
            <Card className="p-6 shadow-lg">Shadow lg</Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Themes</h2>
          <p className="text-sm text-muted-foreground mb-4">Preview palette overrides (Emerald, Blue, Purple, Orange).</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {['default', 'emerald', 'blue', 'purple', 'orange'].map(p => (
              <div key={p} className="border rounded-md p-3">
                <div className="font-semibold mb-2">{p}</div>
                <div className="flex flex-col gap-2">
                  <div className="h-8 rounded" style={{ background: `hsl(var(--primary))` }} />
                  <div className="h-8 rounded" style={{ background: `hsl(var(--accent))` }} />
                  <div className="h-8 rounded" style={{ background: `hsl(var(--secondary))` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-xl font-semibold mb-4">Guidelines</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[{
              title: 'Spacing', body: 'Utiliser padding vertical 24–32px pour sections majeures, 16px pour blocs internes.'
            }, {
              title: 'Typography', body: 'Limiter 1–2 familles. Inter pour texte courant, utiliser poids 500–600 pour emphase.'
            }, {
              title: 'Colors', body: 'Toujours employer tokens via hsl(var(--token)); jamais coder en dur les HEX.'
            }].map((g, i) => (
              <div key={i} className="rounded-md border border-border/60 p-4 bg-card shadow-sm">
                <h3 className="text-sm font-semibold mb-2">{g.title}</h3>
                <p className="text-xs text-foreground/70 leading-relaxed">{g.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

export default StyleGuide;
