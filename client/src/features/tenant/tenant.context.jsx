import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getTenantSubdomain, isPlatformHost } from '@/lib/tenant';
import { getApiBaseUrl } from '@/lib/utils';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [slug, setSlug] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const detectedSlug = getTenantSubdomain();

    if (!detectedSlug) {
      if (isMounted) {
        setSlug(null);
        setTenant(null);
        setIsNotFound(false);
        setIsLoading(false);
      }
      return;
    }

    setSlug(detectedSlug);

    async function loadTenantConfig() {
      try {
        const baseURL = getApiBaseUrl();
        const headers = {};
        if (detectedSlug) {
          headers['X-Tenant-Subdomain'] = detectedSlug;
        }
        const response = await axios.get(`${baseURL}/public/tenant/current`, {
          params: { slug: detectedSlug },
          headers,
          withCredentials: true,
          timeout: 45000,
        });

        if (isMounted) {
          const tenantData = response.data?.data;
          if (tenantData) {
            setTenant(tenantData);
            setIsNotFound(false);
          } else {
            setIsNotFound(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          // If 404 returned from public endpoint, mark tenant as not found
          if (err.response?.status === 404 || err.response?.data?.code === 'TENANT_NOT_FOUND') {
            setIsNotFound(true);
          } else {
            // For other unexpected network errors on tenant fetch, treat as not found or display error
            setIsNotFound(true);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTenantConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = {
    tenant,
    slug,
    isPlatformHost: isPlatformHost(),
    isNotFound,
    isLoading,
    error,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    return {
      tenant: null,
      slug: null,
      isPlatformHost: true,
      isNotFound: false,
      isLoading: false,
      error: null,
    };
  }
  return context;
}

export default TenantContext;
