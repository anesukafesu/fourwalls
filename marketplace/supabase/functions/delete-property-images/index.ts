import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { propertyId } = await req.json()
    
    if (!propertyId) {
      return new Response(
        JSON.stringify({ error: 'Property ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Starting deletion process for property: ${propertyId}`)

    // Get all images for this property from the images array
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('images')
      .eq('id', propertyId)
      .single()

    if (propertyError) {
      console.error('Error fetching property:', propertyError)
      return new Response(
        JSON.stringify({ error: 'Property not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Delete image files from storage
    if (property.images && property.images.length > 0) {
      console.log(`Deleting ${property.images.length} images from storage`)
      
      // Extract file paths from URLs
      const filePaths = property.images.map(url => {
        // Extract path after the bucket name from the URL
        const match = url.match(/property-images\/(.+)$/)
        return match ? match[1] : null
      }).filter(Boolean)

      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('property-images')
          .remove(filePaths)

        if (storageError) {
          console.error('Error deleting images from storage:', storageError)
        } else {
          console.log(`Successfully deleted ${filePaths.length} images from storage`)
        }
      }
    }

    // Delete from property_bookmarks
    const { error: bookmarksError } = await supabase
      .from('property_bookmarks')
      .delete()
      .eq('property_id', propertyId)

    if (bookmarksError) {
      console.error('Error deleting bookmarks:', bookmarksError)
    } else {
      console.log('Successfully deleted property bookmarks')
    }

    // Delete from property_images
    const { error: propertyImagesError } = await supabase
      .from('property_images')
      .delete()
      .eq('property_id', propertyId)

    if (propertyImagesError) {
      console.error('Error deleting property images entries:', propertyImagesError)
    } else {
      console.log('Successfully deleted property images entries')
    }

    // Delete from property_views
    const { error: viewsError } = await supabase
      .from('property_views')
      .delete()
      .eq('property_id', propertyId)

    if (viewsError) {
      console.error('Error deleting property views:', viewsError)
    } else {
      console.log('Successfully deleted property views')
    }

    // Finally, delete the property itself
    const { error: deleteError } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)

    if (deleteError) {
      console.error('Error deleting property:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Failed to delete property' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully completed deletion process for property: ${propertyId}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Property and all associated data deleted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})