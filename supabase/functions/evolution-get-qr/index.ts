import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('Requesting QR for instance:', instanceName)
    
    if (!evolutionApiUrl || !evolutionApiKey) {
      throw new Error('Evolution API configuration missing')
    }

    // Get QR code from Evolution API
    const response = await fetch(`${evolutionApiUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': evolutionApiKey,
      }
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Evolution API error details:', {
        status: response.status,
        statusText: response.statusText,
        url: `${evolutionApiUrl}/instance/connect/${instanceName}`,
        response: errorData
      })
      throw new Error(`Evolution API error: ${response.status}`)
    }

    const responseText = await response.text()
    console.log('Raw response:', responseText)
    
    // Verificar se a resposta é JSON válido
    let data
    try {
      data = JSON.parse(responseText)
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', responseText)
      throw new Error('Evolution API returned invalid JSON response')
    }
    console.log('QR Code retrieved:', data)

    return new Response(JSON.stringify({
      success: true,
      qrcode: data.base64,
      code: data.code,
      state: data.state
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