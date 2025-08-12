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
    const { instanceName, to, text } = await req.json()
    
    if (!instanceName || !to || !text) {
      throw new Error('Missing required fields: instanceName, to, text')
    }

    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
    
    if (!evolutionApiUrl || !evolutionApiKey) {
      throw new Error('Evolution API configuration missing')
    }

    // Format phone number (remove non-digits and ensure country code)
    const phoneNumber = to.replace(/\D/g, '')
    const formattedNumber = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`

    // Send message via Evolution API
    const response = await fetch(`${evolutionApiUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        number: `${formattedNumber}@s.whatsapp.net`,
        text: text
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Evolution API error:', errorData)
      throw new Error(`Evolution API error: ${response.status}`)
    }

    const evolutionData = await response.json()
    console.log('Message sent:', evolutionData)

    // Log to Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt)
    
    if (userError || !user) {
      throw new Error('User not authenticated')
    }

    // Get instance ID
    const { data: instance } = await supabase
      .from('instances')
      .select('id')
      .eq('name', instanceName)
      .eq('user_id', user.id)
      .single()

    if (instance) {
      // Log message
      await supabase
        .from('logs')
        .insert({
          user_id: user.id,
          instance_id: instance.id,
          level: 'message',
          message: `Mensagem enviada para ${to}`,
          data: { text, to, messageId: evolutionData.key?.id }
        })

      // Update metrics
      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase
        .from('metrics')
        .select('sent')
        .eq('instance_id', instance.id)
        .eq('date', today)
        .single()

      const newSent = (existing?.sent || 0) + 1

      await supabase
        .from('metrics')
        .upsert({
          user_id: user.id,
          instance_id: instance.id,
          date: today,
          sent: newSent
        }, {
          onConflict: 'instance_id,date'
        })
    }

    return new Response(JSON.stringify({
      success: true,
      messageId: evolutionData.key?.id,
      status: evolutionData.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})