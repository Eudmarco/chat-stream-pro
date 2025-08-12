import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const webhookData = await req.json()
    console.log('Received webhook:', JSON.stringify(webhookData, null, 2))

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle different webhook events
    if (webhookData.event === 'connection.update') {
      const instanceName = webhookData.instance
      const state = webhookData.data?.state

      console.log(`Instance ${instanceName} state changed to:`, state)

      // Update instance status in database
      const newStatus = state === 'open' ? 'ready' : state === 'close' ? 'error' : 'pending'
      
      const { error } = await supabase
        .from('instances')
        .update({ status: newStatus })
        .eq('name', instanceName)

      if (error) {
        console.error('Error updating instance status:', error)
      }

      // Log the event
      const { data: instance } = await supabase
        .from('instances')
        .select('id, user_id')
        .eq('name', instanceName)
        .single()

      if (instance) {
        await supabase
          .from('logs')
          .insert({
            user_id: instance.user_id,
            instance_id: instance.id,
            level: 'event',
            message: `Status da conexão: ${state}`,
            data: webhookData.data
          })
      }
    }

    if (webhookData.event === 'messages.upsert') {
      const messages = webhookData.data
      const instanceName = webhookData.instance

      // Get instance info
      const { data: instance } = await supabase
        .from('instances')
        .select('id, user_id')
        .eq('name', instanceName)
        .single()

      if (instance && messages) {
        for (const message of messages) {
          const isIncoming = !message.key.fromMe
          
          if (isIncoming) {
            // Log incoming message
            await supabase
              .from('logs')
              .insert({
                user_id: instance.user_id,
                instance_id: instance.id,
                level: 'message',
                message: `Mensagem recebida de ${message.pushName || message.key.remoteJid}`,
                data: {
                  from: message.key.remoteJid,
                  text: message.message?.conversation || message.message?.extendedTextMessage?.text,
                  messageId: message.key.id,
                  timestamp: message.messageTimestamp
                }
              })
          }
        }
      }
    }

    // Forward webhook to registered webhooks
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('url')

    if (webhooks && webhooks.length > 0) {
      const promises = webhooks.map(webhook => 
        fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        }).catch(error => {
          console.error(`Error forwarding to webhook ${webhook.url}:`, error)
        })
      )

      await Promise.allSettled(promises)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})