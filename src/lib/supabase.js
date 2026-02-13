import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get public URL for storage images
export const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    
    // If it's already a full URL or emoji, return as-is
    if (imagePath.startsWith('http') || imagePath.length <= 4) {
        return imagePath
    }
    
    // Otherwise, get public URL from Supabase Storage
    const { data } = supabase.storage
        .from('juice-images')
        .getPublicUrl(imagePath)
    
    return data?.publicUrl || imagePath
}
