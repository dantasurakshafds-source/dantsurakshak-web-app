// src/provider/BreadcrumbContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BreadcrumbContextType {
    rightContent: ReactNode;
    setRightContent: (content: ReactNode) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export const useBreadcrumb = () => {
    const context = useContext(BreadcrumbContext);
    if (!context) {
        throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
    }
    return context;
};

export const BreadcrumbProvider = ({ children }: { children: ReactNode }) => {
    const [rightContent, setRightContent] = useState<ReactNode>(null);

    return (
        <BreadcrumbContext.Provider value={{ rightContent, setRightContent }}>
            {children}
        </BreadcrumbContext.Provider>
    );
};
