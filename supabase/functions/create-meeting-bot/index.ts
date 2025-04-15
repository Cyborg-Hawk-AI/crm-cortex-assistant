
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract input data from request
    const { meetingUrl, meetingName, userId } = await req.json();

    if (!meetingUrl || !meetingName) {
      throw new Error('Missing required fields');
    }

    // Call Recall.ai API
    const response = await fetch('https://us-west-2.recall.ai/api/v1/bot', {
      method: 'POST',
      headers: {
        'Authorization': `Token 8c0933578c0fbc870e520b43432b392aba8c3da9`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meeting_url: meetingUrl,
        bot_name: "action.it",
        recording_config: {
          transcription: true,
          meeting_captions: true
        },
        output_media: null,
        metadata: {
          user_id: userId,
          meeting_name: meetingName,
          app: "action.it"
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Recall API error:', error);
      throw new Error(`Recall API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Recall API response:', data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
