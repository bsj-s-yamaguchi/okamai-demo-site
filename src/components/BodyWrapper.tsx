'use client';

import { useEffect } from 'react';

export default function BodyWrapper({
  children,
}: { children: React.ReactNode }) {
  useEffect(() => {
    // Remove browser extension attributes that cause hydration mismatch
    const removeExtensionAttributes = () => {
      const body = document.body;
      const attributesToRemove = [
        'cz-shortcut-listen',
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
      ];

      attributesToRemove.forEach((attr) => {
        if (body.hasAttribute(attr)) {
          body.removeAttribute(attr);
        }
      });
    };

    // Initial removal
    removeExtensionAttributes();

    // Set up MutationObserver to continuously remove attributes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.target === document.body
        ) {
          removeExtensionAttributes();
        }
      });
    });

    // Start observing
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [
        'cz-shortcut-listen',
        'data-new-gr-c-s-check-loaded',
        'data-gr-ext-installed',
      ],
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);

  return <>{children}</>;
}
