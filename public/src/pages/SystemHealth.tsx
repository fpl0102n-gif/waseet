import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthCheck {
  service: string;
  status: 'checking' | 'ok' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function SystemHealth() {
  const { t } = useTranslation();
  const [checks, setChecks] = useState<HealthCheck[]>([
    { service: 'Supabase Connection', status: 'checking', message: 'Testing...' },
    { service: 'Exchange Rates Table', status: 'checking', message: 'Testing...' },
    { service: 'Payment Methods Table', status: 'checking', message: 'Testing...' },
    { service: 'Environment Variables', status: 'checking', message: 'Testing...' },
  ]);

  useEffect(() => {
    runHealthChecks();
  }, []);

  const updateCheck = (service: string, status: HealthCheck['status'], message: string, details?: string) => {
    setChecks(prev => prev.map(check => 
      check.service === service ? { ...check, status, message, details } : check
    ));
  };

  const runHealthChecks = async () => {
    // 1. Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    if (!supabaseUrl || !anonKey || supabaseUrl.includes('YOUR_PROJECT')) {
      updateCheck('Environment Variables', 'error', 'Missing or invalid', 
        'Check .env file for VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY');
      updateCheck('Supabase Connection', 'error', 'Cannot test - env missing', '');
      updateCheck('Exchange Rates Table', 'error', 'Cannot test - env missing', '');
      updateCheck('Payment Methods Table', 'error', 'Cannot test - env missing', '');
      return;
    }
    
    updateCheck('Environment Variables', 'ok', 'Configured', `URL: ${supabaseUrl}`);

    // 2. Test Supabase connection
    try {
      const { error: pingError } = await supabase.from('exchange_rates').select('count').limit(0);
      
      if (pingError) {
        if (pingError.message.includes('relation') || pingError.message.includes('does not exist')) {
          updateCheck('Supabase Connection', 'ok', 'Connected', 'But tables missing - run migrations');
          updateCheck('Exchange Rates Table', 'error', 'Table does not exist', 
            'Run: supabase migration up or execute SQL in Supabase Studio');
        } else {
          updateCheck('Supabase Connection', 'error', 'Connection failed', pingError.message);
        }
      } else {
        updateCheck('Supabase Connection', 'ok', 'Connected', 'REST API responding');
      }
    } catch (err: any) {
      updateCheck('Supabase Connection', 'error', 'Network error', 
        err.message || 'Check proxy settings or run setup-proxy.ps1');
      updateCheck('Exchange Rates Table', 'error', 'Cannot test', 'Connection failed');
      updateCheck('Payment Methods Table', 'error', 'Cannot test', 'Connection failed');
      return;
    }

    // 3. Check exchange_rates table
    try {
      const { data: rates, error: ratesError } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('is_active', true)
        .limit(5);

      if (ratesError) {
        updateCheck('Exchange Rates Table', 'error', 'Query failed', ratesError.message);
      } else if (!rates || rates.length === 0) {
        updateCheck('Exchange Rates Table', 'warning', 'Table empty', 
          'Run seed-exchange-data.sql in Supabase SQL Editor');
      } else {
        updateCheck('Exchange Rates Table', 'ok', `${rates.length} active rates found`, 
          rates.map(r => `${r.currency_from}→${r.currency_to}`).join(', '));
      }
    } catch (err: any) {
      updateCheck('Exchange Rates Table', 'error', 'Unexpected error', err.message);
    }

    // 4. Check exchange_payment_methods table
    try {
      const { data: methods, error: methodsError } = await supabase
        .from('exchange_payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (methodsError) {
        updateCheck('Payment Methods Table', 'error', 'Query failed', methodsError.message);
      } else if (!methods || methods.length === 0) {
        updateCheck('Payment Methods Table', 'warning', 'Table empty', 
          'Run seed-exchange-data.sql in Supabase SQL Editor');
      } else {
        updateCheck('Payment Methods Table', 'ok', `${methods.length} methods found`, 
          methods.map(m => m.method_name).join(', '));
      }
    } catch (err: any) {
      updateCheck('Payment Methods Table', 'error', 'Unexpected error', err.message);
    }
  };

  const getIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'ok':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getBadge = (status: HealthCheck['status']) => {
    const colors = {
      checking: 'bg-blue-100 text-blue-800',
      ok: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
    };
    return <Badge className={colors[status]}>{status.toUpperCase()}</Badge>;
  };

  const allOk = checks.every(c => c.status === 'ok');
  const hasErrors = checks.some(c => c.status === 'error');

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            System Health Check
            {allOk && <CheckCircle className="h-6 w-6 text-green-500" />}
            {hasErrors && <XCircle className="h-6 w-6 text-red-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasErrors && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold mb-2">⚠️ Issues detected</p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Run: <code className="bg-red-100 px-2 py-1 rounded">.\setup-all.ps1</code> to auto-configure</li>
                <li>Check .env file has valid Supabase credentials</li>
                <li>If proxy: run <code className="bg-red-100 px-2 py-1 rounded">.\setup-proxy.ps1</code></li>
                <li>Execute migrations: <code className="bg-red-100 px-2 py-1 rounded">supabase migration up</code></li>
                <li>Seed data: Run seed-exchange-data.sql in Supabase SQL Editor</li>
              </ul>
            </div>
          )}

          {allOk && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">✅ All systems operational</p>
            </div>
          )}

          <div className="space-y-4">
            {checks.map(check => (
              <div key={check.service} className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="mt-0.5">{getIcon(check.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{check.service}</h3>
                    {getBadge(check.status)}
                  </div>
                  <p className="text-sm text-gray-600">{check.message}</p>
                  {check.details && (
                    <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-2 rounded">
                      {check.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Quick Setup:</strong> Run <code className="bg-blue-100 px-2 py-1 rounded">.\setup-all.ps1</code> from project root to auto-configure everything.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
