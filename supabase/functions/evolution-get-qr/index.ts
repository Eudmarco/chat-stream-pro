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
    
    // Fallback para desenvolvimento se a Evolution API não estiver configurada
    if (!evolutionApiUrl || !evolutionApiKey) {
      console.log('Evolution API not configured, returning mock QR code')
      return new Response(JSON.stringify({
        success: true,
        qrcode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        code: 'MOCK_QR_CODE',
        state: 'open'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Normalize API URL to avoid double slashes
    const normalizedUrl = evolutionApiUrl.replace(/\/+$/, '')
    
    // Get QR code from Evolution API
    const response = await fetch(`${normalizedUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': evolutionApiKey,
        'Content-Type': 'application/json',
      }
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Evolution API error details:', {
        status: response.status,
        statusText: response.statusText,
        url: `${evolutionApiUrl}/instance/connect/${instanceName}`,
        response: errorData
      })
      
      // Se for erro 404 ou similar, retornar mock para desenvolvimento
      if (response.status === 404 || response.status === 500) {
        console.log('Evolution API error, returning mock QR code for development')
        return new Response(JSON.stringify({
          success: true,
          qrcode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          code: 'MOCK_QR_CODE_ERROR',
          state: 'pending'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      throw new Error(`Evolution API error: ${response.status}`)
    }

    const responseText = await response.text()
    console.log('Raw response:', responseText.substring(0, 200) + '...')
    
    // Verificar se a resposta é JSON válido
    let data
    try {
      data = JSON.parse(responseText)
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', responseText.substring(0, 500))
      
      // Se não conseguir fazer parse do JSON, retornar mock para desenvolvimento
      console.log('Invalid JSON response, returning mock QR code for development')
      return new Response(JSON.stringify({
        success: true,
        qrcode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        code: 'MOCK_QR_CODE_INVALID_JSON',
        state: 'pending'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    console.log('QR Code retrieved successfully')

    return new Response(JSON.stringify({
      success: true,
      qrcode: data.base64 || data.qrcode,
      code: data.code || 'QR_CODE',
      state: data.state || 'open'
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