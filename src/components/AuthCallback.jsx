import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    async function handleAuthCallback() {
      try {
        // Get the auth code from the URL
        const { searchParams } = new URL(window.location.href);
        
        // Check for errors in the URL parameters
        if (searchParams.get('error')) {
          navigate('/signin?error=OAuth+authentication+failed');
          return;
        }

        // Process the OAuth response
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          navigate('/signin?error=OAuth+authentication+failed');
        } else if (data?.session) {
          // Create or update user profile for Google user
          try {
            const user = data.session.user;
            
            // Check if user already has a profile
            const { data: profileData, error: profileCheckError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (profileCheckError && profileCheckError.code !== 'PGRST116') {
              // Log error but continue (don't expose specifics)
              console.error('Error checking profile');
            }
            
            // If profile doesn't exist, create it
            if (!profileData) {
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                  id: user.id,
                  name: user.user_metadata?.name || user.user_metadata?.full_name || '',
                  email: user.email,
                  avatar_url: user.user_metadata?.avatar_url || '',
                  updated_at: new Date().toISOString()
                });
                
              if (profileError) {
                console.error('Error creating profile');
              }
            }
          } catch {
            console.error('Unexpected error creating profile');
          }
          
          // Add a slight delay before redirecting to ensure the session is fully processed
          setTimeout(() => {
            // Authentication successful, redirect to home page
            navigate('/', { replace: true });
          }, 500);
        } else {
          // No session found
          navigate('/signin');
        }
      } catch {
        console.error('Error during authentication');
        navigate('/signin?error=OAuth+authentication+failed');
      }
    }

    handleAuthCallback();
  }, [navigate]);

  // Show a loading message while processing
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Processing your sign in...
        </h2>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 flex justify-center">
            <svg className="animate-spin h-10 w-10 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthCallback;
