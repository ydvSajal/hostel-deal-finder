import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ChatDiagnostic = () => {
  const [searchParams] = useSearchParams();
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const listingId = searchParams.get('listing_id');
  const conversationId = searchParams.get('conversation_id');

  useEffect(() => {
    const runDiagnostics = async () => {
      const results: any = {
        timestamp: new Date().toISOString(),
        params: { listingId, conversationId },
        user: null,
        listing: null,
        conversation: null,
        messages: null,
        errors: []
      };

      try {
        // Check user authentication
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          results.errors.push(`User auth error: ${userError.message}`);
        } else {
          results.user = user ? { id: user.id, email: user.email } : null;
        }

        // Check listing if provided
        if (listingId && user) {
          try {
            const { data: listing, error: listingError } = await supabase
              .from('listings')
              .select('*')
              .eq('id', listingId)
              .single();
            
            if (listingError) {
              results.errors.push(`Listing error: ${listingError.message}`);
            } else {
              results.listing = listing;
            }
          } catch (error) {
            results.errors.push(`Listing fetch failed: ${error}`);
          }
        }

        // Check conversation if provided
        if (conversationId && user) {
          try {
            const { data: conversation, error: convError } = await supabase
              .from('conversations')
              .select(`
                *,
                listing:listings(title, price, seller_id)
              `)
              .eq('id', conversationId)
              .single();
            
            if (convError) {
              results.errors.push(`Conversation error: ${convError.message}`);
            } else {
              results.conversation = conversation;
              
              // Check messages
              const { data: messages, error: msgError } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })
                .limit(10);
              
              if (msgError) {
                results.errors.push(`Messages error: ${msgError.message}`);
              } else {
                results.messages = messages;
              }
            }
          } catch (error) {
            results.errors.push(`Conversation fetch failed: ${error}`);
          }
        }

      } catch (error) {
        results.errors.push(`General error: ${error}`);
      }

      setDiagnostics(results);
      setLoading(false);
    };

    runDiagnostics();
  }, [listingId, conversationId]);

  if (loading) {
    return <div className="p-4">Running diagnostics...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Chat Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Parameters</h3>
              <pre className="text-xs bg-muted p-2 rounded">
                {JSON.stringify(diagnostics.params, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold">User</h3>
              <pre className="text-xs bg-muted p-2 rounded">
                {JSON.stringify(diagnostics.user, null, 2)}
              </pre>
            </div>

            {diagnostics.listing && (
              <div>
                <h3 className="font-semibold">Listing</h3>
                <pre className="text-xs bg-muted p-2 rounded">
                  {JSON.stringify(diagnostics.listing, null, 2)}
                </pre>
              </div>
            )}

            {diagnostics.conversation && (
              <div>
                <h3 className="font-semibold">Conversation</h3>
                <pre className="text-xs bg-muted p-2 rounded">
                  {JSON.stringify(diagnostics.conversation, null, 2)}
                </pre>
              </div>
            )}

            {diagnostics.messages && (
              <div>
                <h3 className="font-semibold">Messages</h3>
                <pre className="text-xs bg-muted p-2 rounded">
                  {JSON.stringify(diagnostics.messages, null, 2)}
                </pre>
              </div>
            )}

            {diagnostics.errors.length > 0 && (
              <div>
                <h3 className="font-semibold text-destructive">Errors</h3>
                <div className="space-y-2">
                  {diagnostics.errors.map((error: string, index: number) => (
                    <div key={index} className="text-xs bg-destructive/10 text-destructive p-2 rounded">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} size="sm">
                Refresh
              </Button>
              <Button onClick={() => window.history.back()} variant="outline" size="sm">
                Back
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatDiagnostic;