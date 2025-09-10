'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Database, Users, ArrowRight, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface DatabaseStats {
  architecture: string;
  tableName: string;
  totalContacts: number;
  activeContacts: number;
  contactsWithCustomerId: number;
  recentContacts: number;
  tableExists: boolean;
  lastUpdate?: string;
}

interface ContactSample {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  status: string;
  customerId?: string;
  createdAt: string;
}

interface DiagnosticResults {
  vercelDb: DatabaseStats;
  pgPoolDb: DatabaseStats;
  contactSamples: {
    vercel: ContactSample[];
    pgPool: ContactSample[];
  };
  recommendations: string[];
  migrationNeeded: boolean;
  dataIntegrity: {
    duplicates: number;
    missingCustomerRefs: number;
    orphanedContacts: number;
  };
}

export default function ContactDiagnosticsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);

  // Run comprehensive diagnostic
  const runDiagnostic = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/email-marketing/diagnostic', {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Diagnostic failed: ${response.statusText}`);
      }
      
      const data: DiagnosticResults = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Migrate contacts between databases
  const migrateContacts = async (direction: 'pgToVercel' | 'vercelToPg') => {
    setIsMigrating(true);
    setMigrationProgress(0);
    setMigrationLogs(['Starting migration...']);
    
    try {
      const response = await fetch('/api/email-marketing/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction }),
      });
      
      if (!response.ok) {
        throw new Error(`Migration failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMigrationLogs(prev => [...prev, `Migration completed: ${data.migratedCount} contacts`]);
      setMigrationProgress(100);
      
      // Refresh diagnostic results
      await runDiagnostic();
    } catch (err) {
      setMigrationLogs(prev => [...prev, `Error: ${err instanceof Error ? err.message : 'Unknown error'}`]);
    } finally {
      setIsMigrating(false);
    }
  };

  // Sync databases to keep them aligned
  const syncDatabases = async () => {
    setIsMigrating(true);
    setMigrationLogs(['Starting database sync...']);
    
    try {
      const response = await fetch('/api/email-marketing/sync', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMigrationLogs(prev => [...prev, `Sync completed: ${data.syncedCount} contacts`]);
      
      // Refresh diagnostic results
      await runDiagnostic();
    } catch (err) {
      setMigrationLogs(prev => [...prev, `Error: ${err instanceof Error ? err.message : 'Unknown error'}`]);
    } finally {
      setIsMigrating(false);
    }
  };

  // Auto-run diagnostic on component mount
  useEffect(() => {
    runDiagnostic();
  }, []);

  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Contact Database Diagnostic Tool
          </h1>
          <p className="text-lg text-gray-600">
            Identify and fix contact database architecture conflicts
          </p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Diagnostic Error</AlertTitle>
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4 mb-6">
          <Button 
            onClick={runDiagnostic} 
            disabled={isLoading || isMigrating}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Run Diagnostic
          </Button>
        </div>

        {results && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Database Details</TabsTrigger>
              <TabsTrigger value="samples">Contact Samples</TabsTrigger>
              <TabsTrigger value="migration">Migration Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Vercel Database Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Vercel Postgres DB
                    </CardTitle>
                    <CardDescription>@vercel/postgres architecture</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Table Exists:</span>
                        {results.vercelDb.tableExists ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total Contacts:</span>
                        <Badge variant={results.vercelDb.totalContacts > 0 ? "default" : "secondary"}>
                          {formatNumber(results.vercelDb.totalContacts)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active Contacts:</span>
                        <Badge variant={results.vercelDb.activeContacts > 0 ? "default" : "secondary"}>
                          {formatNumber(results.vercelDb.activeContacts)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Linked to Customers:</span>
                        <Badge variant={results.vercelDb.contactsWithCustomerId > 0 ? "default" : "secondary"}>
                          {formatNumber(results.vercelDb.contactsWithCustomerId)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* PG Pool Database Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      PG Pool DB
                    </CardTitle>
                    <CardDescription>pg Pool architecture</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Table Exists:</span>
                        {results.pgPoolDb.tableExists ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Total Contacts:</span>
                        <Badge variant={results.pgPoolDb.totalContacts > 0 ? "default" : "secondary"}>
                          {formatNumber(results.pgPoolDb.totalContacts)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active Contacts:</span>
                        <Badge variant={results.pgPoolDb.activeContacts > 0 ? "default" : "secondary"}>
                          {formatNumber(results.pgPoolDb.activeContacts)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Recent Contacts:</span>
                        <Badge variant={results.pgPoolDb.recentContacts > 0 ? "default" : "secondary"}>
                          {formatNumber(results.pgPoolDb.recentContacts)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Data Integrity Issues */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      Data Integrity Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {results.dataIntegrity.duplicates}
                        </div>
                        <p className="text-sm text-gray-600">Duplicate Emails</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {results.dataIntegrity.missingCustomerRefs}
                        </div>
                        <p className="text-sm text-gray-600">Missing Customer Links</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {results.dataIntegrity.orphanedContacts}
                        </div>
                        <p className="text-sm text-gray-600">Orphaned Contacts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                {results.recommendations.length > 0 && (
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {results.recommendations.map((recommendation, index) => (
                          <Alert key={index}>
                            <AlertDescription>{recommendation}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vercel Database Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><strong>Architecture:</strong> {results.vercelDb.architecture}</div>
                      <div><strong>Table Name:</strong> {results.vercelDb.tableName}</div>
                      <div><strong>Total Contacts:</strong> {formatNumber(results.vercelDb.totalContacts)}</div>
                      <div><strong>Active Contacts:</strong> {formatNumber(results.vercelDb.activeContacts)}</div>
                      <div><strong>Linked Contacts:</strong> {formatNumber(results.vercelDb.contactsWithCustomerId)}</div>
                      <div><strong>Recent (7 days):</strong> {formatNumber(results.vercelDb.recentContacts)}</div>
                      {results.vercelDb.lastUpdate && (
                        <div><strong>Last Updated:</strong> {new Date(results.vercelDb.lastUpdate).toLocaleString()}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>PG Pool Database Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div><strong>Architecture:</strong> {results.pgPoolDb.architecture}</div>
                      <div><strong>Table Name:</strong> {results.pgPoolDb.tableName}</div>
                      <div><strong>Total Contacts:</strong> {formatNumber(results.pgPoolDb.totalContacts)}</div>
                      <div><strong>Active Contacts:</strong> {formatNumber(results.pgPoolDb.activeContacts)}</div>
                      <div><strong>Recent (7 days):</strong> {formatNumber(results.pgPoolDb.recentContacts)}</div>
                      {results.pgPoolDb.lastUpdate && (
                        <div><strong>Last Updated:</strong> {new Date(results.pgPoolDb.lastUpdate).toLocaleString()}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="samples">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vercel DB Samples</CardTitle>
                    <CardDescription>Recent contacts from @vercel/postgres</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.contactSamples.vercel.length > 0 ? (
                        results.contactSamples.vercel.map((contact, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="font-medium">{contact.email}</div>
                            <div className="text-sm text-gray-600">
                              {contact.firstName || 'No Name'} • {contact.status}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {contact.id} {contact.customerId && `• Customer: ${contact.customerId}`}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-center py-4">No contacts found</div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>PG Pool DB Samples</CardTitle>
                    <CardDescription>Recent contacts from pg Pool</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.contactSamples.pgPool.length > 0 ? (
                        results.contactSamples.pgPool.map((contact, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="font-medium">{contact.email}</div>
                            <div className="text-sm text-gray-600">
                              {contact.firstName || 'No Name'} • {contact.status}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {contact.id}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-center py-4">No contacts found</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="migration">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Migration Tools</CardTitle>
                    <CardDescription>
                      Migrate contacts between database architectures to fix the disconnect
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Migration Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          onClick={() => migrateContacts('pgToVercel')}
                          disabled={isMigrating}
                          className="flex items-center gap-2"
                        >
                          {isMigrating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                          Migrate PG Pool → Vercel
                        </Button>
                        
                        <Button 
                          onClick={() => migrateContacts('vercelToPg')}
                          disabled={isMigrating}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {isMigrating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4 rotate-180" />
                          )}
                          Migrate Vercel → PG Pool
                        </Button>
                        
                        <Button 
                          onClick={syncDatabases}
                          disabled={isMigrating}
                          variant="secondary"
                          className="flex items-center gap-2"
                        >
                          {isMigrating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          Sync Databases
                        </Button>
                      </div>

                      {/* Progress Indicator */}
                      {isMigrating && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span>Migration Progress</span>
                            <span>{migrationProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${migrationProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Migration Logs */}
                      {migrationLogs.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Migration Logs</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-64 overflow-y-auto">
                              {migrationLogs.map((log, index) => (
                                <div key={index}>{log}</div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Fix Recommendations */}
                {results.migrationNeeded && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Quick Fix Needed</AlertTitle>
                    <AlertDescription className="text-blue-700">
                      Based on the diagnostic results, your contacts are in the PG Pool database but your email marketing UI is looking at the Vercel database. 
                      Click "Migrate PG Pool → Vercel" to fix this immediately.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {isLoading && (
          <Card className="mt-6">
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-lg">Running diagnostic...</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}