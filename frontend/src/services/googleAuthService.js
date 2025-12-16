const googleAuthService = {
  /**
   * Initialize Google OAuth
   */
  initGoogleAuth: () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error('Google Client ID not found');
      return Promise.reject(new Error('Google Client ID not found'));
    }

    console.log('🔧 Initializing Google Auth...');
    console.log('📍 Current Origin:', window.location.origin);
    console.log('🔑 Client ID:', clientId.substring(0, 20) + '...');

    return new Promise((resolve, reject) => {
      if (window.google) {
        console.log('✅ Google script already loaded');
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('✅ Google script loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Failed to load Google script');
        reject(new Error('Failed to load Google script'));
      };
      document.body.appendChild(script);
    });
  },

  /**
   * Render Google Sign-In Button (Primary Method)
   * This is the most reliable way to implement Google Sign-In
   */
  renderGoogleButton: (elementId, onSuccess, onError) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    console.log('🎨 Rendering Google Button...');
    console.log('📍 Element ID:', elementId);

    if (!clientId) {
      console.error('❌ No Client ID');
      if (onError) onError(new Error('Client ID missing'));
      return false;
    }

    if (!window.google) {
      console.error('❌ Google not loaded');
      if (onError) onError(new Error('Google not loaded'));
      return false;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          console.log('✅ Got credential from button click');
          try {
            console.log('📤 Sending to backend...');
            const res = await fetch(`${apiUrl}/auth/google/login/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id_token: response.credential,
              }),
            });

            const data = await res.json();

            if (res.ok) {
              console.log('✅ Login successful!');
              localStorage.setItem('access_token', data.access);
              localStorage.setItem('refresh_token', data.refresh);
              localStorage.setItem('user', JSON.stringify(data.user));
              if (onSuccess) onSuccess(data);
            } else {
              console.error('❌ Backend error:', data);
              if (onError) onError(new Error(data.error || data.detail || 'Login failed'));
            }
          } catch (error) {
            console.error('❌ Network error:', error);
            if (onError) onError(error);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const element = document.getElementById(elementId);
      if (!element) {
        console.error('❌ Element not found:', elementId);
        if (onError) onError(new Error('Element not found'));
        return false;
      }

      // Render the button
      window.google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        width: element.offsetWidth || 400,
        logo_alignment: 'left',
      });

      console.log('✅ Button rendered successfully!');
      return true;
    } catch (error) {
      console.error('❌ Render error:', error);
      if (onError) onError(error);
      return false;
    }
  },
};

export default googleAuthService;