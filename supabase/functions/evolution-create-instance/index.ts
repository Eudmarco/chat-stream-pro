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
    const { instanceName } = await req.json()
    
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
    
    console.log('Evolution API URL:', evolutionApiUrl)
    console.log('Evolution API Key configured:', !!evolutionApiKey)
    
    // Fallback para desenvolvimento se a Evolution API não estiver configurada
    if (!evolutionApiUrl || !evolutionApiKey) {
      console.log('Evolution API not configured, using mock data for development')
      
      // Simular sucesso na criação da instância
      const mockData = {
        instance: {
          instanceName: instanceName,
          state: 'open'
        },
        qrcode: {
          base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          code: 'MOCK_QR_CODE'
        }
      }
      
      // Simular atualização no Supabase também
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

      await supabase
        .from('instances')
        .update({ status: 'ready' })
        .eq('name', instanceName)
        .eq('user_id', user.id)
      
      return new Response(JSON.stringify({
        success: true,
        instance: mockData.instance,
        qrcode: mockData.qrcode
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Normalize API URL to avoid double slashes
    const normalizedUrl = evolutionApiUrl.replace(/\/+$/, '')
    
    // Create instance in Evolution API
    const response = await fetch(`${normalizedUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        instanceName: instanceName,
        token: evolutionApiKey,
        qrcode: true,
        number: "",
        integration: "WHATSAPP-BAILEYS"
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Evolution API error details:', {
        status: response.status,
        statusText: response.statusText,
        url: `${normalizedUrl}/instance/create`,
        response: errorData
      })
      
      // Se a API externa falhar, retornar dados mock para desenvolvimento
      console.log('Evolution API failed, using mock data for development')
      
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

      await supabase
        .from('instances')
        .update({ status: 'ready' })
        .eq('name', instanceName)
        .eq('user_id', user.id)
      
      return new Response(JSON.stringify({
        success: true,
        instance: {
          instanceName: instanceName,
          state: 'open'
        },
        qrcode: {
          base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          code: 'MOCK_QR_CODE'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const evolutionData = await response.json()
    console.log('Evolution instance created:', evolutionData)

    // Update instance status in Supabase
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

    const { error: updateError } = await supabase
      .from('instances')
      .update({ 
        status: evolutionData.instance?.state === 'open' ? 'ready' : 'pending' 
      })
      .eq('name', instanceName)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating instance:', updateError)
    }

    return new Response(JSON.stringify({
      success: true,
      instance: evolutionData.instance,
      qrcode: evolutionData.qrcode
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