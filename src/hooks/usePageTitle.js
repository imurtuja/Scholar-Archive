import { useEffect } from 'react';

/**
 * Custom hook to set dynamic page titles
 * @param {string} title - The page-specific title
 * @param {string} suffix - Optional suffix (defaults to ScholarArchive)
 */
const usePageTitle = (title, suffix = 'ScholarArchive by Murtuja') => {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = title ? `${title} | ${suffix}` : suffix;

        // Cleanup: restore previous title when component unmounts
        return () => {
            document.title = previousTitle;
        };
    }, [title, suffix]);
};

export default usePageTitle;
