const googleAuthService = {
  /**
   * Initialize Google OAuth
   */
  initGoogleAuth: () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.error('Google Client ID not found');
      return;
    }

    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  },

  /**
   * Handle Google Login
   */
  loginWithGoogle: () => {
    return new Promise((resolve, reject) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        reject(new Error('Google Client ID not configured'));
        return;
      }

      // Initialize Google Sign-In
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              // Send token to backend
              const res = await fetch('http://127.0.0.1:8000/api/auth/google/login/', {
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
                // Store tokens
                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);
                localStorage.setItem('user', JSON.stringify(data.user));
                resolve(data);
              } else {
                reject(new Error(data.detail || 'Google login failed'));
              }
            } catch (error) {
              reject(error);
            }
          },
        });

        // Show the One Tap dialog
        window.google.accounts.id.prompt();
      } else {
        reject(new Error('Google Sign-In not loaded'));
      }
    });
  },

  /**
   * Render Google Sign-In Button
   */
  renderGoogleButton: (elementId, onSuccess, onError) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId || !window.google) {
      console.error('Google Sign-In not available');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const res = await fetch('http://127.0.0.1:8000/api/auth/google/login/', {
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
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('user', JSON.stringify(data.user));
            if (onSuccess) onSuccess(data);
          } else {
            if (onError) onError(new Error(data.detail || 'Google login failed'));
          }
        } catch (error) {
          if (onError) onError(error);
        }
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with',
      }
    );
  },
};

export default googleAuthService;